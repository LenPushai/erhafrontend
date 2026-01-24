import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendNotification } from '../services/notificationService'
import { CreateJobModal } from '../components/CreateJobModal'
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
  quote_pdf_url?: string
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
  const navigate = useNavigate()

  const handleCreateJob = (rfq: RFQ) => {
    setShowCreateJobModal(true)
  }

  const handleJobCreated = (job: any) => {
    setSuccess('Job ' + job.job_number + ' created successfully!')
    setShowCreateJobModal(false)
    loadData()
    navigate('/jobs/' + job.id)
  }

  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [rfqLineItems, setRfqLineItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editLineItems, setEditLineItems] = useState<any[]>([])
  const [originalStatus, setOriginalStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showCreateJobModal, setShowCreateJobModal] = useState(false)
  const isMounted = useRef(true)

  const [formData, setFormData] = useState({
    rfq_direction: 'INCOMING', external_reference: '', client_rfq_number: '', enq_number: '', client_id: '', contact_person: '', contact_email: '', contact_phone: '', department: '', department_cg: '', query_source: '',
    operating_entity: 'ERHA FC', description: '', request_date: new Date().toISOString().split('T')[0],
    required_date: '', priority: 'MEDIUM', special_requirements: '', assigned_to: '',
    follow_up_date: '', notes: '', remarks: '', assigned_quoter_id: '', assigned_quoter: '', media_received: '',
    actions_required: [] as string[], drawing_number: '', status: 'NEW',
    quote_number: '', quote_value_excl_vat: null as number | null, valid_until: '',
    po_number: '', order_number: '', order_date: '',
    invoice_number: '', invoice_date: '', invoice_value: null as number | null, payment_status: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  const actionsOptions = ['QUOTE', 'CUT', 'SERVICE', 'REPAIR', 'PAINT', 'MANUFACTURE', 'MODIFY', 'MACHINING', 'SANDBLAST', 'BREAKDOWN', 'SUPPLY', 'CHANGE', 'INSTALLATION', 'OTHER']
  const mediaOptions = ['WHATSAPP', 'EMAIL_CLIENT', 'EMAIL_ERHA', 'RFQ', 'OTHER']

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

  const handleQuotePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedRfq) return
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return }

    setUploading(true)
    setError(null)
    try {
      const timestamp = Date.now()
      const fileName = `${selectedRfq.rfq_no || selectedRfq.id}_quote_${timestamp}.pdf`
      const filePath = `quotes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('quote-pdfs')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('quote-pdfs').getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('rfqs')
        .update({ quote_pdf_url: urlData.publicUrl })
        .eq('id', selectedRfq.id)
      if (updateError) throw updateError

      await loadData()
      setSelectedRfq((prev: any) => prev ? { ...prev, quote_pdf_url: urlData.publicUrl } : null)
      setSuccess('Quote PDF uploaded successfully!')
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload PDF')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
    setFormData({ rfq_direction: 'INCOMING', external_reference: '', client_rfq_number: '', enq_number: '', client_id: '', contact_person: '', contact_email: '', contact_phone: '', department: '', department_cg: '', query_source: '', operating_entity: 'ERHA FC', description: '', request_date: new Date().toISOString().split('T')[0], required_date: '', priority: 'MEDIUM', special_requirements: '', assigned_to: '', follow_up_date: '', notes: '', remarks: '', assigned_quoter_id: '', assigned_quoter: '', media_received: '', actions_required: [], drawing_number: '', status: 'NEW', quote_number: '', quote_value_excl_vat: null, valid_until: '', po_number: '', order_number: '', order_date: '', invoice_number: '', invoice_date: '', invoice_value: null, payment_status: '' })
    setLineItems([])
    setError(null)
  }

  const handleView = async (rfq: RFQ) => {
    setSelectedRfq(rfq)
    await loadRfqLineItems(rfq.id)
    setView('detail')
  }


  const handleEdit = async (rfq: RFQ) => {
    setSelectedRfq(rfq)
    setOriginalStatus(rfq.status)
    setFormData({
      rfq_direction: (rfq as any).rfq_direction || 'INCOMING', external_reference: (rfq as any).external_reference || '', client_rfq_number: (rfq as any).client_rfq_number || '', enq_number: (rfq as any).enq_number || '', client_id: rfq.client_id || '', contact_person: rfq.contact_person || '', contact_email: rfq.contact_email || '', contact_phone: rfq.contact_phone || '', department: rfq.department || '', operating_entity: rfq.operating_entity || 'ERHA FC', description: rfq.description || '', request_date: rfq.request_date || '', required_date: rfq.required_date || '', priority: rfq.priority || 'MEDIUM', special_requirements: rfq.special_requirements || '', assigned_to: '', follow_up_date: rfq.follow_up_date || '', notes: rfq.notes || '', remarks: rfq.remarks || '', assigned_quoter_id: rfq.assigned_quoter_id || '', media_received: rfq.media_received || '', query_source: (rfq as any).query_source || '', department_cg: (rfq as any).department_cg || '', assigned_quoter: (rfq as any).assigned_quoter || '', actions_required: rfq.actions_required ? rfq.actions_required.split(',') : [],status: rfq.status || 'NEW',
      quote_number: rfq.quote_number || '',
      quote_value_excl_vat: rfq.quote_value_excl_vat || null,
      valid_until: (rfq as any).valid_until || '',
      po_number: (rfq as any).po_number || '',
      order_number: rfq.order_number || '',
      order_date: rfq.order_date || '',
      invoice_number: rfq.invoice_number || '',
      invoice_date: rfq.invoice_date || '',
      invoice_value: (rfq as any).invoice_value || null,
      payment_status: (rfq as any).payment_status || ''
    })
    // Load existing line items for editing
    const { data } = await supabase.from('rfq_line_items').select('*').eq('rfq_id', rfq.id).order('line_number')
    setLineItems(data || [])
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

  const handleSendForSignature = async (rfq: RFQ) => {
    if (!rfq.quote_pdf_url) {
      setError('Please upload a quote PDF first')
      return
    }

    try {
      // Generate signature token
      const token = btoa(JSON.stringify({ rfqId: rfq.id, timestamp: Date.now() }))
      const signatureUrl = window.location.origin + '/sign/' + token

      // Update RFQ with signature info
      await supabase.from('rfqs').update({
        signature_token: token,
        signature_sent_at: new Date().toISOString()
      }).eq('id', rfq.id)

      // Get client info
      const client = clients.find(c => c.id === rfq.client_id)
      const clientName = client?.company_name || 'Client'
      const clientEmail = client?.contact_email || rfq.contact_email

      // Send notification emails
      sendNotification('lenklopper03@gmail.com', 'docusign_sent', {
        quote_number: rfq.quote_number || rfq.rfq_no,
        client_name: clientName,
        contact_email: clientEmail,
        total_value: rfq.quote_value_excl_vat?.toLocaleString() || '0'
      }).catch(e => console.error('Signature sent email failed:', e))
      console.log('Email sent: docusign_sent')

      sendNotification('lenklopper03@gmail.com', 'docusign_manager_pending', {
        quote_number: rfq.quote_number || rfq.rfq_no,
        client_name: clientName,
        total_value: rfq.quote_value_excl_vat?.toLocaleString() || '0',
        description: rfq.description,
        manager_name: 'Manager',
        signature_url: signatureUrl
      }).catch(e => console.error('Manager pending email failed:', e))
      console.log('Email sent: docusign_manager_pending')

      // Copy link to clipboard
      await navigator.clipboard.writeText(signatureUrl)
      setSuccess('Signature link copied! URL: ' + signatureUrl)

      await loadData()
    } catch (err: any) {
      setError('Failed to generate signature link: ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get client name early for use in notifications
    const clientName = clients.find(c => c.id === formData.client_id)?.company_name || 'Unknown Client'

    if (!formData.client_id) { setError('Please select a client'); return }
    if (!formData.description.trim()) { setError('Please enter a description'); return }
    if (!formData.required_date) { setError('Please select required date'); return }

    setSaving(true); setError(null)
    try {
      // Auto-generate ENQ number if empty
      let generatedEnqNumber = formData.enq_number
      if (!generatedEnqNumber) {
        const year = new Date().getFullYear().toString().slice(-2)
        const prefix = formData.rfq_direction === 'OUTGOING' ? `${year}-OUT-` : `${year}-`
        const { data: existing } = await supabase.from('rfqs').select('enq_number').like('enq_number', `${prefix}%`).order('enq_number', { ascending: false }).limit(1)
        let nextNum = 1
        if (existing && existing.length > 0 && existing[0].enq_number) {
          const parts = existing[0].enq_number.split('-')
          nextNum = (parseInt(parts[parts.length - 1]) || 0) + 1
        }
        generatedEnqNumber = `${prefix}${nextNum.toString().padStart(3, '0')}`
      }
      const rfqData: any = {
          rfq_direction: formData.rfq_direction || 'INCOMING',
          external_reference: formData.external_reference || null,
          client_rfq_number: formData.client_rfq_number || null,
          enq_number: generatedEnqNumber,
        client_id: formData.client_id,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        department: formData.department || null,
        operating_entity: formData.operating_entity,
        description: formData.description,
        request_date: formData.request_date,
        required_date: formData.required_date,
        priority: formData.priority,
        estimated_value: totalValue || null,
        special_requirements: formData.special_requirements || null,
        assigned_quoter_id: formData.assigned_quoter_id || null,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes || null,
        remarks: formData.remarks || null,
        media_received: formData.media_received || null,
        actions_required: formData.actions_required.length > 0 ? formData.actions_required.join(',') : null,
        drawing_number: formData.drawing_number || null,
          query_source: formData.query_source || null,
          department_cg: formData.department_cg || null,
          assigned_quoter: formData.assigned_quoter || null,
        status: formData.status || 'NEW',
        quote_number: formData.quote_number || null,
        quote_value_excl_vat: formData.quote_value_excl_vat || null,
        quote_value_incl_vat: formData.quote_value_excl_vat ? formData.quote_value_excl_vat * 1.15 : null,
        valid_until: formData.valid_until || null,
        po_number: formData.po_number || null,
        order_number: formData.order_number || null,
        order_date: formData.order_date || null,
        invoice_number: formData.invoice_number || null,
        invoice_date: formData.invoice_date || null,
        invoice_value: formData.invoice_value || null,
        payment_status: formData.payment_status || null
      }

      if (view === 'edit' && selectedRfq) {
        const { error: err } = await supabase.from('rfqs').update(rfqData).eq('id', selectedRfq.id)
        if (err) throw err

        await supabase.from('rfq_line_items').delete().eq('rfq_id', selectedRfq.id)
        if (lineItems.length > 0) {
          await supabase.from('rfq_line_items').insert(lineItems.map((item, i) => ({
            rfq_id: selectedRfq.id, line_number: i + 1, item_type: item.item_type,
            description: item.description, specification: item.specification || null,
            quantity: item.quantity, unit_of_measure: item.unit_of_measure,
            cost_price: item.cost_price || null, unit_price: item.unit_price,
            line_total: item.line_total, worker_type: item.worker_type || null,
            notes: item.notes || null, is_optional: item.is_optional
          })))
        }

        const clientName = clients.find(c => c.id === rfqData.client_id)?.company_name || 'Client'

        if (rfqData.status === 'QUOTED' && originalStatus !== 'QUOTED') {
          sendNotification('lenklopper03@gmail.com', 'quote_ready', {
            quote_number: rfqData.quote_number || selectedRfq.rfq_no,
            client_name: clientName,
            total_value: rfqData.quote_value_excl_vat || totalValue || '0',
            quoter_name: workers.find(w => w.id === rfqData.assigned_quoter_id)?.full_name || 'Quoter'
          }).catch(e => console.error('Email failed:', e))
        }

        if (rfqData.status === 'ACCEPTED' && originalStatus !== 'ACCEPTED') {
          sendNotification('lenklopper03@gmail.com', 'order_won', {
            client_name: clientName,
            total_value: rfqData.quote_value_excl_vat || totalValue || '0',
            po_number: rfqData.po_number || 'Pending',
            description: rfqData.description
          }).catch(e => console.error('Email failed:', e))
        }
        // 5. Invoice number entered (invoice created)
        if (formData.invoice_number && formData.invoice_number !== selectedRfq?.invoice_number) {
          sendNotification('lenklopper03@gmail.com', 'invoice_created', {
            client_name: clientName,
            invoice_number: formData.invoice_number,
            total_value: formData.quote_value_excl_vat?.toLocaleString() || formData.invoice_value?.toLocaleString() || '0'
          }).catch(e => console.error('Invoice email failed:', e))
          console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â§ Sent: invoice_created')
        }

        if (formData.assigned_quoter_id && formData.assigned_quoter_id !== selectedRfq?.assigned_quoter_id) {
          const quoter = workers.find(w => w.id === formData.assigned_quoter_id)
          if (quoter) {
            sendNotification('lenklopper03@gmail.com', 'estimator_assigned', {
              client_name: clientName,
              description: formData.description,
              priority: formData.priority,
              quoter_name: quoter.full_name
            }).catch(err => console.error('Email notification failed:', err))
          }
        }

        setSuccess('RFQ updated successfully'); setSelectedRfq({ ...selectedRfq, ...rfqData })
      } else {
        const { data, error: err } = await supabase.from('rfqs').insert([{ ...rfqData, status: 'NEW' }]).select().single()
        if (err) throw err
        if (lineItems.length > 0 && data) {
          await supabase.from('rfq_line_items').insert(lineItems.map((item, i) => ({
            rfq_id: data.id, line_number: i + 1, item_type: item.item_type,
            description: item.description, specification: item.specification || null,
            quantity: item.quantity, unit_of_measure: item.unit_of_measure,
            cost_price: item.cost_price || null, unit_price: item.unit_price,
            line_total: item.line_total, worker_type: item.worker_type || null,
            notes: item.notes || null, is_optional: item.is_optional
          })))
        }

        // Get client name for notifications
        const clientName = clients.find(c => c.id === formData.client_id)?.company_name || 'Unknown Client'

        // Email: New RFQ received
        sendNotification('lenklopper03@gmail.com', 'rfq_received', {
          rfq_number: data.rfq_no,
          client_name: clientName,
          description: formData.description,
          priority: formData.priority,
          required_date: formData.required_date
        }).catch(err => console.error('RFQ received email failed:', err))
        console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ Sent: rfq_received')
        setSuccess('RFQ created successfully')

        if (formData.assigned_quoter_id) {
          const quoter = workers.find(w => w.id === formData.assigned_quoter_id)
          const client = clients.find(c => c.id === formData.client_id)
          if (quoter) {
            sendNotification('lenklopper03@gmail.com', 'estimator_assigned', {
              client_name: client?.company_name || 'Client',
              description: formData.description,
              priority: formData.priority,
              quoter_name: quoter.full_name
            }).catch(err => console.error('Email notification failed:', err))
          }
        }
      }
      await loadData(); if (view === 'edit' && selectedRfq) { setView('detail') } else { const created = (await supabase.from('rfqs').select('*').order('created_at', { ascending: false }).limit(1)).data?.[0]; if (created) { setSelectedRfq(created); setView('detail') } else { setView('list') } }
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
            <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ENQ No</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Dir</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Required</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y">{loading ? <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No RFQs found</td></tr> : filtered.map(rfq => (
              <tr key={rfq.id} className="hover:bg-gray-50"><td className="px-4 py-3"><span className="text-blue-600 font-medium">{(rfq as any).enq_number || rfq.rfq_no || '-'}</span></td><td className="px-4 py-3 text-center">{(rfq as any).rfq_direction === 'OUTGOING' ? '📤' : '📥'}</td><td className="px-4 py-3 font-medium">{getClientName(rfq.client_id)}</td><td className="px-4 py-3 text-gray-600 max-w-xs truncate">{rfq.description}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>{rfq.status}</span></td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rfq.priority)}`}>{rfq.priority}</span></td><td className="px-4 py-3 text-gray-600">{rfq.required_date || '-'}</td><td className="px-4 py-3 font-medium">R {(rfq.estimated_value || 0).toLocaleString()}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => handleView(rfq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye size={16} /></button><button onClick={() => handleEdit(rfq)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit"><Edit2 size={16} /></button><button onClick={() => setDeleteConfirm(rfq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button></div></td></tr>
            ))}</tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">Showing {filtered.length} of {rfqs.length} RFQs</div>
        </div>
        {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"><h3 className="text-lg font-semibold mb-2">Delete RFQ?</h3><p className="text-gray-600 mb-4">This will also delete all line items. This action cannot be undone.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>}
      </div>
    )
  }

  // ========== DETAIL VIEW ==========
  if (view === 'detail' && selectedRfq) {
    const lineItemsTotal = rfqLineItems.reduce((sum, item) => sum + (item.line_total || 0), 0)
    return (
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-4">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setView('list')}>RFQs</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{selectedRfq.rfq_no || `#${selectedRfq.id.slice(0,8)}`}</span>
        </div>

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

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between">{error}<button onClick={() => setError(null)}><X size={18} /></button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between">{success}<button onClick={() => setSuccess(null)}><X size={18} /></button></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Information */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 text-white font-semibold">RFQ Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Direction:</span><p className="font-medium">{(selectedRfq as any).rfq_direction === 'OUTGOING' ? '📤 OUTGOING' : '📥 INCOMING'}</p></div>
                <div><span className="text-gray-500">ERHA ENQ Number:</span><p className="font-medium text-green-600">{(selectedRfq as any).enq_number || '-'}</p></div>
                <div><span className="text-gray-500">Client RFQ Number:</span><p className="font-medium">{(selectedRfq as any).client_rfq_number || '-'}</p></div>
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

            {/* ENQ Report Information */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#22c55e' }}>
              <div className="px-4 py-3 font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>ENQ Report Information</div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">Drawing Number:</span><p className="font-medium">{selectedRfq.drawing_number || '-'}</p></div>
                <div><span className="text-gray-500">Requested/Received By:</span><p className="font-medium">{(selectedRfq as any).query_source || '-'}</p></div>
                <div><span className="text-gray-500">Media Received:</span><p className="font-medium">{selectedRfq.media_received || '-'}</p></div>
                <div><span className="text-gray-500">Department of C.G:</span><p className="font-medium">{(selectedRfq as any).department_cg || '-'}</p></div>
                <div><span className="text-gray-500">Quotation (Assign To):</span><p className="font-medium">{(selectedRfq as any).assigned_quoter || '-'}</p></div>
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

            {/* Line Items */}
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

            {/* Quote Information */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#06b6d4' }}>
              <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#06b6d4' }}>Quote Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Quote Number:</span><p className="font-medium">{selectedRfq.quote_number || 'Not yet quoted'}</p></div>
                <div><span className="text-gray-500">Quote Status:</span><p className="font-medium">{selectedRfq.quote_status || '-'}</p></div>
                <div><span className="text-gray-500">Quote Value (Excl VAT):</span><p className="font-medium">{formatCurrency(selectedRfq.quote_value_excl_vat)}</p></div>
                <div><span className="text-gray-500">Quote Value (Incl VAT):</span><p className="font-medium text-blue-600">{formatCurrency(selectedRfq.quote_value_incl_vat)}</p></div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#f59e0b' }}>
              <div className="px-4 py-3 font-semibold" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Order Information</div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Order Number:</span><p className="font-medium">{selectedRfq.order_number || 'Not yet ordered'}</p></div>
                <div><span className="text-gray-500">Order Date:</span><p className="font-medium">{formatDate(selectedRfq.order_date)}</p></div>
              </div>
            </div>

            {/* Job Information */}
            {selectedRfq.job_id && (
              <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#3b82f6' }}>
                <div className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: '#3b82f6' }}>Job Information</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Job ID:</span><p className="font-medium">{selectedRfq.job_id}</p></div>
                  <div><button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Briefcase size={16} /> View Job</button></div>
                </div>
              </div>
            )}

            {/* Invoice Information */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 text-white font-semibold">Actions</div>
              <div className="p-4 space-y-3">
                <input type="file" ref={fileInputRef} onChange={handleQuotePdfUpload} accept="application/pdf" className="hidden" />
                {selectedRfq.quote_pdf_url ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <a href={selectedRfq.quote_pdf_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Eye size={16} /> View PDF
                      </a>
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-400">
                        <Upload size={16} /> {uploading ? 'Uploading...' : 'Replace'}
                      </button>
                    </div>
                    <p className="text-xs text-center text-green-600">Quote PDF uploaded</p>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-400">
                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Quote PDF'}
                  </button>
                )}
                <button onClick={() => handleSendForSignature(selectedRfq)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50" ><Send size={16} /> Send for Signature</button>
                <hr />
                {selectedRfq.order_number && !selectedRfq.job_id && (
                  <button onClick={() => handleCreateJob(selectedRfq)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"><Briefcase size={20} /> Create Job</button>
                )}
                {selectedRfq.job_id && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Briefcase size={16} /> View Job</button>
                )}
                <hr />
                <button onClick={() => handleEdit(selectedRfq)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"><Edit2 size={16} /> Edit RFQ</button>
                <button onClick={() => setDeleteConfirm(selectedRfq.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={16} /> Delete RFQ</button>
              </div>
            </div>

            <WorkflowTracker rfq={selectedRfq} />
          </div>
        </div>
        {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"><h3 className="text-lg font-semibold mb-2">Delete RFQ?</h3><p className="text-gray-600 mb-4">This will also delete all line items. This action cannot be undone.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={() => { handleDelete(deleteConfirm); setView('list') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>}
    {/* Create Job Modal */}
    <CreateJobModal
        isOpen={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        rfq={selectedRfq}
        rfqLineItems={rfqLineItems}
        clients={clients}
        onJobCreated={handleJobCreated}
    />
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
        <div className="bg-white rounded-lg border border-blue-300 mb-6"><div className="px-4 py-3 bg-blue-50 border-b border-blue-300 font-semibold text-blue-800">RFQ Direction & Reference Numbers</div><div className="p-4"><div className="flex gap-6 mb-4">{[{value: 'INCOMING', label: '📥 INCOMING', desc: 'Client requesting quote from ERHA'}, {value: 'OUTGOING', label: '📤 OUTGOING', desc: 'ERHA requesting quote from Supplier'}].map(opt => <label key={opt.value} className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.rfq_direction === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><div className="flex items-center gap-3"><input type="radio" name="rfq_direction" value={opt.value} checked={formData.rfq_direction === opt.value} onChange={e => setFormData(p => ({ ...p, rfq_direction: e.target.value }))} className="w-5 h-5 text-blue-600" /><div><div className="font-semibold text-lg">{opt.label}</div><div className="text-sm text-gray-500">{opt.desc}</div></div></div></label>)}</div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><div><label className="block text-sm font-medium mb-1">ERHA ENQ Number</label><input type="text" value={formData.enq_number || ''} onChange={e => setFormData(p => ({ ...p, enq_number: e.target.value }))} className="w-full border rounded-lg px-3 py-2 bg-green-50 border-green-300" placeholder="ENQ-25-0001" /></div><div><label className="block text-sm font-medium mb-1">{formData.rfq_direction === 'INCOMING' ? 'Client RFQ Number' : 'Supplier Reference'}</label><input type="text" value={formData.client_rfq_number || ''} onChange={e => setFormData(p => ({ ...p, client_rfq_number: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder={formData.rfq_direction === 'INCOMING' ? 'e.g. 35218' : 'Supplier ref'} /></div><div><label className="block text-sm font-medium mb-1">Additional Reference</label><input type="text" value={formData.external_reference || ''} onChange={e => setFormData(p => ({ ...p, external_reference: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="Optional" /></div></div></div></div>
          <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">Client Information</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Client *</label><select value={formData.client_id} onChange={e => handleClientChange(e.target.value)} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Contact Person *</label><input type="text" value={formData.contact_person} onChange={e => setFormData(p => ({ ...p, contact_person: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Contact Email</label><input type="email" value={formData.contact_email} onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Contact Phone</label><input type="tel" value={formData.contact_phone} onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Department/Area</label><input type="text" value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* ENQ Report */}
        <div className="bg-white rounded-lg border border-green-300"><div className="px-4 py-3 bg-green-50 border-b border-green-300 font-semibold text-green-800">ENQ Report Information</div><div className="p-4 space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Drawing Number</label><input type="text" value={formData.drawing_number} onChange={e => setFormData(p => ({ ...p, drawing_number: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. DWG-001" /></div><div><label className="block text-sm font-medium mb-1">Requested/Received By</label><input type="text" value={formData.query_source || ''} onChange={e => setFormData(p => ({ ...p, query_source: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. ROELF VAN DEVENTER" /></div><div><label className="block text-sm font-medium mb-1">Media Received</label><select value={formData.media_received} onChange={e => setFormData(p => ({ ...p, media_received: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option>{mediaOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></div></div><div><label className="block text-sm font-medium mb-2">Department of C.G</label><div className="flex flex-wrap gap-4">{['MELTSHOP', 'MILLS', 'SHARON', 'OREN', 'STORES', 'GENERAL', 'MRSTD'].map(dept => <label key={dept} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="department_cg" value={dept} checked={formData.department_cg === dept} onChange={e => setFormData(p => ({ ...p, department_cg: e.target.value }))} className="w-4 h-4 text-green-600" /><span className="text-sm">{dept}</span></label>)}</div></div><div><label className="block text-sm font-medium mb-2">Quotation (Assign To)</label><div className="flex flex-wrap gap-4">{['HENDRIK', 'DEWALD', 'ESTIMATOR', 'JACO'].map(quoter => <label key={quoter} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="assigned_quoter" value={quoter} checked={formData.assigned_quoter === quoter} onChange={e => setFormData(p => ({ ...p, assigned_quoter: e.target.value }))} className="w-4 h-4 text-blue-600" /><span className="text-sm">{quoter}</span></label>)}</div></div><div><label className="block text-sm font-medium mb-2">Actions Required</label><div className="flex flex-wrap gap-3">{actionsOptions.map(a => <label key={a} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={formData.actions_required.includes(a)} onChange={e => { if (e.target.checked) setFormData(p => ({ ...p, actions_required: [...p.actions_required, a] })); else setFormData(p => ({ ...p, actions_required: p.actions_required.filter(x => x !== a) })) }} className="w-4 h-4 rounded" />{a}</label>)}</div></div></div></div>
        {/* RFQ Details */}
        <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">RFQ Details</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Operating Entity *</label><select value={formData.operating_entity} onChange={e => setFormData(p => ({ ...p, operating_entity: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="ERHA FC">ERHA FC</option><option value="ERHA SS">ERHA SS</option></select></div><div><label className="block text-sm font-medium mb-1">Priority *</label><select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div><div><label className="block text-sm font-medium mb-1">Date Received *</label><input type="date" value={formData.request_date} onChange={e => setFormData(p => ({ ...p, request_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Required By *</label><input type="date" value={formData.required_date} onChange={e => setFormData(p => ({ ...p, required_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description *</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Special Requirements</label><textarea value={formData.special_requirements} onChange={e => setFormData(p => ({ ...p, special_requirements: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* Line Items */}
        <div className="bg-white rounded-lg border p-4"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold text-gray-800">Line Items</h4><button type="button" onClick={() => addLineItem('MATERIAL')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus size={16} /> Add Item</button></div>{lineItems.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">No line items added yet</p> : <div className="space-y-2">{lineItems.map((item, idx) => <div key={idx} className="grid grid-cols-12 gap-2 items-center"><select value={item.item_type} onChange={e => updateLineItem(idx, 'item_type', e.target.value)} className="col-span-2 px-2 py-1.5 border rounded text-sm">{ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select><input type="text" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} placeholder="Description" className="col-span-4 px-2 py-1.5 border rounded text-sm" /><input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-1 px-2 py-1.5 border rounded text-sm text-center" /><input type="text" value={item.unit_of_measure} onChange={e => updateLineItem(idx, 'unit_of_measure', e.target.value)} className="col-span-1 px-2 py-1.5 border rounded text-sm text-center" /><input type="number" value={item.unit_price} onChange={e => updateLineItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="col-span-2 px-2 py-1.5 border rounded text-sm" placeholder="Price" /><div className="col-span-1 text-right text-sm font-medium">R{item.line_total.toFixed(2)}</div><button type="button" onClick={() => removeLineItem(idx)} className="col-span-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div>)}<div className="flex justify-end pt-2 border-t"><span className="font-medium">Total: R{lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}</span></div></div>}</div>
        {/* Quote Information - Edit Only */}
        {view === 'edit' && <div className="bg-white rounded-lg border border-purple-300"><div className="px-4 py-3 bg-purple-50 border-b border-purple-300 font-semibold text-purple-800">Quote Information (from Pastel)</div><div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4"><div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status || 'NEW'} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full border border-purple-200 rounded-lg px-3 py-2 bg-purple-50"><option value="NEW">NEW</option><option value="DRAFT">DRAFT</option><option value="PENDING">PENDING</option><option value="QUOTED">QUOTED</option><option value="ACCEPTED">ACCEPTED</option><option value="REJECTED">REJECTED</option><option value="CANCELLED">CANCELLED</option></select></div><div><label className="block text-sm font-medium mb-1">Quote Number</label><input type="text" value={formData.quote_number || ''} onChange={e => setFormData(p => ({ ...p, quote_number: e.target.value }))} placeholder="From Pastel" className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Quote Value (excl VAT)</label><input type="number" value={formData.quote_value_excl_vat || ''} onChange={e => setFormData(p => ({ ...p, quote_value_excl_vat: parseFloat(e.target.value) || null }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Valid Until</label><input type="date" value={formData.valid_until || ''} onChange={e => setFormData(p => ({ ...p, valid_until: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div></div></div>}
        {/* Order Information - Edit Only */}
        {view === 'edit' && <div className="bg-white rounded-lg border border-green-300"><div className="px-4 py-3 bg-green-50 border-b border-green-300 font-semibold text-green-800">Order Information (when won)</div><div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Client PO Number</label><input type="text" value={formData.po_number || ''} onChange={e => setFormData(p => ({ ...p, po_number: e.target.value }))} placeholder="Client's PO" className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Order Number</label><input type="text" value={formData.order_number || ''} onChange={e => setFormData(p => ({ ...p, order_number: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Order Date</label><input type="date" value={formData.order_date || ''} onChange={e => setFormData(p => ({ ...p, order_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div></div></div>}
        {/* Invoice Information - Edit Only */}
        {view === 'edit' && <div className="bg-white rounded-lg border border-orange-300"><div className="px-4 py-3 bg-orange-50 border-b border-orange-300 font-semibold text-orange-800">Invoice Information (from Pastel)</div><div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4"><div><label className="block text-sm font-medium mb-1">Invoice Number</label><input type="text" value={formData.invoice_number || ''} onChange={e => setFormData(p => ({ ...p, invoice_number: e.target.value }))} placeholder="From Pastel" className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Invoice Date</label><input type="date" value={formData.invoice_date || ''} onChange={e => setFormData(p => ({ ...p, invoice_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Invoice Value</label><input type="number" value={formData.invoice_value || ''} onChange={e => setFormData(p => ({ ...p, invoice_value: parseFloat(e.target.value) || null }))} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Payment Status</label><select value={formData.payment_status || ''} onChange={e => setFormData(p => ({ ...p, payment_status: e.target.value }))} className="w-full border rounded-lg px-3 py-2"><option value="">Select...</option><option value="PENDING">Pending</option><option value="PARTIAL">Partial</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option></select></div></div></div>}
        {/* Notes */}
        <div className="bg-white rounded-lg border"><div className="px-4 py-3 bg-gray-50 border-b font-semibold">Additional Notes</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Internal Notes</label><textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div><div><label className="block text-sm font-medium mb-1">Remarks</label><textarea value={formData.remarks} onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2" /></div></div></div>
        {/* Footer */}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setView('list')} disabled={saving} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><Save size={18} /> {saving ? 'Saving...' : (view === 'edit' ? 'Update RFQ' : 'Create RFQ')}</button></div>
      </form>

      {/* Create Job Modal */}
      {selectedRfq && (
          <CreateJobModal
              isOpen={showCreateJobModal}
              onClose={() => setShowCreateJobModal(false)}
              rfq={selectedRfq}
              rfqLineItems={rfqLineItems}
              clients={clients}
              onJobCreated={handleJobCreated}
          />
      )}
    </div>
  )
}

export default RFQPage





