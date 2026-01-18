import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Loader, Plus, Trash2, Phone, MapPin, User, Clock, Wrench } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitOfMeasure: string;
  estimatedUnitPrice: string;
}

interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  contact_phone: string;
}

interface Worker {
  id: string;
  full_name: string;
  role: string;
}

interface EmergencyJobModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EmergencyJobModal: React.FC<EmergencyJobModalProps> = ({ show, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const lastInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    contactPerson: '',
    contactPhone: '',
    siteLocation: '',
    productionStopped: false,
    safetyRisk: false,
    assignedWorkerId: '',
    estimatedHours: '',
    specialEquipment: '',
    notes: '',
  });

  // Line items state - start with one empty row
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: '1', unitOfMeasure: 'EA', estimatedUnitPrice: '' }
  ]);

  // Load clients and workers on mount
  useEffect(() => {
    if (show) {
      loadClients();
      loadWorkers();
    }
  }, [show]);

  // Focus last input when new line added
  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus();
    }
  }, [lineItems.length]);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/v1/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/v1/workers');
      if (response.ok) {
        const data = await response.json();
        setWorkers(data.filter((w: Worker) => w.role === 'WORKSHOP' || w.role === 'TECHNICIAN'));
      }
    } catch (err) {
      console.error('Error loading workers:', err);
    }
  };

  // Generate unique ID for line items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Add new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: generateId(), description: '', quantity: '1', unitOfMeasure: 'EA', estimatedUnitPrice: '' }
    ]);
  };

  // Remove line item (keep at least one)
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  // Update line item
  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Handle Enter key to add new line
  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: string) => {
    if (e.key === 'Enter' && field === 'estimatedUnitPrice') {
      e.preventDefault();
      addLineItem();
    }
  };

  // Calculate line total
  const getLineTotal = (item: LineItem): number => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.estimatedUnitPrice) || 0;
    return qty * price;
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + getLineTotal(item), 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get severity level based on checkboxes
  const getSeverityLevel = (): string => {
    if (formData.safetyRisk) return 'CRITICAL';
    if (formData.productionStopped) return 'HIGH';
    return 'MEDIUM';
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.clientId) {
      setError('Please select a client');
      return false;
    }
    if (!formData.contactPerson.trim()) {
      setError('Please enter contact person');
      return false;
    }
    if (!formData.contactPhone.trim()) {
      setError('Please enter contact phone');
      return false;
    }
    
    const validItems = lineItems.filter(item => item.description.trim());
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Filter valid line items
      const validItems = lineItems.filter(item => item.description.trim());
      const { subtotal, total } = calculateTotals();

      // Combine descriptions for job
      const combinedDescription = validItems
        .map((item, idx) => `${idx + 1}. ${item.description} (Qty: ${item.quantity} ${item.unitOfMeasure})`)
        .join('\n');

      // Prepare API line items
      const apiLineItems = validItems.map((item, idx) => ({
        lineNumber: idx + 1,
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: parseFloat(item.estimatedUnitPrice) || 0,
        lineTotal: getLineTotal(item),
      }));

      // Get selected client details
      const selectedClient = clients.find(c => c.id === formData.clientId);

      // Create emergency job via API
      const response = await fetch('/api/v1/jobs/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          clientName: selectedClient?.company_name || '',
          contactPerson: formData.contactPerson,
          contactPhone: formData.contactPhone,
          siteLocation: formData.siteLocation,
          description: combinedDescription,
          isEmergency: true,
          jobType: 'EMERGENCY',
          priority: 'URGENT',
          status: formData.assignedWorkerId ? 'DISPATCHED' : 'PENDING',
          severityLevel: getSeverityLevel(),
          productionStopped: formData.productionStopped,
          safetyRisk: formData.safetyRisk,
          assignedWorkerId: formData.assignedWorkerId || null,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
          specialEquipment: formData.specialEquipment,
          notes: formData.notes,
          orderValueExcl: subtotal,
          orderValueIncl: total,
          lineItems: apiLineItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create emergency job');
      }

      const newJob = await response.json();
      
      // Reset form
      setFormData({
        clientId: '',
        contactPerson: '',
        contactPhone: '',
        siteLocation: '',
        productionStopped: false,
        safetyRisk: false,
        assignedWorkerId: '',
        estimatedHours: '',
        specialEquipment: '',
        notes: '',
      });
      setLineItems([{ id: '1', description: '', quantity: '1', unitOfMeasure: 'EA', estimatedUnitPrice: '' }]);
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close modal
      onClose();
      
      // Navigate to new job
      navigate(`/jobs/${newJob.id}`);
      
    } catch (err: any) {
      console.error('Error creating emergency job:', err);
      setError(err.message || 'Failed to create emergency job');
    } finally {
      setLoading(false);
    }
  };

  // Handle client selection - auto-fill contact info
  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ ...prev, clientId }));
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        contactPerson: client.contact_person || prev.contactPerson,
        contactPhone: client.contact_phone || prev.contactPhone,
      }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!show) return null;

  const { subtotal, vat, total } = calculateTotals();
  const severityLevel = getSeverityLevel();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              CREATE EMERGENCY JOB
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Severity Banner */}
        {(formData.productionStopped || formData.safetyRisk) && (
          <div style={{
            backgroundColor: severityLevel === 'CRITICAL' ? '#7f1d1d' : '#b91c1c',
            color: 'white',
            padding: '8px 24px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '14px',
          }}>
            {severityLevel === 'CRITICAL' 
              ? '⚠️ CRITICAL - SAFETY RISK IDENTIFIED ⚠️' 
              : '🔴 HIGH PRIORITY - PRODUCTION STOPPED'}
          </div>
        )}

        {/* Form Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            {/* Client Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#374151',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <User size={18} />
                CLIENT INFORMATION
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Client *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Select client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    required
                    placeholder="Who called?"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    required
                    placeholder="Callback number"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Problem Details Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#374151',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={18} />
                PROBLEM DETAILS
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Site/Location
                </label>
                <input
                  type="text"
                  value={formData.siteLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteLocation: e.target.value }))}
                  placeholder="Where is the breakdown?"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Severity Checkboxes */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: formData.productionStopped ? '2px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: formData.productionStopped ? '#fef2f2' : 'white',
                  cursor: 'pointer',
                  flex: 1,
                }}>
                  <input
                    type="checkbox"
                    checked={formData.productionStopped}
                    onChange={(e) => setFormData(prev => ({ ...prev, productionStopped: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Production Stopped?</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Client's operations halted</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: formData.safetyRisk ? '2px solid #7f1d1d' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: formData.safetyRisk ? '#fef2f2' : 'white',
                  cursor: 'pointer',
                  flex: 1,
                }}>
                  <input
                    type="checkbox"
                    checked={formData.safetyRisk}
                    onChange={(e) => setFormData(prev => ({ ...prev, safetyRisk: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Safety Risk?</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>People at risk</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Line Items Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}>
                  <Wrench size={18} />
                  WORK ITEMS
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* Line Items Table */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '40px' }}>#</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description *</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '80px' }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '80px' }}>UOM</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '120px' }}>Unit Price</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '120px' }}>Line Total</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '13px' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            ref={idx === lineItems.length - 1 ? lastInputRef : null}
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="What needs to be done?"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                            min="1"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'center',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <select
                            value={item.unitOfMeasure}
                            onChange={(e) => updateLineItem(item.id, 'unitOfMeasure', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <option value="EA">EA</option>
                            <option value="M">M</option>
                            <option value="KG">KG</option>
                            <option value="HR">HR</option>
                            <option value="SET">SET</option>
                            <option value="LOT">LOT</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            value={item.estimatedUnitPrice}
                            onChange={(e) => updateLineItem(item.id, 'estimatedUnitPrice', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, item.id, 'estimatedUnitPrice')}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'right',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 500 }}>
                          {formatCurrency(getLineTotal(item))}
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px 16px',
                  borderTop: '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Subtotal (Excl VAT)</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(subtotal)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>VAT (15%)</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatCurrency(vat)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Total (Incl VAT)</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>{formatCurrency(total)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Press Enter after unit price to add a new line
              </div>
            </div>

            {/* Assignment & Resources Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#374151',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Clock size={18} />
                ASSIGNMENT & RESOURCES
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Assign Worker
                  </label>
                  <select
                    value={formData.assignedWorkerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedWorkerId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Select worker...</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Special Equipment
                  </label>
                  <input
                    type="text"
                    value={formData.specialEquipment}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialEquipment: e.target.value }))}
                    placeholder="What to bring?"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  Notes / Special Instructions
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Access codes, special instructions, etc."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            <strong>Auto-Generated:</strong> Job Number, Priority = URGENT, Status = {formData.assignedWorkerId ? 'DISPATCHED' : 'PENDING'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#dc2626',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  Create Emergency Job
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyJobModal;