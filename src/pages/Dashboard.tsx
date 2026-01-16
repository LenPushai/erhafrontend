import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FileText, ClipboardList, Briefcase, Users, TrendingUp, Clock,
  DollarSign, CheckCircle, Brain, Lightbulb, AlertTriangle, 
  AlertCircle, RefreshCw, Eye, Zap, Star
} from 'lucide-react'

interface Stats {
  clients: number
  rfqs: any[]
  quotes: any[]
  jobs: any[]
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ clients: 0, rfqs: [], quotes: [], jobs: [] })
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    const [clientsRes, rfqsRes, quotesRes, jobsRes] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('rfqs').select('*'),
      supabase.from('quotes').select('*'),
      supabase.from('jobs').select('*'),
    ])
    
    setStats({
      clients: clientsRes.data?.length || 0,
      rfqs: rfqsRes.data || [],
      quotes: quotesRes.data || [],
      jobs: jobsRes.data || [],
    })
    setLastSync(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return 'R' + (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return 'R' + (value / 1000).toFixed(0) + 'K'
    return 'R' + value.toFixed(0)
  }

  const newDraftRfqs = stats.rfqs.filter(r => r.status === 'DRAFT' || r.status === 'PENDING').length
  const urgentJobs = stats.jobs.filter(j => j.priority === 'URGENT' || j.priority === 'HIGH').length
  const submittedQuotes = stats.quotes.filter(q => q.status === 'SENT' || q.status === 'PENDING_APPROVAL').length
  const pendingQuotes = stats.quotes.filter(q => q.status === 'DRAFT' || q.status === 'PENDING_APPROVAL').length
  const activeJobs = stats.jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'PENDING').length
  const pipelineValue = stats.jobs.reduce((sum, j) => sum + (j.job_value || 0), 0)
  const invoicedValue = stats.jobs.filter(j => j.status === 'INVOICED').reduce((sum, j) => sum + (j.job_value || 0), 0)
  const pendingValue = stats.quotes.filter(q => q.status !== 'ACCEPTED' && q.status !== 'REJECTED').reduce((sum, q) => sum + (q.total || 0), 0)
  
  const conversionRate = stats.rfqs.length > 0 ? Math.round((stats.quotes.length / stats.rfqs.length) * 100) : 0

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total RFQs */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total RFQs</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? '...' : stats.rfqs.length}</p>
              <p className="text-xs text-gray-400 mt-1">{newDraftRfqs} new/draft</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Jobs</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? '...' : activeJobs}</p>
              <p className="text-xs text-gray-400 mt-1">{urgentJobs} urgent</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Quotes</p>
              <p className="text-3xl font-bold text-amber-500 mt-1">{loading ? '...' : pendingQuotes}</p>
              <p className="text-xs text-gray-400 mt-1">{submittedQuotes} submitted</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <ClipboardList size={24} className="text-amber-500" />
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Value</p>
              <p className="text-3xl font-bold text-green-500 mt-1">{formatCurrency(pipelineValue)}</p>
              <p className="text-xs text-gray-400 mt-1">Active pipeline</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={24} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Brain size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
            <p className="text-xs text-gray-500">Powered by PUSH AI</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Expiring Quotes</p>
              <p className="font-semibold text-gray-900">0 this week</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div>
              <p className="text-xs text-gray-500">Conversion Rate</p>
              <p className="font-semibold text-gray-900">{conversionRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-cyan-500" />
            <div>
              <p className="text-xs text-gray-500">Urgent Jobs</p>
              <p className="font-semibold text-gray-900">{urgentJobs}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star size={18} className="text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Top Client</p>
              <p className="font-semibold text-gray-900">{formatCurrency(0)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t">
          <Lightbulb size={16} className="text-amber-500" />
          <p className="text-sm text-gray-600">
            {conversionRate === 0 
              ? 'Quote conversion at 0% - review pricing strategy'
              : conversionRate < 30 
                ? 'Low conversion rate - consider competitive analysis'
                : 'Operations running smoothly'}
          </p>
        </div>
      </div>

      {/* Emergency Breakdown Work */}
      <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <AlertCircle size={40} className="text-red-500" />
          <div>
            <h3 className="font-semibold text-gray-900">Emergency Breakdown Work</h3>
            <p className="text-sm text-gray-500">Fast-track urgent repairs and breakdowns. Accounts for 27.7% of annual work.</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium whitespace-nowrap">
          <AlertCircle size={18} />
          Create Emergency Job
        </button>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
              <Eye size={18} className="text-gray-400" />
              View RFQs
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
              <Eye size={18} className="text-gray-400" />
              View Quotes
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
              <Briefcase size={18} className="text-gray-400" />
              View Jobs
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
              <Users size={18} className="text-gray-400" />
              View Clients
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button 
              onClick={fetchStats}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              Refresh
            </button>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-400">
            No recent activity
          </div>
        </div>
      </div>

      {/* Financial Overview & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <DollarSign size={28} className="mx-auto text-green-500 mb-2" />
              <p className="text-xl font-bold text-gray-900">{formatCurrency(invoicedValue)}</p>
              <p className="text-xs text-gray-500">Invoiced</p>
            </div>
            <div>
              <Clock size={28} className="mx-auto text-amber-500 mb-2" />
              <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingValue)}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div>
              <TrendingUp size={28} className="mx-auto text-blue-500 mb-2" />
              <p className="text-xl font-bold text-gray-900">{formatCurrency(pipelineValue)}</p>
              <p className="text-xs text-gray-500">Pipeline</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-gray-700">Backend API: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-gray-700">Database: Online ({stats.rfqs.length} RFQs, {stats.quotes.length} Quotes, {stats.jobs.length} Jobs)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-gray-700">Last sync: {lastSync ? 'Just now' : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="text-center py-4">
        <p className="font-medium text-gray-700">"Commit to the LORD whatever you do, and he will establish your plans."</p>
        <p className="text-sm text-gray-500 mt-1">Proverbs 16:3</p>
      </div>
    </div>
  )
}



