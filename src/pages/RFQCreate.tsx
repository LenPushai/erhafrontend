import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface Client {
  id: string
  client_code: string
  company_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
}

interface LineItem {
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

const ITEM_TYPES = [
  { value: 'Material', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'Labour', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'Consumables', color: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'Transport', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 'Equipment', color: 'bg-pink-500 hover:bg-pink-600' },
  { value: 'Subcontract', color: 'bg-indigo-500 hover:bg-indigo-600' },
]

const WORKER_TYPES = ['Boilermaker', 'Welder', 'Coded Welder', 'Fitter', 'Rigger', 'General Worker', 'Supervisor']
const UOM_OPTIONS = ['EA', 'HR', 'KG', 'M', 'M2', 'M3', 'L', 'TRIP', 'DAY', 'SET']

const defaultLineItem = (): LineItem => ({
  item_type: 'Material',
  description: '',
  specification: '',
  worker_type: '',
  quantity: 1,
  uom: 'EA',
  cost_price: 0,
  sell_price: 0,
  line_total: 0,
})

export default function RFQCreate() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])

  const [form, setForm] = useState({
    client_id: '',
    description: '',
    priority: 'normal',
    date_received: new Date().toISOString().split('T')[0],
    required_by: '',
    site_location: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    query_source: '',
    drawing_number: '',
    media_received: '',
    department: '',
    assigned_quoter: '',
    actions_required: [] as string[],
  })

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('*').order('company_name')
      setClients(data || [])
    }
    fetchClients()
  }, [])

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setForm(prev => ({
        ...prev,
        client_id: clientId,
        contact_person: client.contact_person || '',
        contact_email: client.contact_email || '',
        contact_phone: client.contact_phone || '',
      }))
    }
  }

  const addLineItem = (type: string) => {
    const newItem = defaultLineItem()
    newItem.item_type = type
    if (type === 'Labour') newItem.uom = 'HR'
    if (type === 'Transport') newItem.uom = 'TRIP'
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems]
    ;(updated[index] as any)[field] = value
    if (field === 'quantity' || field === 'sell_price') {
      updated[index].line_total = updated[index].quantity * updated[index].sell_price
    }
    setLineItems(updated)
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: countData } = await supabase.from('rfqs').select('id', { count: 'exact' })
      const count = countData?.length || 0
      const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
      const { data: rfq, error: rfqError } = await supabase.from('rfqs').insert({
        rfq_number: rfqNumber,
        client_id: form.client_id,
        description: form.description,
        priority: form.priority,
        date_received: form.date_received,
        required_by: form.required_by || null,
        site_location: form.site_location,
        contact_person: form.contact_person,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        query_source: form.query_source,
        drawing_number: form.drawing_number,
        media_received: form.media_received,
        department: form.department,
        assigned_quoter: form.assigned_quoter,
        actions_required: form.actions_required,
        status: 'pending',
      }).select().single()
      if (rfqError) throw rfqError
      if (lineItems.length > 0 && rfq) {
        const lineItemsToInsert = lineItems.filter(item => item.description.trim()).map(item => ({
          rfq_id: rfq.id,
          item_type: item.item_type,
          description: item.description,
          specification: item.specification,
          worker_type: item.worker_type,
          quantity: item.quantity,
          uom: item.uom,
          cost_price: item.cost_price,
          sell_price: item.sell_price,
          line_total: item.line_total,
        }))
        if (lineItemsToInsert.length > 0) {
          const { error: lineError } = await supabase.from('rfq_line_items').insert(lineItemsToInsert)
          if (lineError) throw lineError
        }
      }
      navigate('/rfq')
    } catch (err: any) {
      setError(err.message || 'Failed to create RFQ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/rfq')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Create New RFQ</h1>
      </div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="px-4 py-3 border-b bg-blue-50 rounded-tr-xl"><h3 className="font-semibold text-gray-900">Client Information</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Client *</label><select value={form.client_id} onChange={e => handleClientChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" required><option value="">Select client...</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company_name} ({client.client_code})</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label><input type="text" value={form.site_location} onChange={e => updateForm('site_location', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g. Main Plant" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label><input type="text" value={form.contact_person} onChange={e => updateForm('contact_person', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label><input type="email" value={form.contact_email} onChange={e => updateForm('contact_email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label><input type="tel" value={form.contact_phone} onChange={e => updateForm('contact_phone', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="px-4 py-3 border-b bg-purple-50 rounded-tr-xl"><h3 className="font-semibold text-gray-900">RFQ Details</h3></div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea value={form.description} onChange={e => updateForm('description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" rows={3} required placeholder="Describe the work required..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={form.priority} onChange={e => updateForm('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label><input type="date" value={form.date_received} onChange={e => updateForm('date_received', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Required By</label><input type="date" value={form.required_by} onChange={e => updateForm('required_by', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="px-4 py-3 border-b bg-green-50 rounded-tr-xl"><h3 className="font-semibold text-gray-900">ENQ Report Information</h3></div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Drawing Number</label><input type="text" value={form.drawing_number} onChange={e => updateForm('drawing_number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g. x or DWG-001" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Requested/Received By</label><input type="text" value={form.query_source} onChange={e => updateForm('query_source', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g. ROELF VAN DEVENTER" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Media Received</label><select value={form.media_received} onChange={e => updateForm('media_received', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option value="">Select...</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL_CLIENT">Email (Client)</option><option value="EMAIL_ERHA">Email (ERHA)</option><option value="RFQ">RFQ</option><option value="OTHER">Other</option></select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Department of C.G</label><div className="flex flex-wrap gap-4">{['MELTSHOP', 'MILLS', 'SHARON', 'OREN', 'STORES', 'GENERAL', 'MRSTD'].map(dept => <label key={dept} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="department_cg" value={dept} checked={form.department === dept} onChange={e => updateForm('department', e.target.value)} className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-700">{dept}</span></label>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Quotation (Assign To)</label><div className="flex flex-wrap gap-4">{['HENDRIK', 'DEWALD', 'ESTIMATOR', 'JACO'].map(quoter => <label key={quoter} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="assigned_quoter" value={quoter} checked={form.assigned_quoter === quoter} onChange={e => updateForm('assigned_quoter', e.target.value)} className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700">{quoter}</span></label>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Actions Required</label><div className="flex flex-wrap gap-3">{['QUOTE', 'CUT', 'SERVICE', 'REPAIR', 'PAINT', 'MANUFACTURE', 'MODIFY', 'MACHINING', 'SANDBLAST', 'BREAKDOWN', 'SUPPLY', 'CHANGE', 'INSTALLATION', 'OTHER'].map(action => <label key={action} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100"><input type="checkbox" checked={form.actions_required.includes(action)} onChange={e => { if (e.target.checked) updateForm('actions_required', [...form.actions_required, action]); else updateForm('actions_required', form.actions_required.filter(a => a !== action)) }} className="w-4 h-4 text-green-600 rounded" /><span className="text-sm text-gray-700">{action}</span></label>)}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="px-4 py-3 border-b bg-orange-50 rounded-tr-xl"><h3 className="font-semibold text-gray-900">Line Items</h3></div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-4">{ITEM_TYPES.map(type => <button key={type.value} type="button" onClick={() => addLineItem(type.value)} className={`${type.color} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1`}><Plus size={16} /> {type.value}</button>)}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-left">Spec</th><th className="px-3 py-2 text-left">Worker</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-left">UOM</th><th className="px-3 py-2 text-right">Cost</th><th className="px-3 py-2 text-right">Sell</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2"></th></tr></thead>
                <tbody>{lineItems.map((item, index) => <tr key={index} className="border-b"><td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs text-white ${ITEM_TYPES.find(t => t.value === item.item_type)?.color.split(' ')[0] || 'bg-gray-500'}`}>{item.item_type}</span></td><td className="px-3 py-2"><input type="text" value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Description" /></td><td className="px-3 py-2"><input type="text" value={item.specification} onChange={e => updateLineItem(index, 'specification', e.target.value)} className="w-24 px-2 py-1 border rounded" placeholder="Spec" /></td><td className="px-3 py-2">{item.item_type === 'Labour' ? <select value={item.worker_type} onChange={e => updateLineItem(index, 'worker_type', e.target.value)} className="w-32 px-2 py-1 border rounded"><option value="">Select...</option>{WORKER_TYPES.map(w => <option key={w} value={w}>{w}</option>)}</select> : <span className="text-gray-400">-</span>}</td><td className="px-3 py-2"><input type="number" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-right" min="0" step="0.5" /></td><td className="px-3 py-2"><select value={item.uom} onChange={e => updateLineItem(index, 'uom', e.target.value)} className="w-20 px-2 py-1 border rounded">{UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}</select></td><td className="px-3 py-2"><input type="number" value={item.cost_price} onChange={e => updateLineItem(index, 'cost_price', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border rounded text-right" min="0" step="0.01" /></td><td className="px-3 py-2"><input type="number" value={item.sell_price} onChange={e => updateLineItem(index, 'sell_price', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border rounded text-right" min="0" step="0.01" /></td><td className="px-3 py-2 text-right font-medium">R {item.line_total.toFixed(2)}</td><td className="px-3 py-2"><button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button></td></tr>)}</tbody>
                <tfoot className="bg-gray-50 font-medium"><tr><td colSpan={8} className="px-3 py-2 text-right">Total:</td><td className="px-3 py-2 text-right">R {lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}</td><td></td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/rfq')} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Save size={18} />{loading ? 'Creating...' : 'Create RFQ'}</button>
        </div>
      </form>
    </div>
  )
}