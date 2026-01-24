import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Briefcase, Download } from 'lucide-react'
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
  onJobCreated: (job: any) => void
}

const UOM_OPTIONS = [
  { value: 'EA', label: 'Each' }, { value: 'M', label: 'Metres' }, { value: 'M2', label: 'Sq Metres' },
  { value: 'KG', label: 'Kilograms' }, { value: 'HR', label: 'Hours' }, { value: 'DAY', label: 'Days' },
  { value: 'LOT', label: 'Lump Sum' }, { value: 'SET', label: 'Set' }
]

const ACTIONS_OPTIONS = ['MANUFACTURE', 'SERVICE', 'REPAIR', 'MODIFY', 'CUT', 'SANDBLAST', 'PAINT', 'INSTALLATION', 'PREPARE MATERIAL', 'OTHER']
const COMPILED_BY_OPTIONS = ['Zoey', 'Jeanic', 'Juanic', 'Hendrik', 'Dewald', 'Jaco']

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, rfq, rfqLineItems, clients, onJobCreated }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Job form state
  const [jobData, setJobData] = useState({
    workType: 'QUOTED' as 'CONTRACT' | 'QUOTED',
    compiledBy: '',
    actionsRequired: [] as string[],
    dueDate: rfq?.required_date || '',
    materialOrdered: '',
    completionDate: '',
    notes: ''
  })
  
  // Line items state (pre-filled from RFQ)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  
  // Initialize line items from RFQ
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
      setLineItems([{ description: '', quantity: 1, uom: 'EA', specification: '', can_spawn_job: true }])
    }
    
    // Pre-fill actions from RFQ
    if (rfq?.actions_required) {
      const actions = typeof rfq.actions_required === 'string' 
        ? rfq.actions_required.split(',').map((a: string) => a.trim().toUpperCase())
        : rfq.actions_required
      setJobData(prev => ({ ...prev, actionsRequired: actions }))
    }
    
    setJobData(prev => ({ ...prev, dueDate: rfq?.required_date || '' }))
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
  
  const handleCreateJob = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 1. Generate job number (YY-XXX format like ERHA uses)
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
          description: rfq.description,
          compiled_by: jobData.compiledBy,
          actions_required: jobData.actionsRequired.join(','),
          
          // RFQ Reference
          rfq_id: rfq.id,
          rfq_number: rfq.rfq_no || rfq.enq_number,
          order_number: rfq.order_number,
          
          // Value
          job_value: rfq.quote_value_incl_vat || rfq.quote_value_excl_vat || rfq.estimated_value,
          
          // Dates
          priority: rfq.priority || 'MEDIUM',
          due_date: jobData.dueDate,
          date_received: new Date().toISOString().split('T')[0],
          material_ordered_date: jobData.materialOrdered || null,
          completion_date: jobData.completionDate || null,
          
          // Organization
          department: rfq.department,
          operating_entity: rfq.operating_entity,
          
          // ENQ Report Fields
          drawing_number: rfq.drawing_number || null,
          media_received: rfq.media_received || null,
          
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
      
      // 7. Notify parent and close modal
      onJobCreated({ ...newJob, job_number: jobNumber })
      onClose()
      
    } catch (err: any) {
      console.error('Error creating job:', err)
      setError(err.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  const client = clients.find((c: any) => c.id === rfq?.client_id)
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase size={24} /> Create Job Card
            </h2>
            <p className="text-blue-100 text-sm">From RFQ: {rfq?.rfq_no || rfq?.enq_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X size={24} /></button>
        </div>
        
        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          
          {/* Job Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs text-gray-500">Job Number</label>
              <p className="font-bold text-lg text-blue-600">Auto-generated</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Client</label>
              <p className="font-semibold">{client?.company_name || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">RFQ Reference</label>
              <p className="font-semibold">{rfq?.rfq_no || rfq?.enq_number || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Order/PO Number</label>
              <p className="font-semibold">{rfq?.order_number || '-'}</p>
            </div>
          </div>
          
          {/* Work Type & Compiled By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Work Type</label>
              <div className="flex gap-4">
                <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center ${jobData.workType === 'CONTRACT' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="workType" value="CONTRACT" checked={jobData.workType === 'CONTRACT'} onChange={() => setJobData(p => ({ ...p, workType: 'CONTRACT' }))} className="sr-only" />
                  <span className="font-medium">Contract Work</span>
                </label>
                <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center ${jobData.workType === 'QUOTED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
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
          </div>
          
          {/* Actions Required */}
          <div>
            <label className="block text-sm font-medium mb-2">Actions Required</label>
            <div className="flex flex-wrap gap-2">
              {ACTIONS_OPTIONS.map(action => (
                <button key={action} type="button" onClick={() => toggleAction(action)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${jobData.actionsRequired.includes(action) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>
                  {action}
                </button>
              ))}
            </div>
          </div>
          
          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Line Items</label>
              <button type="button" onClick={addLineItem} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                <Plus size={16} /> Add Item
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-left w-20">Qty</th>
                    <th className="px-3 py-2 text-left w-24">UOM</th>
                    <th className="px-3 py-2 text-left">Specification</th>
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
          
          {/* Supervisor Planning */}
          <div>
            <label className="block text-sm font-medium mb-2">Supervisor Planning</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Due Date *</label>
                <input type="date" value={jobData.dueDate} onChange={e => setJobData(p => ({ ...p, dueDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Material Ordered</label>
                <input type="date" value={jobData.materialOrdered} onChange={e => setJobData(p => ({ ...p, materialOrdered: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Completion Date</label>
                <input type="date" value={jobData.completionDate} onChange={e => setJobData(p => ({ ...p, completionDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
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
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleCreateJob} disabled={loading || !jobData.dueDate} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Creating...' : <><Briefcase size={18} /> Create Job & Download PDF</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobModal

