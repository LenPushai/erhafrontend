import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../common/ToastContext';

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  estimatedValue: string;
}

interface EmergencyJobModalProps {
  show: boolean;
  onClose: () => void;
}

const EmergencyJobModal: React.FC<EmergencyJobModalProps> = ({ show, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    client: '',
    orderNumber: '',
    location: 'SHOP',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: '1', estimatedValue: '' }
  ]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: generateId(), description: '', quantity: '1', estimatedValue: '' }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = (): number => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const value = parseFloat(item.estimatedValue) || 0;
      return sum + (qty * value);
    }, 0);
  };

  const calculateLineTotal = (item: LineItem): number => {
    const qty = parseFloat(item.quantity) || 0;
    const value = parseFloat(item.estimatedValue) || 0;
    return qty * value;
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, field: string) => {
    if (e.key === 'Enter' && field === 'estimatedValue') {
      e.preventDefault();
      const currentIndex = lineItems.findIndex(item => item.id === itemId);
      if (currentIndex === lineItems.length - 1) addLineItem();
    }
  };

  useEffect(() => {
    if (lastInputRef.current && lineItems.length > 1) lastInputRef.current.focus();
  }, [lineItems.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validItems = lineItems.filter(item => item.description.trim() !== '');
    if (validItems.length === 0) {
      setError('Please add at least one job item with a description');
      setLoading(false);
      return;
    }

    if (!formData.client.trim()) {
      setError('Please enter a client name');
      setLoading(false);
      return;
    }

    try {
      const totalExcl = calculateTotal();
      const totalIncl = totalExcl * 1.15;

      const combinedDescription = 'CLIENT: ' + formData.client + '\n\n' + validItems
        .map((item, idx) => (idx + 1) + '. ' + item.description + ' (Qty: ' + (item.quantity || 1) + ') - R' + (parseFloat(item.estimatedValue) || 0).toFixed(2))
        .join('\n');

      const jobPayload = {
        jobType: 'SHUTDOWN',
        description: combinedDescription,
        location: formData.location,
        orderNumber: formData.orderNumber || null,
        orderReceivedDate: new Date().toISOString().split('T')[0],
        orderValueExcl: totalExcl,
        orderValueIncl: totalIncl,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        workshopStatus: 'NEW',
        createdBy: 'Emergency System',
        creationSource: 'EMERGENCY',
        remarks: 'Emergency Job for ' + formData.client + '. Created via fast-track process.'
      };

      console.log('Creating emergency job:', jobPayload);

      const jobResponse = await fetch('http://localhost:8080/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload),
      });

      if (!jobResponse.ok) {
        const errorText = await jobResponse.text();
        console.error('Job creation failed:', errorText);
        throw new Error('Failed to create emergency job: ' + errorText);
      }

      const newJob = await jobResponse.json();
      console.log('Emergency job created:', newJob);
      
      const clientName = formData.client;
      setFormData({ client: '', orderNumber: '', location: 'SHOP' });
      setLineItems([{ id: '1', description: '', quantity: '1', estimatedValue: '' }]);
      onClose();
      
      toast.success('Emergency Job Created!', 'Job ' + newJob.jobNumber + ' created for ' + clientName);
      navigate('/jobs/' + newJob.jobId);
      
    } catch (err: any) {
      console.error('Error creating emergency job:', err);
      setError(err.message || 'Failed to create emergency job');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { if (!loading) { setError(null); onClose(); } };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(value);
  };

  if (!show) return null;

  const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
  const modalStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' };
  const headerStyle: React.CSSProperties = { backgroundColor: '#dc3545', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const bodyStyle: React.CSSProperties = { padding: '24px', overflowY: 'auto', flex: 1 };
  const lineItemCardStyle: React.CSSProperties = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '12px', border: '1px solid #e9ecef' };

  return (
    <div style={modalOverlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} />
            <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Create Emergency Job</h5>
          </div>
          <button onClick={handleClose} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: '0 8px' }}>x</button>
        </div>

        <div style={bodyStyle}>
          <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
            <strong>Fast-Track Process:</strong> Creates Job Card immediately. Backend generates sequential number (25-EMG-001, 002, etc.)
          </div>

          {error && (
            <div style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#721c24' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Client Name *</label>
                <input type="text" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} required disabled={loading} placeholder="e.g., CG-MELTSHOP, SASOL" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Order/PO Number</label>
                <input type="text" value={formData.orderNumber} onChange={(e) => setFormData({...formData, orderNumber: e.target.value})} disabled={loading} placeholder="e.g., C453/8 or leave blank" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' }} />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>Can be added later</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Location</label>
                <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: 'white' }}>
                  <option value="SHOP">Shop</option>
                  <option value="SITE">Site</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>

            <div style={{ border: '2px solid #dee2e6', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#e9ecef', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Job Items</span>
                <button type="button" onClick={addLineItem} disabled={loading} style={{ backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div style={{ padding: '16px' }}>
                {lineItems.map((item, index) => (
                  <div key={item.id} style={lineItemCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#6c757d', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>{index + 1}</span>
                      <input ref={index === lineItems.length - 1 ? lastInputRef : null} type="text" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} disabled={loading} placeholder="Describe the work item" style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' }} />
                      {lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(item.id)} disabled={loading} style={{ backgroundColor: 'transparent', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingLeft: '40px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6c757d' }}>Quantity</label>
                        <input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)} disabled={loading} min="1" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px', textAlign: 'center' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6c757d' }}>Unit Value (R)</label>
                        <input type="number" value={item.estimatedValue} onChange={(e) => updateLineItem(item.id, 'estimatedValue', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'estimatedValue')} disabled={loading} placeholder="0.00" step="0.01" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px', textAlign: 'right' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6c757d' }}>Line Total</label>
                        <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#e9ecef', fontWeight: 600, textAlign: 'right', fontSize: '14px' }}>{formatCurrency(calculateLineTotal(item))}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: '2px solid #dee2e6', paddingTop: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>Total (Excl VAT):</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#0d6efd' }}>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', color: '#6c757d' }}>
                    <span>Total Incl VAT (15%):</span>
                    <span style={{ fontSize: '16px' }}>{formatCurrency(calculateTotal() * 1.15)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#cff4fc', border: '1px solid #9eeaf9', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
              <strong>What Happens:</strong> Job created with sequential number (25-EMG-001), URGENT priority, IN_PROGRESS status. Workshop can begin immediately.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={handleClose} disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #6c757d', backgroundColor: 'white', color: '#6c757d', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', backgroundColor: '#dc3545', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <><Loader size={18} /> Creating...</> : <><AlertTriangle size={18} /> Create Emergency Job</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyJobModal;