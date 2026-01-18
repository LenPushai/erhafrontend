import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Search, Eye, Edit2, Trash2, Plus,
  Briefcase, AlertTriangle, Clock, CheckCircle, DollarSign
} from 'lucide-react'
import { JobDetailPage } from './JobDetailPage'
import { JobEditPage } from './JobEditPage'
import { AddChildJobModal } from '../components/AddChildJobModal'
import { CreateJobModal } from '../components/CreateJobModal'
import jobService from '../services/jobService'

type ViewMode = 'list' | 'detail' | 'edit'

interface Job {
  id: string
  job_number: string
  client_id: string | null
  client_name: string | null
  rfq_id: string | null
  rfq_number: string | null
  description: string | null
  job_type: string
  job_category: string | null
  priority: string
  status: string
  site_location: string | null
  contact_person: string | null
  contact_phone: string | null
  quoted_value: number | null
  start_date: string | null
  due_date: string | null
  completed_date: string | null
  is_emergency: boolean
  is_child_job: boolean
  parent_job_id: string | null
  job_phase: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  'IN_PROGRESS': { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  'ON_HOLD': { label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  'COMPLETED': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'INVOICED': { label: 'Invoiced', color: 'bg-purple-100 text-purple-800' },
  'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'LOW': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'NORMAL': { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  'HIGH': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'URGENT': { label: 'Urgent', color: 'bg-red-100 text-red-700' },
  'CRITICAL': { label: 'Critical', color: 'bg-red-600 text-white' },
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showChildJobs, setShowChildJobs] = useState(false)
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  
  // Modals
  const [showCreateJobModal, setShowCreateJobModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [parentJobForChild, setParentJobForChild] = useState<{ id: string; number: string } | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setJobs(data)
    }
    setLoading(false)
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    const matchesChildFilter = showChildJobs || !job.is_child_job
    
    return matchesSearch && matchesStatus && matchesChildFilter
  })

  // Stats
  const stats = {
    total: jobs.filter(j => !j.is_child_job).length,
    pending: jobs.filter(j => j.status === 'PENDING' && !j.is_child_job).length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS' && !j.is_child_job).length,
    completed: jobs.filter(j => (j.status === 'COMPLETED' || j.status === 'INVOICED') && !j.is_child_job).length,
    emergency: jobs.filter(j => j.is_emergency && !j.is_child_job).length,
    totalValue: jobs.filter(j => !j.is_child_job).reduce((sum, j) => sum + (j.quoted_value || 0), 0)
  }

  // Handlers
  const handleView = (jobId: string) => {
    setSelectedJobId(jobId)
    setViewMode('detail')
  }

  const handleEdit = (jobId: string) => {
    setSelectedJobId(jobId)
    setViewMode('edit')
  }

  const handleAddChildJob = (parentJobId: string) => {
    const job = jobs.find(j => j.id === parentJobId)
    if (job) {
      setParentJobForChild({ id: parentJobId, number: job.job_number })
      setShowAddChildModal(true)
    }
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedJobId(null)
    fetchJobs()
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    await supabase.from('jobs').delete().eq('id', jobId)
    fetchJobs()
  }

  // Render Detail or Edit page
  if (viewMode === 'detail' && selectedJobId) {
    return (
      <JobDetailPage
        jobId={selectedJobId}
        onBack={handleBackToList}
        onEdit={handleEdit}
        onAddChildJob={handleAddChildJob}
        onViewChildJob={handleView}
      />
    )
  }

  if (viewMode === 'edit' && selectedJobId) {
    return (
      <JobEditPage
        jobId={selectedJobId}
        onBack={() => setViewMode('detail')}
        onSave={() => {
          setViewMode('detail')
          fetchJobs()
        }}
      />
    )
  }

  // Render List View
  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.emergency}</p>
              <p className="text-sm text-gray-500">Emergency</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">R{(stats.totalValue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowCreateJobModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
        >
          <Plus size={18} /> Create Job
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showChildJobs}
              onChange={(e) => setShowChildJobs(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">Show Child Jobs</span>
          </label>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Job Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Value</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading jobs...
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const statusConfig = STATUS_CONFIG[job.status] || { label: job.status, color: 'bg-gray-100' }
                  const priorityConfig = PRIORITY_CONFIG[job.priority] || { label: job.priority, color: 'bg-gray-100' }
                  
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {job.is_child_job && (
                            <span className="text-gray-400 ml-4">↳</span>
                          )}
                          <span className="font-medium text-gray-900">{job.job_number}</span>
                          {job.is_emergency && (
                            <AlertTriangle size={14} className="text-red-500" />
                          )}
                        </div>
                        {job.job_phase && (
                          <span className="text-xs text-indigo-600">{job.job_phase}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{job.client_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{job.description || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.is_emergency ? 'bg-red-100 text-red-700' : 
                          job.job_category ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.job_category || job.job_type || 'STANDARD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{job.due_date || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {job.quoted_value ? `R ${job.quoted_value.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(job.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(job.id)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!job.is_child_job && (
                            <button
                              onClick={() => handleAddChildJob(job.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Add Child Job"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        show={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        onSuccess={() => {
          setShowCreateJobModal(false)
          fetchJobs()
        }}
      />

      {/* Add Child Job Modal */}
      {parentJobForChild && (
        <AddChildJobModal
          show={showAddChildModal}
          parentJobId={parentJobForChild.id}
          parentJobNumber={parentJobForChild.number}
          onClose={() => {
            setShowAddChildModal(false)
            setParentJobForChild(null)
          }}
          onSuccess={() => {
            fetchJobs()
          }}
        />
      )}
    </div>
  )
}

export default JobsPage