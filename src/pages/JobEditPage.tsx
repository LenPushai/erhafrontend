import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  ArrowLeft, Save, Plus, Trash2, Clock, CheckCircle, AlertTriangle,
  FileText, Wrench, Paintbrush, Scissors, Settings, Truck, Package,
  User, Calendar, ClipboardCheck
} from 'lucide-react'

interface Job {
  id: string
  job_number: string
  job_card_no: string | null
  client_id: string | null
  client_name: string | null
  contact_person: string | null
  contact_phone: string | null
  contact_email: string | null
  description: string | null
  site_location: string | null
  site_req: string | null
  is_contract_work: boolean
  is_quoted_work: boolean
  compiled_by: string | null
  // Actions Required
  action_manufacture: boolean
  action_sandblast: boolean
  action_prepare_material: boolean
  action_service: boolean
  action_paint: boolean
  action_other: boolean
  action_other_description: string | null
  action_repair: boolean
  action_installation: boolean
  action_cut: boolean
  action_modify: boolean
  // Attached Documents
  has_service_schedule: boolean
  has_drawing: boolean
  has_internal_order: boolean
  has_info_for_quote: boolean
  has_qcp: boolean
  has_list_as_quoted: boolean
  // Planning
  date_received: string | null
  material_ordered_date: string | null
  completion_date: string | null
  due_date: string | null
  supervisor_signature: string | null
  employee_signature: string | null
  // Standard fields
  status: string
  priority: string
  job_type: string
  job_category: string | null
  is_emergency: boolean
  quoted_value: number | null
  rfq_number: string | null
  po_number: string | null
  special_requirements: string | null
  assigned_supervisor: string | null
  // ENQ Report Fields
  drawing_number: string | null
  media_received: string | null
  department: string | null
  operating_entity: string | null
  order_number: string | null
  job_value: number | null
  estimated_hours: number | null
}

interface LineItem {
  id: string
  item_type: string
  description: string
  specification: string
  worker_type: string
  quantity: number
  uom: string
  cost_price: number
  sell_price: number
  line_total: number
}

interface HoldingPoint {
  id: string
  point_number: number
  description: string
  is_applicable: boolean
  is_passed: boolean | null
  signed_by: string | null
  signed_date: string | null
  notes: string | null
}

interface TimeEntry {
  id: string
  employee_name: string
  week_start_date: string
  description: string
  mon_nt: number; mon_ot: number
  tue_nt: number; tue_ot: number
  wed_nt: number; wed_ot: number
  thu_nt: number; thu_ot: number
  fri_nt: number; fri_ot: number
  sat_nt: number; sat_ot: number
  sun_nt: number; sun_ot: number
  total_nt: number
  total_ot: number
}

interface JobEditPageProps {
  jobId?: string
  onBack?: () => void
  onSave?: () => void
}

const ITEM_TYPES = [
  { value: 'MATERIAL', label: 'Material', color: 'bg-blue-500' },
  { value: 'LABOUR', label: 'Labour', color: 'bg-green-500' },
  { value: 'CONSUMABLES', label: 'Consumables', color: 'bg-yellow-500' },
  { value: 'TRANSPORT', label: 'Transport', color: 'bg-purple-500' },
  { value: 'EQUIPMENT', label: 'Equipment', color: 'bg-orange-500' },
  { value: 'SUBCONTRACT', label: 'Subcontract', color: 'bg-red-500' },
]

const WORKER_TYPES = [
  { value: 'WELDER', label: 'Welder', rate: 450 },
  { value: 'FITTER', label: 'Fitter', rate: 400 },
  { value: 'BOILERMAKER', label: 'Boilermaker', rate: 500 },
  { value: 'ELECTRICIAN', label: 'Electrician', rate: 480 },
  { value: 'PAINTER', label: 'Painter', rate: 350 },
  { value: 'GENERAL', label: 'General Worker', rate: 250 },
  { value: 'SUPERVISOR', label: 'Supervisor', rate: 600 },
]

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'INVOICED', label: 'Invoiced' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'CRITICAL', label: 'Critical' },
]

export function JobEditPage({ jobId: propJobId, onBack: propOnBack, onSave: propOnSave }: JobEditPageProps) {
  // Support both props (when used as component) and URL params (when used as route)
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const jobId = propJobId || params.id || ''
  const onBack = propOnBack || (() => navigate('/jobs'))
  const onSave = propOnSave || (() => navigate(/jobs/+ jobId))
  
  const [job, setJob] = useState<Job | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [holdingPoints, setHoldingPoints] = useState<HoldingPoint[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'items' | 'time' | 'qc'>('details')

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    setLoading(true)
    
    // Fetch job
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (jobData) setJob(jobData)

    // Fetch line items
    const { data: itemsData } = await supabase
      .from('job_line_items')
      .select('*')
      .eq('job_id', jobId)
      .order('sort_order')
    
    if (itemsData) setLineItems(itemsData)

    // Fetch holding points
    const { data: hpData } = await supabase
      .from('job_holding_points')
      .select('*')
      .eq('job_id', jobId)
      .order('sort_order')
    
    if (hpData) setHoldingPoints(hpData)

    // Fetch time entries
    const { data: timeData } = await supabase
      .from('job_time_entries')
      .select('*')
      .eq('job_id', jobId)
      .order('week_start_date', { ascending: false })
    
    if (timeData) setTimeEntries(timeData)

    setLoading(false)
  }

  const updateJob = (field: string, value: any) => {
    if (job) {
      setJob({ ...job, [field]: value })
    }
  }

  const addLineItem = (itemType: string) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      item_type: itemType,
      description: '',
      specification: '',
      worker_type: itemType === 'LABOUR' ? 'GENERAL' : '',
      quantity: 1,
      uom: itemType === 'LABOUR' ? 'HR' : 'EA',
      cost_price: 0,
      sell_price: 0,
      line_total: 0,
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'worker_type') {
        const worker = WORKER_TYPES.find(w => w.value === value)
        if (worker) {
          updated.cost_price = worker.rate
          updated.sell_price = worker.rate
        }
      }
      updated.line_total = updated.quantity * updated.sell_price
      return updated
    }))
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateHoldingPoint = (id: string, field: string, value: any) => {
    setHoldingPoints(holdingPoints.map(hp => 
      hp.id === id ? { ...hp, [field]: value } : hp
    ))
  }

  const addTimeEntry = () => {
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employee_name: '',
      week_start_date: monday.toISOString().split('T')[0],
      description: '',
      mon_nt: 0, mon_ot: 0,
      tue_nt: 0, tue_ot: 0,
      wed_nt: 0, wed_ot: 0,
      thu_nt: 0, thu_ot: 0,
      fri_nt: 0, fri_ot: 0,
      sat_nt: 0, sat_ot: 0,
      sun_nt: 0, sun_ot: 0,
      total_nt: 0, total_ot: 0,
    }
    setTimeEntries([newEntry, ...timeEntries])
  }

  const updateTimeEntry = (id: string, field: string, value: any) => {
    setTimeEntries(timeEntries.map(entry => {
      if (entry.id !== id) return entry
      const updated = { ...entry, [field]: value }
      // Recalculate totals
      updated.total_nt = updated.mon_nt + updated.tue_nt + updated.wed_nt + 
                         updated.thu_nt + updated.fri_nt + updated.sat_nt + updated.sun_nt
      updated.total_ot = updated.mon_ot + updated.tue_ot + updated.wed_ot + 
                         updated.thu_ot + updated.fri_ot + updated.sat_ot + updated.sun_ot
      return updated
    }))
  }

  const handleSave = async () => {
    if (!job) return
    setSaving(true)

    try {
      // Update job
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          ...job,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      if (jobError) throw jobError

      // Delete and re-insert line items
      await supabase.from('job_line_items').delete().eq('job_id', jobId)
      if (lineItems.length > 0) {
        const itemsToInsert = lineItems.map((item, index) => ({
          job_id: jobId,
          item_type: item.item_type,
          description: item.description,
          specification: item.specification,
          worker_type: item.worker_type || null,
          quantity: item.quantity,
          uom: item.uom,
          cost_price: item.cost_price,
          sell_price: item.sell_price,
          line_total: item.line_total,
          sort_order: index,
        }))
        await supabase.from('job_line_items').insert(itemsToInsert)
      }

      // Update holding points
      for (const hp of holdingPoints) {
        await supabase
          .from('job_holding_points')
          .update({
            is_applicable: hp.is_applicable,
            is_passed: hp.is_passed,
            signed_by: hp.signed_by,
            signed_date: hp.signed_date,
            notes: hp.notes,
          })
          .eq('id', hp.id)
      }

      // Delete and re-insert time entries
      await supabase.from('job_time_entries').delete().eq('job_id', jobId)
      if (timeEntries.length > 0) {
        const entriesToInsert = timeEntries.map(entry => ({
          job_id: jobId,
          employee_name: entry.employee_name,
          week_start_date: entry.week_start_date,
          description: entry.description,
          mon_nt: entry.mon_nt, mon_ot: entry.mon_ot,
          tue_nt: entry.tue_nt, tue_ot: entry.tue_ot,
          wed_nt: entry.wed_nt, wed_ot: entry.wed_ot,
          thu_nt: entry.thu_nt, thu_ot: entry.thu_ot,
          fri_nt: entry.fri_nt, fri_ot: entry.fri_ot,
          sat_nt: entry.sat_nt, sat_ot: entry.sat_ot,
          sun_nt: entry.sun_nt, sun_ot: entry.sun_ot,
          total_nt: entry.total_nt,
          total_ot: entry.total_ot,
        }))
        await supabase.from('job_time_entries').insert(entriesToInsert)
      }

      alert('Job saved successfully!')
      onSave()
    } catch (err: any) {
      alert('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !job) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totals = {
    cost: lineItems.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0),
    price: lineItems.reduce((sum, item) => sum + item.line_total, 0),
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job Card</h1>
            <p className="text-gray-500">{job.job_number} {job.client_name && `- ${job.client_name}`}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save size={18} />
          )}
          Save Job Card
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'details', label: 'Job Details', icon: FileText },
          { id: 'actions', label: 'Actions Required', icon: Wrench },
          { id: 'items', label: 'Line Items', icon: Package },
          { id: 'time', label: 'Time Tracking', icon: Clock },
          { id: 'qc', label: 'QC Holding Points', icon: ClipboardCheck },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Job Identification */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
                <input
                  type="text"
                  value={job.job_number}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Card No</label>
                <input
                  type="text"
                  value={job.job_card_no || ''}
                  onChange={(e) => updateJob('job_card_no', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFQ No</label>
                <input
                  type="text"
                  value={job.rfq_number || ''}
                  onChange={(e) => updateJob('rfq_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Req</label>
                <input
                  type="text"
                  value={job.site_req || ''}
                  onChange={(e) => updateJob('site_req', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ENQ Report Information */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
              <h3 className="font-semibold text-green-800 mb-3">ENQ Report Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={job.department || ''}
                    onChange={(e) => updateJob('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 2002"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operating Entity</label>
                  <input
                    type="text"
                    value={job.operating_entity || ''}
                    onChange={(e) => updateJob('operating_entity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. ERHA FC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Number</label>
                  <input
                    type="text"
                    value={job.drawing_number || ''}
                    onChange={(e) => updateJob('drawing_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Received</label>
                  <select
                    value={job.media_received || ''}
                    onChange={(e) => updateJob('media_received', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select...</option>
                    <option value="Email">Email</option>
                    <option value="In Person">In Person</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Fax">Fax</option>
                    <option value="Post">Post</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number (PO)</label>
                  <input
                    type="text"
                    value={job.order_number || ''}
                    onChange={(e) => updateJob('order_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Client PO Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Value (R)</label>
                  <input
                    type="number"
                    value={job.job_value || ''}
                    onChange={(e) => updateJob('job_value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* ENQ Report Information */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
              <h3 className="font-semibold text-green-800 mb-3">ENQ Report Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={job.department || ''}
                    onChange={(e) => updateJob('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 2002"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operating Entity</label>
                  <input
                    type="text"
                    value={job.operating_entity || ''}
                    onChange={(e) => updateJob('operating_entity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. ERHA FC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Number</label>
                  <input
                    type="text"
                    value={job.drawing_number || ''}
                    onChange={(e) => updateJob('drawing_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Received</label>
                  <select
                    value={job.media_received || ''}
                    onChange={(e) => updateJob('media_received', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select...</option>
                    <option value="Email">Email</option>
                    <option value="In Person">In Person</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Fax">Fax</option>
                    <option value="Post">Post</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number (PO)</label>
                  <input
                    type="text"
                    value={job.order_number || ''}
                    onChange={(e) => updateJob('order_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Client PO Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Value (R)</label>
                  <input
                    type="number"
                    value={job.job_value || ''}
                    onChange={(e) => updateJob('job_value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Work Type */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={job.is_contract_work}
                  onChange={(e) => updateJob('is_contract_work', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium">Contract Work</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={job.is_quoted_work}
                  onChange={(e) => updateJob('is_quoted_work', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium">Quoted Work</span>
              </label>
            </div>

            {/* Client & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={job.client_name || ''}
                  onChange={(e) => updateJob('client_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={job.contact_person || ''}
                  onChange={(e) => updateJob('contact_person', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={job.contact_phone || ''}
                  onChange={(e) => updateJob('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
                <input
                  type="text"
                  value={job.site_location || ''}
                  onChange={(e) => updateJob('site_location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                value={job.description || ''}
                onChange={(e) => updateJob('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Planning Info */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={18} /> Supervisor Job Planning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                  <input
                    type="date"
                    value={job.date_received || ''}
                    onChange={(e) => updateJob('date_received', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Ordered</label>
                  <input
                    type="date"
                    value={job.material_ordered_date || ''}
                    onChange={(e) => updateJob('material_ordered_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={job.completion_date || ''}
                    onChange={(e) => updateJob('completion_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={job.due_date || ''}
                    onChange={(e) => updateJob('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compiled By</label>
                  <input
                    type="text"
                    value={job.compiled_by || ''}
                    onChange={(e) => updateJob('compiled_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Zoey / Jeanic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Supervisor</label>
                  <input
                    type="text"
                    value={job.assigned_supervisor || ''}
                    onChange={(e) => updateJob('assigned_supervisor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={job.status}
                  onChange={(e) => updateJob('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={job.priority}
                  onChange={(e) => updateJob('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quoted Value</label>
                <input
                  type="number"
                  value={job.quoted_value || ''}
                  onChange={(e) => updateJob('quoted_value', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Attached Documents Checkboxes */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Attached Documents</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { field: 'has_service_schedule', label: 'Service Schedule / QCP' },
                  { field: 'has_drawing', label: 'Drawing / Sketches' },
                  { field: 'has_internal_order', label: 'Internal Order' },
                  { field: 'has_info_for_quote', label: 'Info for Quote' },
                  { field: 'has_qcp', label: 'QCP' },
                  { field: 'has_list_as_quoted', label: 'List as Quoted' },
                ].map(doc => (
                  <label key={doc.field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(job as any)[doc.field] || false}
                      onChange={(e) => updateJob(doc.field, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS TAB */}
        {activeTab === 'actions' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Actions Required</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { field: 'action_manufacture', label: 'MANUFACTURE', icon: Settings },
                { field: 'action_sandblast', label: 'SANDBLAST', icon: Wrench },
                { field: 'action_prepare_material', label: 'PREPARE MATERIAL', icon: Package },
                { field: 'action_service', label: 'SERVICE', icon: Truck },
                { field: 'action_paint', label: 'PAINT', icon: Paintbrush },
                { field: 'action_repair', label: 'REPAIR', icon: Wrench },
                { field: 'action_installation', label: 'INSTALLATION', icon: Settings },
                { field: 'action_cut', label: 'CUT', icon: Scissors },
                { field: 'action_modify', label: 'MODIFY', icon: Settings },
                { field: 'action_other', label: 'OTHER', icon: FileText },
              ].map(action => {
                const Icon = action.icon
                const isChecked = (job as any)[action.field] || false
                return (
                  <button
                    key={action.field}
                    onClick={() => updateJob(action.field, !isChecked)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isChecked
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={24} className={isChecked ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="font-medium">{action.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            {job.action_other && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Description</label>
                <input
                  type="text"
                  value={job.action_other_description || ''}
                  onChange={(e) => updateJob('action_other_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the other action required..."
                />
              </div>
            )}
          </div>
        )}

        {/* LINE ITEMS TAB */}
        {activeTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Line Items</h3>
              <div className="flex gap-2">
                {ITEM_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => addLineItem(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium ${type.color} hover:opacity-90`}
                  >
                    + {type.label}
                  </button>
                ))}
              </div>
            </div>

            {lineItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No line items. Click a button above to add.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-left py-2 px-2">Worker</th>
                      <th className="text-right py-2 px-2">Qty</th>
                      <th className="text-left py-2 px-2">UOM</th>
                      <th className="text-right py-2 px-2">Cost</th>
                      <th className="text-right py-2 px-2">Price</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map(item => {
                      const typeConfig = ITEM_TYPES.find(t => t.value === item.item_type)
                      return (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded text-white text-xs ${typeConfig?.color}`}>
                              {typeConfig?.label}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Description"
                            />
                          </td>
                          <td className="py-2 px-2">
                            {item.item_type === 'LABOUR' ? (
                              <select
                                value={item.worker_type}
                                onChange={(e) => updateLineItem(item.id, 'worker_type', e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                              >
                                {WORKER_TYPES.map(w => (
                                  <option key={w.value} value={w.value}>{w.label}</option>
                                ))}
                              </select>
                            ) : '-'}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border rounded text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-gray-600">{item.uom}</td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.cost_price}
                              onChange={(e) => updateLineItem(item.id, 'cost_price', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={item.sell_price}
                              onChange={(e) => updateLineItem(item.id, 'sell_price', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded text-sm text-right"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-medium">
                            R {item.line_total.toLocaleString()}
                          </td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold bg-gray-50">
                      <td colSpan={5} className="py-2 px-2"></td>
                      <td className="py-2 px-2 text-right">R {totals.cost.toLocaleString()}</td>
                      <td className="py-2 px-2"></td>
                      <td className="py-2 px-2 text-right text-lg">R {totals.price.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TIME TRACKING TAB */}
        {activeTab === 'time' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Time Tracking</h3>
              <button
                onClick={addTimeEntry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} /> Add Week
              </button>
            </div>

            {timeEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No time entries. Click "Add Week" to start tracking.</p>
            ) : (
              <div className="space-y-4">
                {timeEntries.map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                        <input
                          type="text"
                          value={entry.employee_name}
                          onChange={(e) => updateTimeEntry(entry.id, 'employee_name', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="Employee name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Week Starting</label>
                        <input
                          type="date"
                          value={entry.week_start_date}
                          onChange={(e) => updateTimeEntry(entry.id, 'week_start_date', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => updateTimeEntry(entry.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="Work description"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th></th>
                            <th className="px-2">Mon</th>
                            <th className="px-2">Tue</th>
                            <th className="px-2">Wed</th>
                            <th className="px-2">Thu</th>
                            <th className="px-2">Fri</th>
                            <th className="px-2">Sat</th>
                            <th className="px-2">Sun</th>
                            <th className="px-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-xs font-medium text-gray-500 pr-2">NT</td>
                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                              <td key={day} className="px-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={(entry as any)[`${day}_nt`] || 0}
                                  onChange={(e) => updateTimeEntry(entry.id, `${day}_nt`, parseFloat(e.target.value) || 0)}
                                  className="w-12 px-1 py-1 border rounded text-xs text-center"
                                />
                              </td>
                            ))}
                            <td className="px-2 text-right font-medium">{entry.total_nt}</td>
                          </tr>
                          <tr>
                            <td className="text-xs font-medium text-gray-500 pr-2">OT</td>
                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                              <td key={day} className="px-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={(entry as any)[`${day}_ot`] || 0}
                                  onChange={(e) => updateTimeEntry(entry.id, `${day}_ot`, parseFloat(e.target.value) || 0)}
                                  className="w-12 px-1 py-1 border rounded text-xs text-center bg-yellow-50"
                                />
                              </td>
                            ))}
                            <td className="px-2 text-right font-medium text-orange-600">{entry.total_ot}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QC HOLDING POINTS TAB */}
        {activeTab === 'qc' && (
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800">QC Holding Points</h3>
              <p className="text-sm text-gray-500">Under no circumstances should work continue to the next holding point if the previous is not signed.</p>
            </div>

            <div className="space-y-3">
              {holdingPoints.map(hp => (
                <div 
                  key={hp.id} 
                  className={`border rounded-lg p-4 ${
                    hp.is_passed === true ? 'bg-green-50 border-green-200' :
                    hp.is_passed === false ? 'bg-red-50 border-red-200' :
                    'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                      {hp.point_number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{hp.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={hp.is_applicable}
                            onChange={(e) => updateHoldingPoint(hp.id, 'is_applicable', e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          Applicable
                        </label>
                        {hp.is_applicable && (
                          <>
                            <button
                              onClick={() => updateHoldingPoint(hp.id, 'is_passed', true)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                hp.is_passed === true 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                              }`}
                            >
                              âœ“ Pass
                            </button>
                            <button
                              onClick={() => updateHoldingPoint(hp.id, 'is_passed', false)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                hp.is_passed === false 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                              }`}
                            >
                              âœ— Fail
                            </button>
                          </>
                        )}
                      </div>
                      {hp.is_applicable && hp.is_passed !== null && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={hp.signed_by || ''}
                            onChange={(e) => updateHoldingPoint(hp.id, 'signed_by', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="Signed by..."
                          />
                          <input
                            type="text"
                            value={hp.notes || ''}
                            onChange={(e) => updateHoldingPoint(hp.id, 'notes', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="Notes..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                âš ï¸ Take Note: Final Inspection must ALWAYS be at least 2 days before delivery date!
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                ALL WELDING RODS MUST BE BAKED PRIOR TO WELDING!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobEditPage


