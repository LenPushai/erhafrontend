import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  LayoutDashboard, FileText, Briefcase, Users, TrendingUp,
  AlertTriangle, Clock, CheckCircle, DollarSign, Activity,
  Eye, Plus, RefreshCw, Lightbulb, ArrowRight, Zap
} from 'lucide-react'
import { EmergencyJobModal } from '../components/EmergencyJobModal'
import { CreateJobModal } from '../components/CreateJobModal'

interface DashboardStats {
  totalRfqs: number
  newRfqs: number
  activeJobs: number
  urgentJobs: number
  pendingQuotes: number
  submittedQuotes: number
  totalValue: number
}

interface FinancialOverview {
  invoiced: number
  pending: number
  pipeline: number
}

interface AIInsights {
  expiringQuotes: number
  conversionRate: number
  urgentJobs: number
  topClient: string
  topClientValue: number
}

interface ActivityItem {
  id: string
  user_name: string
  action_type: string
  entity_type: string
  entity_reference: string
  description: string
  created_at: string
}

export function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalRfqs: 0, newRfqs: 0, activeJobs: 0, urgentJobs: 0,
    pendingQuotes: 0, submittedQuotes: 0, totalValue: 0
  })
  const [financial, setFinancial] = useState<FinancialOverview>({
    invoiced: 0, pending: 0, pipeline: 0
  })
  const [insights, setInsights] = useState<AIInsights>({
    expiringQuotes: 0, conversionRate: 0, urgentJobs: 0, topClient: '', topClientValue: 0
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [showCreateJobModal, setShowCreateJobModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)

    // Fetch RFQ stats
    const { data: rfqs } = await supabase.from('rfqs').select('id, status, quote_value')
    const totalRfqs = rfqs?.length || 0
    const newRfqs = rfqs?.filter(r => r.status === 'DRAFT' || r.status === 'NEW').length || 0
    const pendingQuotes = rfqs?.filter(r => r.status === 'PENDING').length || 0
    const submittedQuotes = rfqs?.filter(r => r.status === 'SENT').length || 0

    // Fetch Job stats
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, status, priority, quoted_value, invoice_value, is_child_job')
      .or('is_child_job.is.null,is_child_job.eq.false')
    
    const activeJobs = jobs?.filter(j => j.status === 'IN_PROGRESS').length || 0
    const urgentJobs = jobs?.filter(j => 
      (j.priority === 'URGENT' || j.priority === 'CRITICAL') && 
      j.status !== 'COMPLETED' && j.status !== 'INVOICED'
    ).length || 0
    const totalValue = jobs?.reduce((sum, j) => sum + (j.quoted_value || 0), 0) || 0

    // Financial Overview
    const invoiced = jobs?.filter(j => j.status === 'INVOICED')
      .reduce((sum, j) => sum + (j.invoice_value || j.quoted_value || 0), 0) || 0
    const pending = jobs?.filter(j => ['PENDING', 'IN_PROGRESS', 'ON_HOLD'].includes(j.status))
      .reduce((sum, j) => sum + (j.quoted_value || 0), 0) || 0
    const pipeline = jobs?.filter(j => !['INVOICED', 'CANCELLED', 'COMPLETED'].includes(j.status))
      .reduce((sum, j) => sum + (j.quoted_value || 0), 0) || 0

    // AI Insights
    const { data: expiringRfqs } = await supabase
      .from('rfqs')
      .select('id')
      .eq('status', 'SENT')
      .gte('valid_until', new Date().toISOString().split('T')[0])
      .lte('valid_until', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    
    const sentRfqs = rfqs?.filter(r => ['SENT', 'ACCEPTED', 'REJECTED'].includes(r.status)).length || 0
    const acceptedRfqs = rfqs?.filter(r => r.status === 'ACCEPTED').length || 0
    const conversionRate = sentRfqs > 0 ? Math.round((acceptedRfqs / sentRfqs) * 100) : 0

    // Top Client
    const clientCounts: Record<string, { count: number, value: number }> = {}
    jobs?.forEach(j => {
      if (j.client_name) {
        if (!clientCounts[j.client_name]) {
          clientCounts[j.client_name] = { count: 0, value: 0 }
        }
        clientCounts[j.client_name].count++
        clientCounts[j.client_name].value += j.quoted_value || 0
      }
    })
    const topClientEntry = Object.entries(clientCounts).sort((a, b) => b[1].value - a[1].value)[0]
    const topClient = topClientEntry ? topClientEntry[0] : '-'
    const topClientValue = topClientEntry ? topClientEntry[1].value : 0

    // Recent Activity
    const { data: activityData } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    setStats({ totalRfqs, newRfqs, activeJobs, urgentJobs, pendingQuotes, submittedQuotes, totalValue })
    setFinancial({ invoiced, pending, pipeline })
    setInsights({ 
      expiringQuotes: expiringRfqs?.length || 0, 
      conversionRate, 
      urgentJobs,
      topClient,
      topClientValue
    })
    setActivities(activityData || [])
    setLoading(false)
  }

  const quickActions = [
    { label: 'View RFQs', icon: FileText, path: '/rfqs', color: 'text-blue-600' },
    { label: 'View Jobs', icon: Briefcase, path: '/jobs', color: 'text-green-600' },
    { label: 'View Clients', icon: Users, path: '/clients', color: 'text-purple-600' },
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R${(value / 1000).toFixed(0)}K`
    return `R${value}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATED': return <Plus size={14} className="text-green-500" />
      case 'UPDATED': return <RefreshCw size={14} className="text-blue-500" />
      case 'STATUS_CHANGE': return <Activity size={14} className="text-orange-500" />
      case 'DELETED': return <AlertTriangle size={14} className="text-red-500" />
      default: return <Activity size={14} className="text-gray-500" />
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={18} /> Create Job
          </button>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            <AlertTriangle size={18} /> Emergency Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRfqs}</p>
              <p className="text-sm text-gray-500">Total RFQs</p>
              {stats.newRfqs > 0 && (
                <p className="text-xs text-blue-600 mt-1">{stats.newRfqs} new/draft</p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
              {stats.urgentJobs > 0 && (
                <p className="text-xs text-red-600 mt-1">{stats.urgentJobs} urgent</p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Briefcase size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingQuotes}</p>
              <p className="text-sm text-gray-500">Pending Quotes</p>
              {stats.submittedQuotes > 0 && (
                <p className="text-xs text-orange-600 mt-1">{stats.submittedQuotes} submitted</p>
              )}
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-xs text-gray-400 mt-1">Active pipeline</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-800">AI Insights</h3>
          <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Powered by PUSH AI</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-600">Expiring Quotes</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{insights.expiringQuotes} this week</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">Conversion Rate</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{insights.conversionRate}%</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-red-500" />
              <span className="text-sm text-gray-600">Urgent Jobs</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{insights.urgentJobs}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-500" />
              <span className="text-sm text-gray-600">Top Client</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{insights.topClient || '-'}</p>
            {insights.topClientValue > 0 && (
              <p className="text-xs text-gray-500">{formatCurrency(insights.topClientValue)}</p>
            )}
          </div>
        </div>
        {insights.conversionRate === 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2">
            <Lightbulb size={14} />
            <span>Quote conversion at 0% - review pricing strategy or follow up on sent quotes</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={action.color} />
                    <span className="text-gray-700">{action.label}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <button 
              onClick={fetchDashboardData}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Actions will appear here as you use the system</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="mt-1">{getActivityIcon(activity.action_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.user_name}</span>
                      {' '}{activity.description || `${activity.action_type.toLowerCase()} ${activity.entity_type.toLowerCase()}`}
                      {activity.entity_reference && (
                        <span className="text-blue-600 font-medium"> {activity.entity_reference}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Financial Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financial.invoiced)}</p>
            <p className="text-sm text-gray-500">Invoiced</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-2">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financial.pending)}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-2">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financial.pipeline)}</p>
            <p className="text-sm text-gray-500">Pipeline</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Backend API: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Database: Online ({stats.totalRfqs} RFQs, {stats.activeJobs + stats.urgentJobs} Jobs)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Last sync: Just now</span>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center mt-8 text-gray-500">
        <p className="italic">"Commit to the LORD whatever you do, and he will establish your plans."</p>
        <p className="text-sm">Proverbs 16:3</p>
      </div>

      {/* Modals */}
      <EmergencyJobModal
        show={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        onSuccess={() => {
          setShowEmergencyModal(false)
          fetchDashboardData()
        }}
      />

      <CreateJobModal
        show={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        onSuccess={() => {
          setShowCreateJobModal(false)
          fetchDashboardData()
        }}
      />
    </div>
  )
}

export default Dashboard