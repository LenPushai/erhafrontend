import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Search, Eye, Edit2, Trash2, Plus, Printer,
  Briefcase, AlertTriangle, Clock, CheckCircle, 
  DollarSign, Filter, MoreVertical, FileText
} from 'lucide-react'
import { CreateJobModal } from '../components/CreateJobModal'
import { CreateStandaloneJobModal } from '../components/CreateStandaloneJobModal'
import { PrintJobCard } from '../components/PrintJobCard'

interface Job {
  id: string
  job_number: string
  client_id: string | null
  client_name: string | null
  rfq_id: string | null
  rfq_number: string | null
  description: string | null
  job_type: string
  priority: string
  status: string
  due_date: string | null
  job_value: number | null
  assigned_employee_name: string | null
  is_emergency: boolean
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'IN_PROGRESS': { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Briefcase },
  'COMPLETED': { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'INVOICED': { label: 'Invoiced', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
  'ON_HOLD': { label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'LOW': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'MEDIUM': { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  'HIGH': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'URGENT': { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export function JobsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [clients, setClients] = useState<any[]>([])

  // Modals
  const [showCreateFromRfq, setShowCreateFromRfq] = useState(false)
  const [showCreateStandalone, setShowCreateStandalone] = useState(false)
  const [rfqForJob, setRfqForJob] = useState<any>(null)
  const [rfqLineItems, setRfqLineItems] = useState<any[]>([])
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  
  // Print
  const [printJob, setPrintJob] = useState<Job | null>(null)

  // Stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'PENDING').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
    emergency: jobs.filter(j => j.is_emergency).length,
    totalValue: jobs.reduce((sum, j) => sum + (j.job_value || 0), 0)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle incoming RFQ data for job creation
  useEffect(() => {
    if (location.state?.createFromRfq) {
      const rfqData = location.state.createFromRfq
      setRfqForJob(rfqData.rfq)
      setRfqLineItems(rfqData.lineItems || [])
      setShowCreateFromRfq(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const fetchData = async () => {
    setLoading(true)
    const [jobsRes, clientsRes] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setJobs(jobsRes.data || [])
    setClients(clientsRes.data || [])
    setLoading(false)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleJobCreated = (job: any) => {
    fetchData()
    setShowCreateFromRfq(false)
    setShowCreateStandalone(false)
    setPrintJob(job) // Show print option
  }

  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Delete job ${job.job_number}? This cannot be undone.`)) return
    await supabase.from('jobs').delete().eq('id', job.id)
    fetchData()
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return `R ${value.toLocaleString()}`
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-ZA')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
          <p className="text-gray-500">Manage workshop jobs and job cards</p>
        </div>
        
        {/* Create Job Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} /> Create Job
          </button>
          
          {showCreateMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-20">
                <button
                  onClick={() => {
                    setShowCreateStandalone(true)
                    setShowCreateMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">New Job</p>
                    <p className="text-xs text-gray-500">Contract/Direct work</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigate('/rfqs')
                    setShowCreateMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium">From RFQ</p>
                    <p className="text-xs text-gray-500">Create from accepted quote</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.emergency}</p>
              <p className="text-xs text-gray-500">Emergency</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-lg font-bold">R{(stats.totalValue/1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p>No jobs found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map(job => {
                const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG['PENDING']
                const priorityConfig = PRIORITY_CONFIG[job.priority] || PRIORITY_CONFIG['MEDIUM']
                const StatusIcon = statusConfig.icon
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {job.is_emergency && <AlertTriangle className="text-red-500" size={16} />}
                        <span className="font-mono font-bold text-blue-600">{job.job_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{job.client_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{job.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${job.job_type === 'CONTRACT' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                        {job.job_type || 'QUOTED'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(job.due_date)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(job.job_value)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setPrintJob(job)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="Print Job Card"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create from RFQ Modal */}
      {showCreateFromRfq && rfqForJob && (
        <CreateJobModal
          isOpen={showCreateFromRfq}
          onClose={() => setShowCreateFromRfq(false)}
          rfq={rfqForJob}
          rfqLineItems={rfqLineItems}
          clients={clients}
          onJobCreated={handleJobCreated}
        />
      )}

      {/* Create Standalone Job Modal */}
      {showCreateStandalone && (
        <CreateStandaloneJobModal
          isOpen={showCreateStandalone}
          onClose={() => setShowCreateStandalone(false)}
          clients={clients}
          onJobCreated={handleJobCreated}
        />
      )}

      {/* Print Job Card */}
      {printJob && (
        <PrintJobCard
          job={printJob}
          onClose={() => setPrintJob(null)}
        />
      )}
    </div>
  )
}

export default JobsPage