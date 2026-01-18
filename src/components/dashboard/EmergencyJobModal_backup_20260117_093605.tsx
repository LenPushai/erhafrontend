import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, Plus, Trash2, Loader } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
}

interface EmergencyJobModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

const EmergencyJobModal: React.FC<EmergencyJobModalProps> = ({ show, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [siteLocation, setSiteLocation] = useState('')
  const [productionStopped, setProductionStopped] = useState(false)
  const [safetyRisk, setSafetyRisk] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: '1', description: '', quantity: '1', unitPrice: '' }])

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: '', quantity: '1', unitPrice: '' }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const getLineTotal = (item: LineItem) => {
    return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
  }

  const getSubtotal = () => lineItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  const getVAT = () => getSubtotal() * 0.15
  const getTotal = () => getSubtotal() + getVAT()

  const formatCurrency = (val: number) => 'R ' + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) { setError('Client name is required'); return }
    if (!contactPerson.trim()) { setError('Contact person is required'); return }
    if (!lineItems.some(item => item.description.trim())) { setError('At least one line item is required'); return }
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Emergency Job Created:', { clientName, contactPerson, contactPhone, siteLocation, productionStopped, safetyRisk, lineItems })
      alert('Emergency Job Created Successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to create emergency job')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>CREATE EMERGENCY JOB</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Severity Banner */}
        {(productionStopped || safetyRisk) && (
          <div style={{ backgroundColor: safetyRisk ? '#7f1d1d' : '#b91c1c', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>
            {safetyRisk ? 'CRITICAL - SAFETY RISK' : 'HIGH PRIORITY - PRODUCTION STOPPED'}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#dc2626' }}>
                {error}
              </div>
            )}

            {/* Client Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>CLIENT INFORMATION</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Client Name *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Company name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Contact Person *</label>
                  <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Who called?" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Contact Phone</label>
                  <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Callback number" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            {/* Location & Severity */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>PROBLEM DETAILS</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Site Location</label>
                <input type="text" value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="Where is the breakdown?" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: productionStopped ? '2px solid #dc2626' : '1px solid #d1d5db', borderRadius: '8px', backgroundColor: productionStopped ? '#fef2f2' : 'white', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={productionStopped} onChange={e => setProductionStopped(e.target.checked)} />
                  <div><div style={{ fontWeight: 600 }}>Production Stopped?</div><div style={{ fontSize: '12px', color: '#6b7280' }}>Client operations halted</div></div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: safetyRisk ? '2px solid #7f1d1d' : '1px solid #d1d5db', borderRadius: '8px', backgroundColor: safetyRisk ? '#fef2f2' : 'white', cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={safetyRisk} onChange={e => setSafetyRisk(e.target.checked)} />
                  <div><div style={{ fontWeight: 600 }}>Safety Risk?</div><div style={{ fontSize: '12px', color: '#6b7280' }}>People at risk</div></div>
                </label>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>WORK ITEMS</h3>
                <button type="button" onClick={addLineItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6b7280', width: '40px' }}>#</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>Description *</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6b7280', width: '80px' }}>Qty</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#6b7280', width: '120px' }}>Unit Price</th>
                      <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px', color: '#6b7280', width: '100px' }}>Total</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 10px', color: '#9ca3af' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <input type="text" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="What needs to be done?" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }} />
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)} min="1" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <input type="number" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)} placeholder="0.00" min="0" step="0.01" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', textAlign: 'right' }} />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 500, fontSize: '13px' }}>{formatCurrency(getLineTotal(item))}</td>
                        <td style={{ padding: '8px 4px' }}>
                          {lineItems.length > 1 && (
                            <button type="button" onClick={() => removeLineItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Totals */}
                <div style={{ backgroundColor: '#f9fafb', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Subtotal</div><div style={{ fontWeight: 500 }}>{formatCurrency(getSubtotal())}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>VAT (15%)</div><div style={{ fontWeight: 500 }}>{formatCurrency(getVAT())}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>{formatCurrency(getTotal())}</div></div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Auto-generated: Job Number, Priority = URGENT</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', backgroundColor: '#dc2626', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <><Loader size={18} className="animate-spin" /> Creating...</> : <><AlertTriangle size={18} /> Create Emergency Job</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default EmergencyJobModal