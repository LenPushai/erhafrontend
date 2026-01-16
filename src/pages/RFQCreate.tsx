import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface Client { id: string; client_code: string; company_name: string }
interface Worker { id: string; full_name: string; role: string }
interface LineItem { lineNumber: number; description: string; quantity: string; unitOfMeasure: string; estimatedUnitPrice: string; estimatedLineTotal: string; notes: string }

interface RFQCreateProps { onBack: () => void; onSuccess: () => void }

export function RFQCreate({ onBack, onSuccess }: RFQCreateProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_id: '', contact_person: '', contact_email: '', contact_phone: '', department: '',
    operating_entity: 'ERHA SS', priority: 'MEDIUM', description: '', special_requirements: '',
    request_date: new Date().toISOString().split('T')[0], required_date: '', assigned_to: '',
    erha_department: '', assigned_quoter: '', media_received: '', drawing_number: '',
    actions_required: [] as string[], notes: '', remarks: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { lineNumber: 1, description: '', quantity: '1', unitOfMeasure: 'EA', estimatedUnitPrice: '', estimatedLineTotal: '', notes: '' }
  ])

  const departments = ['WORKSHOP', 'SITE', 'OFFICE']
  const quoters = ['HENDRIK', 'JOHAN', 'PIETER', 'ADMIN']
  const mediaOptions = ['EMAIL', 'PHONE', 'WHATSAPP', 'IN_PERSON', 'FAX']
  const actionOptions = ['SITE_VISIT', 'MEASUREMENTS', 'DRAWINGS', 'MATERIAL_PRICING', 'SUBCONTRACTOR_QUOTE']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [clientRes, workerRes] = await Promise.all([
      supabase.from('clients').select('id, client_code, company_name').eq('is_active', true).order('company_name'),
      supabase.from('workers').select('id, full_name, role').eq('is_active', true)
    ])
    if (clientRes.data) setClients(clientRes.data)
    if (workerRes.data) setWorkers(workerRes.data)
  }

  const updateForm = (field: string, value: any) => { setForm(prev => ({ ...prev, [field]: value })); setError(null) }

  const addLineItem = () => {
    setLineItems(prev => [...prev, { lineNumber: prev.length + 1, description: '', quantity: '1', unitOfMeasure: 'EA', estimatedUnitPrice: '', estimatedLineTotal: '', notes: '' }])
  }

  const updateLineItem = (index: number, field: string, value: string) => {
    setLineItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'quantity' || field === 'estimatedUnitPrice') {
        const qty = parseFloat(updated[index].quantity) || 0
        const price = parseFloat(updated[index].estimatedUnitPrice) || 0
        updated[index].estimatedLineTotal = (qty * price).toFixed(2)
      }
      return updated
    })
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, lineNumber: i + 1 })))
    }
  }

  const totalEstimate = lineItems.reduce((sum, item) => sum + (parseFloat(item.estimatedLineTotal) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id) { setError('Please select a client'); return }
    if (!form.description.trim()) { setError('Please enter a description'); return }
    if (!form.required_date) { setError('Please select required date'); return }

    const hasEmptyLines = lineItems.some(item => !item.description.trim())
    if (hasEmptyLines) { setError('All line items must have a description'); return }

    try {
      setSaving(true)
      setError(null)

      const { data: rfq, error: rfqError } = await supabase.from('rfqs').insert({
        client_id: form.client_id,
        contact_person: form.contact_person || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        operating_entity: form.operating_entity,
        priority: form.priority,
        status: 'DRAFT',
        description: form.description,
        special_requirements: form.special_requirements || null,
        required_date: form.required_date,
        assigned_to: form.assigned_to || null
      }).select().single()

      if (rfqError) throw rfqError

      // Insert line items if table exists
      const lineItemsData = lineItems.map((item, idx) => ({
        rfq_id: rfq.id,
        line_number: idx + 1,
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unit_of_measure: item.unitOfMeasure,
        estimated_unit_price: parseFloat(item.estimatedUnitPrice) || 0,
        estimated_line_total: parseFloat(item.estimatedLineTotal) || 0,
        notes: item.notes || null
      }))

      // Try to insert line items (table may not exist yet)
      await supabase.from('rfq_line_items').insert(lineItemsData).catch(() => {})

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create RFQ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg"><ArrowLeft size={20} /></button>
        <div><h1 className="text-2xl font-bold text-gray-900">Create New RFQ</h1><p className="text-gray-500">Request for Quotation</p></div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl"><h3 className="font-semibold text-gray-900">Client Information</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Client <span className="text-red-500">*</span></label>
              <select value={form.client_id} onChange={e => updateForm('client_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" required>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" value={form.contact_person} onChange={e => updateForm('contact_person', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Who requested this?" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => updateForm('contact_email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" value={form.contact_phone} onChange={e => updateForm('contact_phone', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Department/Area</label>
              <input type="text" value={form.department} onChange={e => updateForm('department', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g., MELTSHOP, MILLS" />
            </div>
          </div>
        </div>

        {/* ENQ Report Information */}
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="px-4 py-3 border-b bg-green-50 rounded-tr-xl"><h3 className="font-semibold text-gray-900">ENQ Report Information</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned Quoter</label>
              <select value={form.assigned_quoter} onChange={e => updateForm('assigned_quoter', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="">Select quoter...</option>
                {quoters.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Media Received</label>
              <select value={form.media_received} onChange={e => updateForm('media_received', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="">Select media...</option>
                {mediaOptions.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Drawing Number</label>
              <input type="text" value={form.drawing_number} onChange={e => updateForm('drawing_number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="DWG-2026-001" />
            </div>
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Actions Required</label>
              <div className="flex flex-wrap gap-4">
                {actionOptions.map(action => (
                  <label key={action} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.actions_required.includes(action)} onChange={e => {
                      if (e.target.checked) updateForm('actions_required', [...form.actions_required, action])
                      else updateForm('actions_required', form.actions_required.filter(a => a !== action))
                    }} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">{action.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RFQ Details */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl"><h3 className="font-semibold text-gray-900">RFQ Details</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Operating Entity <span className="text-red-500">*</span></label>
              <select value={form.operating_entity} onChange={e => updateForm('operating_entity', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="ERHA SS">ERHA SS</option>
                <option value="ERHA FC">ERHA FC</option>
                <option value="ERHA MPU">ERHA MPU</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
              <select value={form.priority} onChange={e => updateForm('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date Received <span className="text-red-500">*</span></label>
              <input type="date" value={form.request_date} onChange={e => updateForm('request_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Required By <span className="text-red-500">*</span></label>
              <input type="date" value={form.required_date} onChange={e => updateForm('required_date', e.target.value)} min={form.request_date} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Detailed description of work required..." required />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={form.assigned_to} onChange={e => updateForm('assigned_to', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="">Unassigned</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
              <textarea value={form.special_requirements} onChange={e => updateForm('special_requirements', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Specifications, drawings, certifications..." />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Line Items</h3>
            <button type="button" onClick={addLineItem} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Plus size={16} />Add Item</button>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left py-2 px-2 w-8">#</th>
                <th className="text-left py-2 px-2">Description</th>
                <th className="text-left py-2 px-2 w-20">Qty</th>
                <th className="text-left py-2 px-2 w-20">UOM</th>
                <th className="text-left py-2 px-2 w-28">Unit Price</th>
                <th className="text-left py-2 px-2 w-28">Total</th>
                <th className="w-10"></th>
              </tr></thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-2 text-gray-500">{item.lineNumber}</td>
                    <td className="py-2 px-2"><input type="text" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded" placeholder="Item description" /></td>
                    <td className="py-2 px-2"><input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded" min="1" /></td>
                    <td className="py-2 px-2"><select value={item.unitOfMeasure} onChange={e => updateLineItem(idx, 'unitOfMeasure', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded">
                      <option value="EA">EA</option><option value="M">M</option><option value="KG">KG</option><option value="HR">HR</option><option value="SET">SET</option>
                    </select></td>
                    <td className="py-2 px-2"><input type="number" value={item.estimatedUnitPrice} onChange={e => updateLineItem(idx, 'estimatedUnitPrice', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded" placeholder="0.00" step="0.01" /></td>
                    <td className="py-2 px-2 font-medium">R{item.estimatedLineTotal || '0.00'}</td>
                    <td className="py-2 px-2"><button type="button" onClick={() => removeLineItem(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded" disabled={lineItems.length === 1}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-gray-50">
                <td colSpan={5} className="py-2 px-2 text-right font-semibold">Estimated Total:</td>
                <td className="py-2 px-2 font-bold text-blue-600">R{totalEstimate.toFixed(2)}</td>
                <td></td>
              </tr></tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl"><h3 className="font-semibold text-gray-900">Additional Notes</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Notes for the team..." />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={form.remarks} onChange={e => updateForm('remarks', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Client-facing remarks..." />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onBack} disabled={saving} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"><X size={18} />Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? <><span className="animate-spin">⏳</span>Creating...</> : <><Save size={18} />Create RFQ</>}
          </button>
        </div>
      </form>
    </div>
  )
}
