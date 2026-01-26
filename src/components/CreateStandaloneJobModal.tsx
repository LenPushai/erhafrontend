import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Briefcase, Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LineItem {
  description: string
  quantity: number
  uom: string
  specification?: string
}

interface CreateStandaloneJobModalProps {
  isOpen: boolean
  onClose: () => void
  clients: any[]
  onJobCreated: (job: any) => void
}

const UOM_OPTIONS = [
  { value: 'EA', label: 'Each' }, { value: 'M', label: 'Metres' }, { value: 'M2', label: 'Sq Metres' },
  { value: 'KG', label: 'Kilograms' }, { value: 'HR', label: 'Hours' }, { value: 'DAY', label: 'Days' },
  { value: 'LOT', label: 'Lump Sum' }, { value: 'SET', label: 'Set' }
]

const ACTIONS_OPTIONS = [
  { id: 'MANUFACTURE', label: 'Manufacture' },
  { id: 'SANDBLAST', label: 'Sandblast' },
  { id: 'PREPARE_MATERIAL', label: 'Prepare Material' },
  { id: 'SERVICE', label: 'Service' },
  { id: 'PAINT', label: 'Paint' },
  { id: 'OTHER', label: 'Other' },
  { id: 'REPAIR', label: 'Repair' },
  { id: 'INSTALLATION', label: 'Installation' },
  { id: 'CUT', label: 'Cut' },
  { id: 'MODIFY', label: 'Modify' }
]

const COMPILED_BY_OPTIONS = ['Zoey', 'Jeanic', 'Juanic', 'Hendrik', 'Dewald', 'Jaco']

const ATTACHED_DOCS_OPTIONS = [
  { id: 'service_schedule_qcp', label: 'Service Schedule/QCP' },
  { id: 'drawing_sketches', label: 'Drawing Attached/Sketches' },
  { id: 'internal_order', label: 'Internal Order' },
  { id: 'info_for_quote', label: 'Info for Quote' },
  { id: 'qcp', label: 'QCP' },
  { id: 'list_as_quoted', label: 'List as Quoted' }
]

export const CreateStandaloneJobModal: React.FC<CreateStandaloneJobModalProps> = ({ 
  isOpen, onClose, clients, onJobCreated 
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdJob, setCreatedJob] = useState<any>(null)
  const [workers, setWorkers] = useState<any[]>([])

  // Job form state
  const [jobData, setJobData] = useState({
    clientId: '',
    workType: 'CONTRACT' as 'CONTRACT' | 'QUOTED',
    compiledBy: '',
    employeeId: '',
    supervisorId: '',
    siteReq: '',
    actionsRequired: [] as string[],
    attachedDocs: [] as string[],
    hasDrawing: false,
    dateReceived: new Date().toISOString().split('T')[0],
    materialOrdered: '',
    completionDate: '',
    dueDate: '',
    priority: 'MEDIUM',
    isEmergency: false,
    notes: '',
    contactPerson: '',
    contactPhone: '',
    orderNumber: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, uom: 'EA', specification: '' }
  ])

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase
        .from('workers')
        .select('id, full_name, role')
        .eq('is_active', true)
        .order('full_name')
      if (data) setWorkers(data)
    }
    fetchWorkers()
  }, [])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, uom: 'EA', specification: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const toggleAction = (action: string) => {
    setJobData(prev => ({
      ...prev,
      actionsRequired: prev.actionsRequired.includes(action)
        ? prev.actionsRequired.filter(a => a !== action)
        : [...prev.actionsRequired, action]
    }))
  }

  const toggleAttachedDoc = (doc: string) => {
    setJobData(prev => ({
      ...prev,
      attachedDocs: prev.attachedDocs.includes(doc)
        ? prev.attachedDocs.filter(d => d !== doc)
        : [...prev.attachedDocs, doc]
    }))
  }

  const generateJobNumber = async (): Promise<string> => {
    const year = new Date().getFullYear().toString().slice(-2)
    
    // Get the highest job number for this year
    const { data: lastJobs } = await supabase
      .from('jobs')
      .select('job_number')
      .ilike('job_number', `${year}-%`)
      .order('job_number', { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (lastJobs && lastJobs.length > 0) {
      const match = lastJobs[0].job_number?.match(/(\d{2})-(\d+)/)
      if (match) nextNumber = parseInt(match[2]) + 1
    }

    return `${year}-${nextNumber.toString().padStart(3, '0')}`
  }

  const handleCreateJob = async () => {
    if (!jobData.clientId) {
      setError('Please select a client')
      return
    }
    if (!jobData.dueDate) {
      setError('Please enter a due date')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const jobNumber = await generateJobNumber()
      const client = clients.find(c => c.id === jobData.clientId)
      const employee = workers.find(w => w.id === jobData.employeeId)
      const supervisor = workers.find(w => w.id === jobData.supervisorId)

      const { data: newJob, error: jobError } = await supabase
        .from('jobs')
        .insert({
          job_number: jobNumber,
          job_card_no: jobNumber, // Same as job number
          job_type: jobData.workType,
          is_emergency: jobData.isEmergency,
          is_quoted_work: jobData.workType === 'QUOTED',
          is_contract_work: jobData.workType === 'CONTRACT',
          is_parent: true,

          // Client
          client_id: jobData.clientId,
          client_name: client?.company_name || '',
          contact_person: jobData.contactPerson,
          contact_phone: jobData.contactPhone,
          
          // Job Details
          description: lineItems.map(li => li.description).filter(d => d).join('; '),
          compiled_by: jobData.compiledBy,
          actions_required: jobData.actionsRequired.join(','),
          order_number: jobData.orderNumber,
          
          // Personnel
          assigned_employee_id: jobData.employeeId || null,
          assigned_employee_name: employee?.full_name || null,
          assigned_supervisor_id: jobData.supervisorId || null,
          assigned_supervisor_name: supervisor?.full_name || null,
          
          // Site Info
          site_req: jobData.siteReq,
          
          // Dates
          priority: jobData.priority,
          due_date: jobData.dueDate,
          date_received: jobData.dateReceived,
          material_ordered_date: jobData.materialOrdered || null,
          completion_date: jobData.completionDate || null,

          // Drawing & Documents
          has_drawing: jobData.hasDrawing,
          attached_documents: jobData.attachedDocs.join(','),

          // Status
          status: 'PENDING',
          notes: jobData.notes
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Create line items
      if (lineItems.length > 0 && lineItems.some(li => li.description)) {
        const jobLineItems = lineItems
          .filter(item => item.description)
          .map((item, index) => ({
            job_id: newJob.id,
            description: item.description,
            quantity: item.quantity,
            uom: item.uom,
            specification: item.specification,
            sort_order: index + 1,
            status: 'PENDING'
          }))

        await supabase.from('job_line_items').insert(jobLineItems)
      }

      // Create QC holding points
      const holdingPoints = [
        { point_number: 1, description: 'Mark out all material & check prior to cutting.' },
        { point_number: 2, description: 'Cut all material, deburr holes, dress and remove all sharp edges' },
        { point_number: 3, description: 'Assy & inspect prior to welding (Water passes if applicable)' },
        { point_number: 4, description: 'Do welding complete as per WPS?' },
        { point_number: 5, description: 'Do a pressure test on water cooled unit if applicable?' },
        { point_number: 6, description: 'Clean all spatter and ensure NO sharp edges on workpiece' },
        { point_number: 7, description: 'Do 100% dimensional & visual inspection prior to painting' },
        { point_number: 8, description: 'Stamp and paint as required' },
        { point_number: 9, description: 'Final Inspection - Sticker - Sign - Paperwork - Ready for delivery' }
      ]

      await supabase.from('job_holding_points').insert(
        holdingPoints.map((hp, index) => ({
          job_id: newJob.id,
          point_number: hp.point_number,
          description: hp.description,
          is_applicable: true,
          is_passed: null,
          sort_order: index + 1
        }))
      )

      setCreatedJob({ 
        ...newJob, 
        job_number: jobNumber,
        client_name: client?.company_name,
        employee_name: employee?.full_name,
        supervisor_name: supervisor?.full_name,
        line_items: lineItems
      })

      onJobCreated({ ...newJob, job_number: jobNumber })

    } catch (err: any) {
      console.error('Error creating job:', err)
      setError(err.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintJobCard = () => {
    if (!createdJob) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const client = clients.find(c => c.id === jobData.clientId)
    
    // Generate and print (using same template as CreateJobModal)
    printWindow.document.write(generateJobCardHtml({
      ...createdJob,
      client_name: client?.company_name || '',
      work_type: jobData.workType,
      compiled_by: jobData.compiledBy,
      actions_required: jobData.actionsRequired,
      attached_docs: jobData.attachedDocs,
      has_drawing: jobData.hasDrawing,
      line_items: lineItems,
      date_received: jobData.dateReceived,
      material_ordered: jobData.materialOrdered,
      completion_date: jobData.completionDate,
      due_date: jobData.dueDate,
      site_req: jobData.siteReq,
      description: lineItems.map(li => `${li.description} (Qty: ${li.quantity})`).join(', ')
    }))
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  const handleClose = () => {
    setCreatedJob(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  // Success screen
  if (createdJob) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Created!</h2>
          <p className="text-gray-600 mb-2">Job Number: <span className="font-bold text-blue-600 text-xl">{createdJob.job_number}</span></p>
          <p className="text-gray-500 mb-6">{createdJob.client_name}</p>
          
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50">
              Close
            </button>
            <button onClick={handlePrintJobCard} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Printer size={18} /> Print Job Card
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={24} /> Create New Job
            </h2>
            <p className="text-indigo-100 text-sm">Contract / Direct Work (No RFQ)</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          {/* Client & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-medium">Client *</label>
              <select 
                value={jobData.clientId}
                onChange={e => setJobData(p => ({ ...p, clientId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                required
              >
                <option value="">Select client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Job Number</label>
              <p className="font-bold text-lg text-indigo-600 mt-1">Auto (YY-XXX)</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Site Req / PO</label>
              <input 
                type="text"
                value={jobData.siteReq}
                onChange={e => setJobData(p => ({ ...p, siteReq: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="e.g. PO-12345"
              />
            </div>
          </div>

          {/* Work Type, Priority, Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Work Type</label>
              <div className="flex gap-2">
                <label className={`flex-1 p-2 border-2 rounded-lg cursor-pointer text-center text-sm ${jobData.workType === 'CONTRACT' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" name="workType" checked={jobData.workType === 'CONTRACT'} onChange={() => setJobData(p => ({ ...p, workType: 'CONTRACT' }))} className="sr-only" />
                  Contract
                </label>
                <label className={`flex-1 p-2 border-2 rounded-lg cursor-pointer text-center text-sm ${jobData.workType === 'QUOTED' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" name="workType" checked={jobData.workType === 'QUOTED'} onChange={() => setJobData(p => ({ ...p, workType: 'QUOTED' }))} className="sr-only" />
                  Quoted
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select value={jobData.priority} onChange={e => setJobData(p => ({ ...p, priority: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compiled By</label>
              <select value={jobData.compiledBy} onChange={e => setJobData(p => ({ ...p, compiledBy: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select...</option>
                {COMPILED_BY_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer w-full ${jobData.isEmergency ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                <input type="checkbox" checked={jobData.isEmergency} onChange={e => setJobData(p => ({ ...p, isEmergency: e.target.checked }))} className="rounded text-red-600" />
                <span className="text-sm font-medium">🚨 Emergency</span>
              </label>
            </div>
          </div>

          {/* Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assign to Employee</label>
              <select value={jobData.employeeId} onChange={e => setJobData(p => ({ ...p, employeeId: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select...</option>
                {workers.filter(w => w.role === 'WORKSHOP').map(w => (
                  <option key={w.id} value={w.id}>{w.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supervisor</label>
              <select value={jobData.supervisorId} onChange={e => setJobData(p => ({ ...p, supervisorId: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select...</option>
                {workers.filter(w => w.role === 'SUPERVISOR' || w.role === 'ADMIN').map(w => (
                  <option key={w.id} value={w.id}>{w.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions Required */}
          <div>
            <label className="block text-sm font-medium mb-2">ACTIONS REQUIRED</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ACTIONS_OPTIONS.map(action => (
                <label key={action.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm ${jobData.actionsRequired.includes(action.id) ? 'bg-indigo-50 border-indigo-500' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={jobData.actionsRequired.includes(action.id)} onChange={() => toggleAction(action.id)} className="rounded text-indigo-600" />
                  <span>{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">JOB DESCRIPTION / LINE ITEMS</label>
              <button type="button" onClick={addLineItem} className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                <Plus size={16} /> Add Item
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left w-8">#</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-left w-20">Qty</th>
                    <th className="px-3 py-2 text-left w-24">UOM</th>
                    <th className="px-3 py-2 text-left">Spec/Notes</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Description" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full border rounded px-2 py-1" min="1" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={item.uom} onChange={e => updateLineItem(index, 'uom', e.target.value)} className="w-full border rounded px-2 py-1">
                          {UOM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.specification || ''} onChange={e => updateLineItem(index, 'specification', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Notes" />
                      </td>
                      <td className="px-3 py-2">
                        {lineItems.length > 1 && (
                          <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drawing & Attached Docs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${jobData.hasDrawing ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                <input type="checkbox" checked={jobData.hasDrawing} onChange={e => setJobData(p => ({ ...p, hasDrawing: e.target.checked }))} className="rounded text-green-600" />
                <span>Drawing Attached / Sketches</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Attached Documents</label>
              <div className="flex flex-wrap gap-2">
                {ATTACHED_DOCS_OPTIONS.slice(0, 3).map(doc => (
                  <label key={doc.id} className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer text-xs ${jobData.attachedDocs.includes(doc.id) ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={jobData.attachedDocs.includes(doc.id)} onChange={() => toggleAttachedDoc(doc.id)} className="rounded text-green-600 w-3 h-3" />
                    {doc.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium mb-2">SUPERVISOR JOB PLANNING</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date Received</label>
                <input type="date" value={jobData.dateReceived} onChange={e => setJobData(p => ({ ...p, dateReceived: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Material Ordered</label>
                <input type="date" value={jobData.materialOrdered} onChange={e => setJobData(p => ({ ...p, materialOrdered: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Completion Date</label>
                <input type="date" value={jobData.completionDate} onChange={e => setJobData(p => ({ ...p, completionDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">DUE DATE *</label>
                <input type="date" value={jobData.dueDate} onChange={e => setJobData(p => ({ ...p, dueDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 border-red-300" required />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea value={jobData.notes} onChange={e => setJobData(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Additional notes..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <button onClick={handleClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
          <button 
            onClick={handleCreateJob} 
            disabled={loading || !jobData.clientId || !jobData.dueDate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : <><Briefcase size={18} /> Create Job</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// Job Card HTML Generator (same as CreateJobModal)
function generateJobCardHtml(job: any): string {
  const actionsGrid = [
    ['MANUFACTURE', 'SERVICE', 'REPAIR', 'MODIFY'],
    ['SANDBLAST', 'PAINT', 'INSTALLATION', ''],
    ['PREPARE_MATERIAL', 'OTHER', 'CUT', '']
  ]

  const actionCheckbox = (action: string) => {
    const checked = job.actions_required?.includes(action)
    return action ? `<td style="border: 1px solid #000; padding: 4px; text-align: center;">
      <span style="font-size: 16px;">${checked ? '☑' : '☐'}</span> ${action.replace('_', ' ')}
    </td>` : '<td style="border: 1px solid #000;"></td>'
  }

  const docCheckbox = (docId: string, label: string) => {
    const checked = job.attached_docs?.includes(docId)
    return `<span style="margin-right: 10px;"><span style="font-size: 14px;">${checked ? '☑' : '☐'}</span> ${label}</span>`
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Job Card - ${job.job_number}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 10px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 4px 6px; }
    .title { font-size: 14px; font-weight: bold; color: #1a365d; text-align: center; }
    .label { font-size: 9px; color: #666; }
    .value { font-weight: bold; }
    .checkbox { font-size: 14px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 40%; padding: 10px;">
        <div style="font-size: 16px; font-weight: bold; color: #1a365d;">ERHA Fabrication & Construction</div>
        <div style="font-size: 10px; color: #666;">(Pty) Ltd</div>
      </td>
      <td style="width: 25%; text-align: center;"><div class="title">QC Department</div></td>
      <td style="width: 35%; padding: 5px; font-size: 10px;">
        <div><strong>Form no:</strong> QCL JC 001</div>
        <div><strong>Job Card:</strong> ${job.job_number}</div>
      </td>
    </tr>
  </table>

  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 50%; padding: 8px;">
        <span class="checkbox">${job.work_type === 'CONTRACT' ? '☑' : '☐'}</span> <strong>Contract Work</strong>
      </td>
      <td style="width: 50%; padding: 8px;">
        <span class="checkbox">${job.work_type === 'QUOTED' ? '☑' : '☐'}</span> <strong>Quoted Work</strong>
      </td>
    </tr>
  </table>

  <table style="margin-bottom: 10px;">
    <tr><td style="padding: 5px;"><span class="label">Client:</span> <span class="value">${job.client_name || ''}</span></td></tr>
    <tr><td style="padding: 5px;">
      <span class="label">Job Nr:</span> <span class="value">${job.job_number}</span> &nbsp;&nbsp;
      <span class="label">Site Req:</span> <span class="value">${job.site_req || ''}</span>
    </td></tr>
  </table>

  <div style="font-weight: bold; margin-bottom: 5px;">ACTIONS REQUIRED</div>
  <table style="margin-bottom: 10px; font-size: 10px;">
    ${actionsGrid.map(row => `<tr>${row.map(action => actionCheckbox(action)).join('')}</tr>`).join('')}
  </table>

  <table style="margin-bottom: 10px;">
    <tr>
      <td style="padding: 8px; min-height: 60px;">
        <div class="label">JOB DESCRIPTION:</div>
        <div class="value" style="margin-top: 5px;">${job.description || ''}</div>
      </td>
      <td style="padding: 8px; width: 60px; text-align: center;">
        <div class="label">QTY</div>
        <div class="value">${job.line_items?.reduce((sum: number, li: any) => sum + (li.quantity || 0), 0) || ''}</div>
      </td>
    </tr>
  </table>

  <table style="margin-bottom: 10px;">
    <tr style="background: #f3f4f6;"><td colspan="4" style="padding: 5px; font-weight: bold;">SUPERVISOR JOB PLANNING</td></tr>
    <tr>
      <td style="padding: 5px; text-align: center;"><span class="label">Date Received</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">Material Ordered</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">Completion Date</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">DUE DATE</span></td>
    </tr>
    <tr>
      <td style="padding: 8px; text-align: center;">${job.date_received || ''}</td>
      <td style="padding: 8px; text-align: center;">${job.material_ordered || ''}</td>
      <td style="padding: 8px; text-align: center;">${job.completion_date || ''}</td>
      <td style="padding: 8px; text-align: center; font-weight: bold;">${job.due_date || ''}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td style="padding: 10px; width: 50%;"><div class="label">SUPERVISOR SIGNATURE:</div><div style="border-bottom: 1px solid #000; height: 25px;"></div></td>
      <td style="padding: 10px; width: 50%;"><div class="label">EMPLOYEE SIGNATURE:</div><div style="border-bottom: 1px solid #000; height: 25px;"></div></td>
    </tr>
  </table>
</body>
</html>`
}

export default CreateStandaloneJobModal