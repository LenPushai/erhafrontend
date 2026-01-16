import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Eye, Edit2, Trash2, Plus, Search, X, ArrowLeft, Save, FileText, Upload, Send, Briefcase, Printer, Download } from 'lucide-react'
import WorkflowTracker from '../components/WorkflowTracker'

interface Client { id: string; company_name: string; contact_person: string; contact_email: string; contact_phone: string }
interface Worker { id: string; full_name: string; role: string }
interface LineItem {
  id?: string; line_number: number; item_type: string; description: string; specification: string
  quantity: number; unit_of_measure: string; cost_price: number; unit_price: number
  line_total: number; worker_type: string; notes: string; is_optional: boolean
}
interface RFQ {
  id: string; rfq_no: string; client_id: string; description: string; status: string
  priority: string; request_date: string; required_date: string; estimated_value: number
  contact_person: string; contact_email: string; contact_phone: string; department: string
  operating_entity: string; special_requirements: string; assigned_quoter_id: string
  follow_up_date: string; notes: string; remarks: string; media_received: string
  actions_required: string; drawing_number: string; created_at: string
  quote_number?: string; quote_status?: string; quote_value_excl_vat?: number
  quote_value_incl_vat?: number; quote_date?: string; order_number?: string
  order_date?: string; job_id?: string; invoice_number?: string; invoice_date?: string
}

const ITEM_TYPES = [
  { value: 'MATERIAL', label: 'Material', color: '#3b82f6' },
  { value: 'LABOUR', label: 'Labour', color: '#10b981' },
  { value: 'CONSUMABLES', label: 'Consumables', color: '#f59e0b' },
  { value: 'TRANSPORT', label: 'Transport', color: '#8b5cf6' },
  { value: 'EQUIPMENT', label: 'Equipment', color: '#ec4899' },
  { value: 'SUBCONTRACT', label: 'Subcontract', color: '#6366f1' }
]

const WORKER_TYPES = [
  { value: 'BOILERMAKER', label: 'Boilermaker' }, { value: 'WELDER', label: 'Welder' },
  { value: 'CODED_WELDER', label: 'Coded Welder' }, { value: 'FITTER', label: 'Fitter' },
  { value: 'MACHINIST', label: 'Machinist' }, { value: 'RIGGER', label: 'Rigger' },
  { value: 'HELPER', label: 'Helper' }, { value: 'SUPERVISOR', label: 'Supervisor' }
]

const UOM_OPTIONS = [
  { value: 'EA', label: 'Each' }, { value: 'M', label: 'Metres' }, { value: 'M2', label: 'Sq Metres' },
  { value: 'KG', label: 'Kilograms' }, { value: 'HR', label: 'Hours' }, { value: 'DAY', label: 'Days' },
  { value: 'TRIP', label: 'Trip' }, { value: 'LOT', label: 'Lump Sum' }, { value: 'SET', label: 'Set' }, { value: 'L', label: 'Litres' }
]

const RFQPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'detail' | 'edit'>('list')
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [rfqLineItems, setRfqLineItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const isMounted = useRef(true)

  const [formData, setFormData] = useState({
    client_id: '', contact_person: '', contact_email: '', contact_phone: '', department: '',
    operating_entity: 'ERHA FC', description: '', request_date: new Date().toISOString().split('T')[0],
    required_date: '', priority: 'MEDIUM', special_requirements: '', assigned_to: '',
    follow_up_date: '', notes: '', remarks: '', assigned_quoter_id: '', media_received: '',
    actions_required: [] as string[], drawing_number: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  const actionsOptions = ['Quote', 'Cut', 'Service', 'Repair', 'Form', 'Manufacture', 'Modify', 'Machining', 'SandBlast', 'Demolition', 'Supply', 'Cleanup', 'Installation', 'Other']
  const mediaOptions = ['Email', 'Phone', 'WhatsApp', 'In Person', 'Drawing', 'Sample']

  useEffect(() => {
    isMounted.current = true
    loadData()
    return () => { isMounted.current = false }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rfqRes, clientRes, workerRes] = await Promise.all([
        supabase.from('rfqs').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('company_name'),
        supabase.from('workers').select('*').order('full_name')
      ])
      if (isMounted.current) {
        setRfqs(rfqRes.data || [])
        setClients(clientRes.data || [])
        setWorkers(workerRes.data || [])
      }
    } catch (err) { console.error(err) }
    finally { if (isMounted.current) setLoading(false) }
  }

  const loadRfqLineItems = async (rfqId: string) => {
    try {
      const { data, error } = await supabase.from('rfq_line_items').select('*').eq('rfq_id', rfqId).order('line_number')
      if (!error && data) setRfqLineItems(data)
      else setRfqLineItems([])
    } catch (err) { setRfqLineItems([]) }
  }

  const getClientName = (id: string) => clients.find(c => c.id === id)?.company_name || '-'
  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.full_name || '-'
  const formatCurrency = (val: number | null | undefined) => val ? `R ${val.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'N/A'
  const formatDate = (date: string | null | undefined) => date ? new Date(date).toLocaleDateString('en-ZA') : 'N/A'

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    setFormData(prev => ({ ...prev, client_id: clientId, contact_person: client?.contact_person || '', contact_email: client?.contact_email || '', contact_phone: client?.contact_phone || '' }))
  }

  const addLineItem = (itemType: string = 'MATERIAL') => {
    const defaultUom = itemType === 'LABOUR' ? 'HR' : itemType === 'TRANSPORT' ? 'TRIP' : itemType === 'EQUIPMENT' ? 'HR' : 'EA'
    setLineItems([...lineItems, { line_number: lineItems.length + 1, item_type: itemType, description: '', specification: '', quantity: 1, unit_of_measure: defaultUom, cost_price: 0, unit_price: 0, line_total: 0, worker_type: '', notes: '', is_optional: false }])
  }

  const updateLineItem = (idx: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'quantity' || field === 'unit_price') updated[idx].line_total = (updated[idx].quantity || 0) * (updated[idx].unit_price || 0)
    if (field === 'item_type') { updated[idx].unit_of_measure = value === 'LABOUR' ? 'HR' : value === 'TRANSPORT' ? 'TRIP' : value === 'EQUIPMENT' ? 'HR' : 'EA'; updated[idx].worker_type = '' }
    setLineItems(updated)
  }

  const removeLineItem = (idx: number) => {
    const updated = lineItems.filter((_, i) => i !== idx)
    updated.forEach((item, i) => item.line_number = i + 1)
    setLineItems(updated)
  }

  const totalValue = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0)
  const totalCost = lineItems.reduce((sum, item) => sum + ((item.cost_price || 0) * (item.quantity || 0)), 0)
  const margin = totalValue > 0 ? ((totalValue - totalCost) / totalValue * 100).toFixed(1) : '0'

  const resetForm = () => {
    setFormData({ client_id: '', contact_person: '', contact_email: '', contact_phone: '', department: '', operating_entity: 'ERHA FC', description: '', request_date: new Date().toISOString().split('T')[0], required_date: '', priority: 'MEDIUM', special_requirements: '', assigned_to: '', follow_up_date: '', notes: '', remarks: '', assigned_quoter_id: '', media_received: '', actions_required: [], drawing_number: '' })
    setLineItems([])
    setError(null)
  }

  const handleView = async (rfq: RFQ) => {
    setSelectedRfq(rfq)
    await loadRfqLineItems(rfq.id)
    setView('detail')
  }

  const handleEdit = (rfq: RFQ) => {
    setSelectedRfq(rfq)
    setFormData({ client_id: rfq.client_id || '', contact_person: rfq.contact_person || '', contact_email: rfq.contact_email || '', contact_phone: rfq.contact_phone || '', department: rfq.department || '', operating_entity: rfq.operating_entity || 'ERHA FC', description: rfq.description || '', request_date: rfq.request_date || '', required_date: rfq.required_date || '', priority: rfq.priority || 'MEDIUM', special_requirements: rfq.special_requirements || '', assigned_to: '', follow_up_date: rfq.follow_up_date || '', notes: rfq.notes || '', remarks: rfq.remarks || '', assigned_quoter_id: rfq.assigned_quoter_id || '', media_received: rfq.media_received || '', actions_required: rfq.actions_required ? rfq.actions_required.split(',') : [], drawing_number: rfq.drawing_number || '' })
    setView('edit')
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('rfq_line_items').delete().eq('rfq_id', id)
      const { error } = await supabase.from('rfqs').delete().eq('id', id)
      if (error) throw error
      setSuccess('RFQ deleted successfully')
      setDeleteConfirm(null)
      await loadData()
    } catch (err: any) { setError(err.message) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id) { setError('Please select a client'); return }
    if (!formData.description.trim()) { setError('Please enter a description'); return }
    if (!formData.required_date) { setError('Please select required date'); return }

    setSaving(true); setError(null)
    try {
      const rfqData = { client_id: formData.client_id, contact_person: formData.contact_person, contact_email: formData.contact_email || null, contact_phone: formData.contact_phone || null, department: formData.department || null, operating_entity: formData.operating_entity, description: formData.description, request_date: formData.request_date, required_date: formData.required_date, priority: formData.priority, estimated_value: totalValue || null, special_requirements: formData.special_requirements || null, assigned_quoter_id: formData.assigned_quoter_id || null, follow_up_date: formData.follow_up_date || null, notes: formData.notes || null, remarks: formData.remarks || null, media_received: formData.media_received || null, actions_required: formData.actions_required.length > 0 ? formData.actions_required.join(',') : null, drawing_number: formData.drawing_number || null }

      if (view === 'edit' && selectedRfq) {
        const { error: err } = await supabase.from('rfqs').update(rfqData).eq('id', selectedRfq.id)
        if (err) throw err
        setSuccess('RFQ updated successfully')
      } else {
        const { data, error: err } = await supabase.from('rfqs').insert([{ ...rfqData, status: 'NEW' }]).select().single()
        if (err) throw err
        if (lineItems.length > 0 && data) {
          await supabase.from('rfq_line_items').insert(lineItems.map((item, i) => ({ rfq_id: data.id, line_number: i + 1, item_type: item.item_type, description: item.description, specification: item.specification || null, quantity: item.quantity, unit_of_measure: item.unit_of_measure, cost_price: item.cost_price || null, unit_price: item.unit_price, line_total: item.line_total, worker_type: item.worker_type || null, notes: item.notes || null, is_optional: item.is_optional })))
        }
        setSuccess('RFQ created successfully')
      }
      await loadData(); setView('list')
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const getItemTypeColor = (type: string) => ITEM_TYPES.find(t => t.value === type)?.color || '#6b7280'
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { NEW: 'bg-blue-100 text-blue-800', DRAFT: 'bg-gray-100 text-gray-800', PENDING: 'bg-yellow-100 text-yellow-800', QUOTED: 'bg-purple-100 text-purple-800', ACCEPTED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800' }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = { LOW: 'bg-gray-100 text-gray-700', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-orange-100 text-orange-700', URGENT: 'bg-red-100 text-red-700' }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  // ========== LIST VIEW ==========
  if (view === 'list') {
    const filtered = rfqs.filter(r => r.rfq_no?.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase()) || getClientName(r.client_id).toLowerCase().includes(searchTerm.toLowerCase()))
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1><p className="text-sm text-gray-500 mt-1">Manage requests for quotation</p></div>
          <button onClick={() => { resetForm(); setView('create') }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"><Plus size={18} /> New RFQ</button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between">{error}<button onClick={() => setError(null)}><X size={18} /></button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between">{success}<button onClick={() => setSuccess(null)}><X size={18} /></button></div>}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by RFQ number, client, or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">RFQ No</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Required</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y">{loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No RFQs found</td></tr> : filtered.map(rfq => (
              <tr key={rfq.id} className="hover:bg-gray-50"><td className="px-4 py-3"><span className="text-blue-600 font-medium">{rfq.rfq_no || '-'}</span></td><td className="px-4 py-3 font-medium">{getClientName(rfq.client_id)}</td><td className="px-4 py-3 text-gray-600 max-w-xs truncate">{rfq.description}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>{rfq.status}</span></td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rfq.priority)}`}>{rfq.priority}</span></td><td className="px-4 py-3 text-gray-600">{rfq.required_date || '-'}</td><td className="px-4 py-3 font-medium">R {(rfq.estimated_value || 0).toLocaleString()}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => handleView(rfq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={16} /></button><button onClick={() => handleEdit(rfq)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit"><Edit2 size={16} /></button><button onClick={() => setDeleteConfirm(rfq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button></div></td></tr>
            ))}</tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">Showing {filtered.length} of {rfqs.length} RFQs</div>
        </div>
        {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"><h3 className="text-lg font-semibold mb-2">Delete RFQ?</h3><p className="text-gray-600 mb-4">This will also delete all line items. This action cannot be undone.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>}
      </div>
    )
  }

  // ========== DETAIL VIEW - COMPREHENSIVE ==========
  if (view === 'detail' && selectedRfq) {
    const lineItemsTotal = rfqLineItems.reduce((sum, item) => sum + (item.line_total || 0), 0)
    return (
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setView('list')}>RFQs</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{selectedRfq.rfq_no || `#${selectedRfq.id.slice(0,8)}`}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold">{selectedRfq.rfq_no || 'RFQ Details'}</h1>
              <p className="text-gray-500">{selectedRfq.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(selectedRfq)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><Edit2 size={16} /> Edit</button>
            <button onClick={() => setDeleteConfirm(selectedRfq.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 size={16} /> Delete</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Information Card */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 text-white font-semibold">RFQ Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">RFQ Number:</span><p className="font-medium">{selectedRfq.rfq_no || '-'}</p></div>
                <div><span className="text-gray-500">Status:</span><p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRfq.status)}`}>{selectedRfq.status}</span></p></div>
                <div><span className="text-gray-500">Client:</span><p className="font-medium">{getClientName(selectedRfq.client_id)}</p></div>
                <div><span className="text-gray-500">Priority:</span><p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRfq.priority)}`}>{selectedRfq.priority}</span></p></div>
                <div><span className="text-gray-500">Operating Entity:</span><p className="font-medium">{selectedRfq.operating_entity || '-'}</p></div>
                <div><span className="text-gray-500">Contact Person:</span><p className="font-medium">{selectedRfq.contact_person || '-'}</p></div>
                <div><span className="text-gray-500">Contact Email:</span><p className="font-medium">{selectedRfq.contact_email || '-'}</p></div>
                <div><span className="text-gray-500">Contact Phone:</span><p className="font-medium">{selectedRfq.contact_phone || '-'}</p></div>
                <div className="col-span-2"><span className="text-gray-500">Description:</span><p className="font-medium">{selectedRfq.description || '-'}</p></div>
                <div><span className="text-gray-500">Request Date:</span><p className="font-medium">{formatDate(selectedRfq.request_date)}</p></div>
                <div><span className="text-gray-500">Required By:</span><p className="font-medium">{formatDate(selectedRfq.required_date)}</p></div>
                <div><span className="text-gray-500">Estimated Value:</span><p className="font-medium text-green-600">{formatCurrency(selectedRfq.estimated_value)}</p></div>
              </div>
            </div>

            {/* ENQ Report Information Card */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#22c55e' }}>
              <div className="px-4 py-3 font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>ENQ Report Information</div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">Department:</span><p className="font-medium">{selectedRfq.department || '-'}</p></div>
                <div><span className="text-gray-500">Assigned Quoter:</span><p className="font-medium">{selectedRfq.assigned_quoter_id ? getWorkerName(selectedRfq.assigned_quoter_id) : '-'}</p></div>
                <div><span className="text-gray-500">Media Received:</span><p className="font-medium">{selectedRfq.media_received || '-'}</p></div>
                <div><span className="text-gray-500">Drawing Number:</span><p className="font-medium">{selectedRfq.drawing_number || '-'}</p></div>
                <div className="col-span-2 md:col-span-4">
                  <span className="text-gray-500">Actions Required:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedRfq.actions_required ? selectedRfq.actions_required.split(',').map((action, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{action}</span>
                    )) : <span className="text-gray-400">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            {rfqLineItems.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#0ea5e9' }}>
                <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#0ea5e9' }}>Line Items ({rfqLineItems.length})</div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-left">Qty</th><th className="px-3 py-2 text-left">UOM</th><th className="px-3 py-2 text-right">Unit Price</th><th className="px-3 py-2 text-right">Total</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {rfqLineItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{item.line_number}</td>
                        <td className="px-3 py-2"><span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: getItemTypeColor(item.item_type) }}>{item.item_type}</span></td>
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{item.unit_of_measure}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50">
                    <tr><td colSpan={6} className="px-3 py-2 text-right font-semibold">Total:</td><td className="px-3 py-2 text-right font-bold text-green-600">{formatCurrency(lineItemsTotal)}</td></tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Quote Information Card */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#06b6d4' }}>
              <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#06b6d4' }}>Quote Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Quote Number:</span><p className="font-medium">{selectedRfq.quote_number || 'Not yet quoted'}</p></div>
                <div><span className="text-gray-500">Quote Status:</span><p className="font-medium">{selectedRfq.quote_status || '-'}</p></div>
                <div><span className="text-gray-500">Quote Value (Excl VAT):</span><p className="font-medium">{formatCurrency(selectedRfq.quote_value_excl_vat)}</p></div>
                <div><span className="text-gray-500">Quote Value (Incl VAT):</span><p className="font-medium text-blue-600">{formatCurrency(selectedRfq.quote_value_incl_vat)}</p></div>
              </div>
            </div>

            {/* Order Information Card */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#f59e0b' }}>
              <div className="px-4 py-3 font-semibold" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Order Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Order Number:</span><p className="font-medium">{selectedRfq.order_number || 'Not yet ordered'}</p></div>
                <div><span className="text-gray-500">Order Date:</span><p className="font-medium">{formatDate(selectedRfq.order_date)}</p></div>
              </div>
            </div>

            {/* Job Information Card */}
            {selectedRfq.job_id && (
              <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#3b82f6' }}>
                <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#3b82f6' }}>Job Information</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Job ID:</span><p className="font-medium">{selectedRfq.job_id}</p></div>
                  <div><button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Briefcase size={16} /> View Job</button></div>
                </div>
              </div>
            )}

            {/* Invoice Information Card */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#8b5cf6' }}>
              <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#8b5cf6' }}>Invoice Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Invoice Number:</span><p className="font-medium">{selectedRfq.invoice_number || 'Not yet invoiced'}</p></div>
                <div><span className="text-gray-500">Invoice Date:</span><p className="font-medium">{formatDate(selectedRfq.invoice_date)}</p></div>
              </div>
            </div>

            {/* Notes */}
            {(selectedRfq.notes || selectedRfq.remarks || selectedRfq.special_requirements) && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3 pb-2 border-b">Notes & Remarks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedRfq.special_requirements && <div><span className="text-gray-500">Special Requirements:</span><p className="mt-1">{selectedRfq.special_requirements}</p></div>}
                  {selectedRfq.notes && <div><span className="text-gray-500">Internal Notes:</span><p className="mt-1">{selectedRfq.notes}</p></div>}
                  {selectedRfq.remarks && <div><span className="text-gray-500">Remarks:</span><p className="mt-1">{selectedRfq.remarks}</p></div>}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 text-white font-semibold">Actions</div>
              <div className="p-4 space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Printer size={16} /> Print ENQ Report</button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><Upload size={16} /> Upload Quote PDF</button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" disabled={!selectedRfq.quote_number}><Send size={16} /> Send for Signature</button>
                <hr />
                {selectedRfq.order_number && !selectedRfq.job_id && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"><Briefcase size={20} /> Create Job</button>
                )}
                {selectedRfq.job_id && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Briefcase size={16} /> View Job</button>
                )}
                <hr />
                <button onClick={() => handleEdit(selectedRfq)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"><Edit2 size={16} /> Edit RFQ</button>
                <button onClick={() => setDeleteConfirm(selectedRfq.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={16} /> Delete RFQ</button>
              </div>
            </div>

            {/* Workflow Progress */}
            <WorkflowTracker rfq={selectedRfq} />
          </div>
        </div>

        {/* Delete Modal */}
        {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"><h3 className="text-lg font-semibold mb-2">Delete RFQ?</h3><p className="text-gray-600 mb-4">This will also delete all line items. This action cannot be undone.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={() => { handleDelete(deleteConfirm); setView('list') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>}
      </div>
    )
  }

  // ========== CREATE/EDIT VIEW ==========
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <div><h1 className="text-2xl font-bold">{view === 'edit' ? 'Edit RFQ' : 'Create New RFQ'}</h1><p className="text-sm text-gray-500">Request for Quotation</p></div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">Client Information</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Client *</label><select value={formData.client_id} onChange={e => handleClientChange(e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Contact Person *</label><input type="text" value={formData.contact_person} onChange={e => setFormData(p => ({ ...p, contact_person: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Contact Email</label><input type="email" value={formData.contact_email} onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Contact Phone</label><input type="tel" value={formData.contact_phone} onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Department/Area</label><input type="text" value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* ENQ Report */}
        <div className="bg-white rounded-lg border border-green-300"><div className="px-4 py-3 bg-green-50 border-b border-green-300 font-semibold text-green-800">ENQ Report Information</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Assigned Quoter</label><select value={formData.assigned_quoter_id} onChange={e => setFormData(p => ({ ...p, assigned_quoter_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option>{workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Media Received</label><select value={formData.media_received} onChange={e => setFormData(p => ({ ...p, media_received: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option>{mediaOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Drawing Number</label><input type="text" value={formData.drawing_number} onChange={e => setFormData(p => ({ ...p, drawing_number: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Actions Required</label><div className="flex flex-wrap gap-3">{actionsOptions.map(a => <label key={a} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.actions_required.includes(a)} onChange={e => { if (e.target.checked) setFormData(p => ({ ...p, actions_required: [...p.actions_required, a] })); else setFormData(p => ({ ...p, actions_required: p.actions_required.filter(x => x !== a) })) }} className="rounded" />{a}</label>)}</div></div></div></div>
        {/* RFQ Details */}
        <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">RFQ Details</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Operating Entity *</label><select value={formData.operating_entity} onChange={e => setFormData(p => ({ ...p, operating_entity: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="ERHA FC">ERHA FC</option><option value="ERHA SS">ERHA SS</option></select></div><div><label className="block text-sm font-medium mb-1">Priority *</label><select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div><div><label className="block text-sm font-medium mb-1">Date Received *</label><input type="date" value={formData.request_date} onChange={e => setFormData(p => ({ ...p, request_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Required By *</label><input type="date" value={formData.required_date} onChange={e => setFormData(p => ({ ...p, required_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description *</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Special Requirements</label><textarea value={formData.special_requirements} onChange={e => setFormData(p => ({ ...p, special_requirements: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* Line Items - Create only */}
        {view === 'create' && <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold flex justify-between items-center flex-wrap gap-2"><span>Line Items</span><div className="flex flex-wrap gap-1">{ITEM_TYPES.map(t => <button key={t.value} type="button" onClick={() => addLineItem(t.value)} className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: t.color }}>+ {t.label}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="px-2 py-2 text-left">#</th><th className="px-2 py-2 text-left">Type</th><th className="px-2 py-2 text-left">Description</th><th className="px-2 py-2 text-left">Spec</th><th className="px-2 py-2 text-left">Qty</th><th className="px-2 py-2 text-left">UOM</th><th className="px-2 py-2 text-left">Cost</th><th className="px-2 py-2 text-left">Price</th><th className="px-2 py-2 text-left">Total</th><th className="px-2 py-2"></th></tr></thead><tbody>{lineItems.map((item, idx) => <tr key={idx} className="border-t"><td className="px-2 py-2">{item.line_number}</td><td className="px-2 py-2"><select value={item.item_type} onChange={e => updateLineItem(idx, 'item_type', e.target.value)} className="border rounded px-1 py-1 text-xs" style={{ borderLeftWidth: '3px', borderLeftColor: getItemTypeColor(item.item_type) }}>{ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></td><td className="px-2 py-2"><input type="text" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" />{item.item_type === 'LABOUR' && <select value={item.worker_type} onChange={e => updateLineItem(idx, 'worker_type', e.target.value)} className="w-full border rounded px-1 py-1 text-xs mt-1 bg-green-50"><option value="">Worker...</option>{WORKER_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}</select>}</td><td className="px-2 py-2"><input type="text" value={item.specification} onChange={e => updateLineItem(idx, 'specification', e.target.value)} className="w-20 border rounded px-1 py-1 text-xs" /></td><td className="px-2 py-2"><input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-16 border rounded px-1 py-1 text-sm text-right" /></td><td className="px-2 py-2"><select value={item.unit_of_measure} onChange={e => updateLineItem(idx, 'unit_of_measure', e.target.value)} className="border rounded px-1 py-1 text-xs">{UOM_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></td><td className="px-2 py-2"><input type="number" value={item.cost_price} onChange={e => updateLineItem(idx, 'cost_price', parseFloat(e.target.value) || 0)} className="w-20 border rounded px-1 py-1 text-sm text-right bg-yellow-50" /></td><td className="px-2 py-2"><input type="number" value={item.unit_price} onChange={e => updateLineItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="w-20 border rounded px-1 py-1 text-sm text-right" /></td><td className="px-2 py-2 font-medium">R {item.line_total.toFixed(2)}</td><td className="px-2 py-2"><button type="button" onClick={() => removeLineItem(idx)} className="text-red-500">&times;</button></td></tr>)}{lineItems.length === 0 && <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-500">Click a button above to add line items</td></tr>}</tbody></table></div>{lineItems.length > 0 && <div className="px-4 py-3 bg-gray-50 border-t flex justify-between"><span className="text-sm text-gray-600">Cost: R {totalCost.toFixed(2)} | Margin: <span className={parseFloat(margin) >= 20 ? 'text-green-600' : 'text-orange-600'}>{margin}%</span></span><span className="font-bold">Total: <span className="text-green-600">R {totalValue.toFixed(2)}</span></span></div>}</div>}
        {/* Notes */}
        <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">Additional Notes</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Internal Notes</label><textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Remarks</label><textarea value={formData.remarks} onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* Footer */}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setView('list')} disabled={saving} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><Save size={18} /> {saving ? 'Saving...' : (view === 'edit' ? 'Update RFQ' : 'Create RFQ')}</button></div>
      </form>
    </div>
  )
}

export default RFQPage