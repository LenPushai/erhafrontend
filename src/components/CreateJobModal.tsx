import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Briefcase, Printer, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LineItem {
  id?: string
  description: string
  quantity: number
  uom: string
  specification?: string
  can_spawn_job: boolean
}

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
  rfq: any
  rfqLineItems: any[]
  clients: any[]
  workers?: any[]
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

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ 
  isOpen, onClose, rfq, rfqLineItems, clients, workers = [], onJobCreated 
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdJob, setCreatedJob] = useState<any>(null)

  // Job form state - matching physical Job Card
  const [jobData, setJobData] = useState({
    // Work Type
    workType: 'QUOTED' as 'CONTRACT' | 'QUOTED',
    
    // Personnel
    compiledBy: '',
    employeeId: '',
    supervisorId: '',
    
    // Site Info
    siteReq: '',
    
    // Actions Required (checkboxes)
    actionsRequired: [] as string[],
    
    // Attached Documents (checkboxes)
    attachedDocs: [] as string[],
    hasDrawing: false,
    
    // Supervisor Planning
    dateReceived: new Date().toISOString().split('T')[0],
    materialOrdered: '',
    completionDate: '',
    dueDate: '',
    
    // Notes
    notes: '',
    
    // Signatures (will be name + timestamp)
    supervisorSignature: '',
    supervisorSignedAt: '',
    employeeSignature: '',
    employeeSignedAt: ''
  })

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  
  // Workers list for dropdowns
  const [workersList, setWorkersList] = useState<any[]>([])

  // Fetch workers on mount
  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase
        .from('workers')
        .select('id, full_name, role, department')
        .eq('is_active', true)
        .order('full_name')
      if (data) setWorkersList(data)
    }
    if (workers.length === 0) {
      fetchWorkers()
    } else {
      setWorkersList(workers)
    }
  }, [workers])

  // Initialize from RFQ
  useEffect(() => {
    if (rfqLineItems && rfqLineItems.length > 0) {
      setLineItems(rfqLineItems.map((item: any) => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        uom: item.unit_of_measure || item.unit || 'EA',
        specification: item.specification || item.notes || '',
        can_spawn_job: true
      })))
    } else {
      setLineItems([{ description: rfq?.description || '', quantity: 1, uom: 'EA', specification: '', can_spawn_job: true }])
    }

    // Pre-fill actions from RFQ
    if (rfq?.actions_required) {
      const actions = typeof rfq.actions_required === 'string'
        ? rfq.actions_required.split(',').map((a: string) => a.trim().toUpperCase().replace(' ', '_'))
        : rfq.actions_required
      setJobData(prev => ({ ...prev, actionsRequired: actions }))
    }

    // Pre-fill other fields
    setJobData(prev => ({ 
      ...prev, 
      dueDate: rfq?.required_date || '',
      siteReq: rfq?.site_req || rfq?.order_number || '',
      hasDrawing: !!rfq?.drawing_number
    }))
  }, [rfq, rfqLineItems])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, uom: 'EA', specification: '', can_spawn_job: true }])
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

  const handleCreateJob = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Generate job number (YY-XXX format)
      const year = new Date().getFullYear().toString().slice(-2)
      const { data: lastJobs } = await supabase
        .from('jobs')
        .select('job_number')
        .ilike('job_number', `${year}-%`)
        .is('parent_job_id', null)
        .order('created_at', { ascending: false })
        .limit(1)

      let nextNumber = 1
      if (lastJobs && lastJobs.length > 0) {
        const match = lastJobs[0].job_number?.match(/\d{2}-(\d+)/)
        if (match) nextNumber = parseInt(match[1]) + 1
      }

      const jobNumber = `${year}-${nextNumber.toString().padStart(3, '0')}`
      const client = clients.find((c: any) => c.id === rfq.client_id)

      // 2. Generate Job Card No (sequential)
      const { data: lastJobCard } = await supabase
        .from('jobs')
        .select('job_card_no')
        .not('job_card_no', 'is', null)
        .order('job_card_no', { ascending: false })
        .limit(1)

      const jobCardNo = lastJobCard && lastJobCard.length > 0 && lastJobCard[0].job_card_no
        ? parseInt(lastJobCard[0].job_card_no) + 1
        : 768

      // Get employee and supervisor names
      const employee = workersList.find(w => w.id === jobData.employeeId)
      const supervisor = workersList.find(w => w.id === jobData.supervisorId)

      // 3. Create job in database
      const { data: newJob, error: jobError } = await supabase
        .from('jobs')
        .insert({
          job_number: jobNumber,
          job_card_no: jobCardNo.toString(),
          job_type: jobData.workType,
          is_emergency: false,
          is_quoted_work: jobData.workType === 'QUOTED',
          is_contract_work: jobData.workType === 'CONTRACT',
          is_parent: true,

          // Client Information
          client_id: rfq.client_id,
          client_name: client?.company_name || '',
          contact_person: rfq.contact_person,
          contact_email: rfq.contact_email,
          contact_phone: rfq.contact_phone,
          
          // Job Details
          description: lineItems.map(li => li.description).join('; ') || rfq.description,
          compiled_by: jobData.compiledBy,
          actions_required: jobData.actionsRequired.join(','),
          
          // Personnel
          assigned_employee_id: jobData.employeeId || null,
          assigned_employee_name: employee?.full_name || null,
          assigned_supervisor_id: jobData.supervisorId || null,
          assigned_supervisor_name: supervisor?.full_name || null,
          
          // Site Info
          site_req: jobData.siteReq,
          
          // RFQ Reference
          rfq_id: rfq.id,
          rfq_number: rfq.rfq_no || rfq.enq_number,
          order_number: rfq.order_number,
          
          // Value
          job_value: rfq.quote_value_incl_vat || rfq.quote_value_excl_vat || rfq.estimated_value,
          
          // Dates
          priority: rfq.priority || 'MEDIUM',
          due_date: jobData.dueDate,
          date_received: jobData.dateReceived,
          material_ordered_date: jobData.materialOrdered || null,
          completion_date: jobData.completionDate || null,

          // Organization
          department: rfq.department,
          operating_entity: rfq.operating_entity,

          // Drawing & Documents
          drawing_number: rfq.drawing_number || null,
          has_drawing: jobData.hasDrawing,
          attached_documents: jobData.attachedDocs.join(','),
          media_received: rfq.media_received || null,

          // Signatures
          supervisor_signature: jobData.supervisorSignature || null,
          supervisor_signed_at: jobData.supervisorSignature ? new Date().toISOString() : null,
          employee_signature: jobData.employeeSignature || null,
          employee_signed_at: jobData.employeeSignature ? new Date().toISOString() : null,

          // Status
          status: 'PENDING',
          notes: jobData.notes
        })
        .select()
        .single()

      if (jobError) throw jobError

      // 4. Create job line items
      if (lineItems.length > 0) {
        const jobLineItems = lineItems.map((item, index) => ({
          job_id: newJob.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom,
          specification: item.specification,
          can_spawn_job: item.can_spawn_job,
          sort_order: index + 1,
          status: 'PENDING'
        }))

        await supabase.from('job_line_items').insert(jobLineItems)
      }

      // 5. Create default QC holding points
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

      const jobHoldingPoints = holdingPoints.map((hp, index) => ({
        job_id: newJob.id,
        point_number: hp.point_number,
        description: hp.description,
        is_applicable: true,
        is_passed: null,
        sort_order: index + 1
      }))

      await supabase.from('job_holding_points').insert(jobHoldingPoints)

      // 6. Update RFQ with job reference
      await supabase
        .from('rfqs')
        .update({ status: 'JOB_CREATED', job_id: newJob.id })
        .eq('id', rfq.id)

      // 7. Store created job for PDF generation
      setCreatedJob({ 
        ...newJob, 
        job_number: jobNumber, 
        job_card_no: jobCardNo,
        client_name: client?.company_name,
        employee_name: employee?.full_name,
        supervisor_name: supervisor?.full_name,
        line_items: lineItems
      })

      // 8. Notify parent
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

    const client = clients.find((c: any) => c.id === rfq?.client_id)
    const employee = workersList.find(w => w.id === jobData.employeeId)
    const supervisor = workersList.find(w => w.id === jobData.supervisorId)

    const jobCardHtml = generateJobCardHtml({
      ...createdJob,
      client_name: client?.company_name || '',
      employee_name: employee?.full_name || '',
      supervisor_name: supervisor?.full_name || '',
      rfq_number: rfq?.rfq_no || rfq?.enq_number || '',
      site_req: jobData.siteReq,
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
      description: lineItems.map(li => `${li.description} (Qty: ${li.quantity})`).join(', ')
    })

    printWindow.document.write(jobCardHtml)
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

  const client = clients.find((c: any) => c.id === rfq?.client_id)

  // If job is created, show success + print option
  if (createdJob) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Created Successfully!</h2>
          <p className="text-gray-600 mb-2">Job Number: <span className="font-bold text-blue-600">{createdJob.job_number}</span></p>
          <p className="text-gray-600 mb-6">Job Card No: <span className="font-bold">{createdJob.job_card_no}</span></p>
          
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
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={24} /> Create Job Card
            </h2>
            <p className="text-blue-100 text-sm">QCL JC 001 - From RFQ: {rfq?.rfq_no || rfq?.enq_number}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg"><X size={24} /></button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          {/* Job Header Info - Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="text-xs text-gray-500 font-medium">Employee/Artisan</label>
              <select 
                value={jobData.employeeId} 
                onChange={e => setJobData(p => ({ ...p, employeeId: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-1"
              >
                <option value="">Select...</option>
                {workersList.filter(w => w.role === 'ARTISAN' || w.department === 'WORKSHOP').map(w => (
                  <option key={w.id} value={w.id}>{w.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Job Nr</label>
              <p className="font-bold text-lg text-blue-600 mt-1">Auto</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Job Card No</label>
              <p className="font-bold text-lg mt-1">Auto</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">RFQ</label>
              <p className="font-semibold mt-1">{rfq?.rfq_no || rfq?.enq_number || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Site Req</label>
              <input 
                type="text" 
                value={jobData.siteReq}
                onChange={e => setJobData(p => ({ ...p, siteReq: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-1"
                placeholder="e.g. 25/2/#04"
              />
            </div>
          </div>

          {/* Work Type & Compiled By */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Work Type</label>
              <div className="flex gap-2">
                <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center text-sm ${jobData.workType === 'CONTRACT' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="workType" value="CONTRACT" checked={jobData.workType === 'CONTRACT'} onChange={() => setJobData(p => ({ ...p, workType: 'CONTRACT' }))} className="sr-only" />
                  <span className="font-medium">Contract Work</span>
                </label>
                <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center text-sm ${jobData.workType === 'QUOTED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="workType" value="QUOTED" checked={jobData.workType === 'QUOTED'} onChange={() => setJobData(p => ({ ...p, workType: 'QUOTED' }))} className="sr-only" />
                  <span className="font-medium">Quoted Work</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compiled By</label>
              <select value={jobData.compiledBy} onChange={e => setJobData(p => ({ ...p, compiledBy: e.target.value }))} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select person...</option>
                {COMPILED_BY_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg font-semibold">{client?.company_name || '-'}</p>
            </div>
          </div>

          {/* Actions Required */}
          <div>
            <label className="block text-sm font-medium mb-2">ACTIONS REQUIRED</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ACTIONS_OPTIONS.map(action => (
                <label key={action.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm ${jobData.actionsRequired.includes(action.id) ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input 
                    type="checkbox" 
                    checked={jobData.actionsRequired.includes(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="rounded text-blue-600"
                  />
                  <span>{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Description / Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">JOB DESCRIPTION</label>
              <button type="button" onClick={addLineItem} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
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
                    <th className="px-3 py-2 text-left">Specification/Notes</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Item description" />
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
                        <input type="text" value={item.specification || ''} onChange={e => updateLineItem(index, 'specification', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Notes/spec" />
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

          {/* Drawing & Attached Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Drawing</label>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${jobData.hasDrawing ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                <input 
                  type="checkbox" 
                  checked={jobData.hasDrawing}
                  onChange={e => setJobData(p => ({ ...p, hasDrawing: e.target.checked }))}
                  className="rounded text-green-600"
                />
                <span>Drawing Attached / Sketches</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ATTACHED DOCUMENTS</label>
              <div className="grid grid-cols-2 gap-2">
                {ATTACHED_DOCS_OPTIONS.map(doc => (
                  <label key={doc.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-sm ${jobData.attachedDocs.includes(doc.id) ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                    <input 
                      type="checkbox" 
                      checked={jobData.attachedDocs.includes(doc.id)}
                      onChange={() => toggleAttachedDoc(doc.id)}
                      className="rounded text-green-600"
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Supervisor Planning */}
          <div>
            <label className="block text-sm font-medium mb-2">SUPERVISOR JOB PLANNING INFO</label>
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

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Supervisor</label>
              <select 
                value={jobData.supervisorId} 
                onChange={e => {
                  const sup = workersList.find(w => w.id === e.target.value)
                  setJobData(p => ({ 
                    ...p, 
                    supervisorId: e.target.value,
                    supervisorSignature: sup?.full_name || ''
                  }))
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select supervisor...</option>
                {workersList.filter(w => w.role === 'SUPERVISOR' || w.role === 'MANAGER' || w.role === 'ADMIN').map(w => (
                  <option key={w.id} value={w.id}>{w.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea value={jobData.notes} onChange={e => setJobData(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Additional notes..." />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <button onClick={handleClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
          <button 
            onClick={handleCreateJob} 
            disabled={loading || !jobData.dueDate} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : <><Briefcase size={18} /> Create Job Card</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// Generate Job Card HTML for printing
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
    .header-table { margin-bottom: 10px; }
    .header-cell { vertical-align: top; }
    .title { font-size: 14px; font-weight: bold; color: #1a365d; text-align: center; }
    .label { font-size: 9px; color: #666; }
    .value { font-weight: bold; }
    .checkbox { font-size: 14px; }
    .actions-table td { font-size: 10px; }
    .signature-line { border-bottom: 1px solid #000; min-height: 20px; margin-top: 5px; }
    .qc-title { background: #1a365d; color: white; padding: 5px; text-align: center; font-weight: bold; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width: 40%; border: 1px solid #000; padding: 10px;">
        <div style="font-size: 16px; font-weight: bold; color: #1a365d;">ERHA Fabrication & Construction</div>
        <div style="font-size: 10px; color: #666;">(Pty) Ltd</div>
      </td>
      <td style="width: 25%; border: 1px solid #000; text-align: center;">
        <div class="title">QC Department</div>
      </td>
      <td style="width: 35%; border: 1px solid #000; padding: 5px; font-size: 10px;">
        <div><strong>Approved date:</strong> 2022/12/06</div>
        <div><strong>Revision:</strong> 1</div>
        <div><strong>Next Revision date:</strong> 2023/12/06</div>
        <div><strong>Form no:</strong> QCL JC 001</div>
      </td>
    </tr>
  </table>

  <!-- Work Type -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 50%; border: 1px solid #000; padding: 8px;">
        <span class="checkbox">${job.work_type === 'CONTRACT' ? '☑' : '☐'}</span> <strong>Contract Work</strong>
        <div style="font-size: 9px; color: #666; margin-top: 3px;">Panels, Lances, EBT Devices, Taphole Flanges, Ladle</div>
      </td>
      <td style="width: 50%; border: 1px solid #000; padding: 8px;">
        <span class="checkbox">${job.work_type === 'QUOTED' ? '☑' : '☐'}</span> <strong>Quoted Work</strong>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px;">
        <span class="label">Compiled by:</span> <span class="value">${job.compiled_by || ''}</span>
      </td>
      <td style="border: 1px solid #000; padding: 5px;">
        <span class="label">Compiled by:</span> <span class="value">${job.compiled_by || ''}</span>
      </td>
    </tr>
  </table>

  <!-- Job Info -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="border: 1px solid #000; padding: 5px;">
        <span class="label">Employee:</span> <span class="value">${job.employee_name || ''}</span>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px;">
        <span class="label">Job Nr:</span> <span class="value">${job.job_number}</span>
        &nbsp;&nbsp;&nbsp;
        <span class="label">JOB CARD NO:</span> <span class="value">${job.job_card_no}</span>
        &nbsp;&nbsp;&nbsp;
        <span class="label">RFQ:</span> <span class="value">${job.rfq_number || ''}</span>
        &nbsp;&nbsp;&nbsp;
        <span class="label">SITE REQ:</span> <span class="value">${job.site_req || ''}</span>
      </td>
    </tr>
  </table>

  <!-- Actions Required -->
  <div style="font-weight: bold; margin-bottom: 5px;">ACTIONS REQUIRED</div>
  <table class="actions-table" style="margin-bottom: 10px;">
    ${actionsGrid.map(row => `<tr>${row.map(action => actionCheckbox(action)).join('')}</tr>`).join('')}
  </table>

  <!-- Job Description -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="border: 1px solid #000; padding: 8px; min-height: 60px;">
        <div class="label">JOB DESCRIPTION:</div>
        <div class="value" style="margin-top: 5px;">${job.description || ''}</div>
      </td>
      <td style="border: 1px solid #000; padding: 8px; width: 60px; text-align: center;">
        <div class="label">QTY</div>
        <div class="value">${job.line_items?.reduce((sum: number, li: any) => sum + (li.quantity || 0), 0) || ''}</div>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px;">
        <span class="label">DRAWING:</span> <span class="checkbox">${job.has_drawing ? '☑' : '☐'}</span>
      </td>
    </tr>
  </table>

  <!-- Attached Documents -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="border: 1px solid #000; padding: 8px;">
        <div class="label" style="margin-bottom: 5px;">ATTACHED DOCUMENTS:</div>
        <div>
          ${docCheckbox('service_schedule_qcp', 'Service Schedule/QCP')}
          ${docCheckbox('drawing_sketches', 'Drawing/Sketches')}
          ${docCheckbox('internal_order', 'Internal Order')}
        </div>
        <div style="margin-top: 3px;">
          ${docCheckbox('info_for_quote', 'Info for Quote')}
          ${docCheckbox('qcp', 'QCP')}
          ${docCheckbox('list_as_quoted', 'List as Quoted')}
        </div>
      </td>
    </tr>
  </table>

  <!-- Artisan Notice -->
  <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 8px; margin-bottom: 10px; font-size: 10px;">
    <strong>ARTISAN:</strong> Make sure you signed the Internal Transmittal to acknowledge the receipt of your job card and the attached documents mentioned above!
  </div>

  <!-- Supervisor Planning -->
  <table style="margin-bottom: 10px;">
    <tr style="background: #f3f4f6;">
      <td colspan="4" style="border: 1px solid #000; padding: 5px; font-weight: bold;">SUPERVISOR JOB PLANNING INFO</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px; text-align: center;"><span class="label">Date Received</span></td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center;"><span class="label">Material Ordered</span></td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center;"><span class="label">Completion Date</span></td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center;"><span class="label">DUE DATE</span></td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${job.date_received || ''}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${job.material_ordered || ''}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${job.completion_date || ''}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${job.due_date || ''}</td>
    </tr>
  </table>

  <!-- Signatures -->
  <table>
    <tr>
      <td style="border: 1px solid #000; padding: 10px; width: 50%;">
        <div class="label">SUPERVISOR SIGNATURE:</div>
        <div class="signature-line">${job.supervisor_name || ''}</div>
      </td>
      <td style="border: 1px solid #000; padding: 10px; width: 50%;">
        <div class="label">EMPLOYEE SIGNATURE:</div>
        <div class="signature-line">${job.employee_name || ''}</div>
      </td>
    </tr>
  </table>

</body>
</html>
`
}

export default CreateJobModal