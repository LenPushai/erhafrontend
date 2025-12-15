import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Phone, Mail, Building, Package, Calendar, DollarSign, AlertCircle, FileText, Users, Loader } from 'lucide-react';

interface Client {
  clientId: number;
  clientCode: string;
  clientName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

const API_BASE = 'http://localhost:8080/api/v1';

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [rfqType, setRfqType] = useState<'INCOMING' | 'OUTGOING' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Clients from API
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Form data - aligned with backend RFQ entity
  const [formData, setFormData] = useState({
    // Client info
    clientId: null as number | null,
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    // RFQ details
    operatingEntity: '',
    projectName: '',
    description: '',
    requestDate: new Date().toISOString().split('T')[0],
    requiredDate: '2025-12-24',
    priority: 'MEDIUM',
    estimatedValue: 0,
    // Assignment
    assignedTo: '',
    // Meta
    workLocation: 'SHOP',
    receivedVia: 'PHONE'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch(`${API_BASE}/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleClientSelect = (clientIdStr: string) => {
    const clientId = parseInt(clientIdStr);
    const client = clients.find(c => c.clientId === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId: client.clientId,
        contactPerson: client.contactPerson || prev.contactPerson,
        contactEmail: client.contactEmail || prev.contactEmail,
        contactPhone: client.contactPhone || prev.contactPhone
      }));
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobNo = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `RFQ-${year}${month}${day}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Build payload matching backend RFQ entity exactly
      const rfqPayload = {
        jobNo: generateJobNo(),
        clientId: formData.clientId || 1,
        contactPerson: formData.contactPerson || 'Not specified',
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        operatingEntity: formData.operatingEntity || 'ERHA FC',
        description: formData.description || formData.projectName || 'No description',
        requestDate: formData.requestDate,
        requiredDate: formData.requiredDate,
        priority: formData.priority,
        estimatedValue: formData.estimatedValue || 0,
        assignedTo: formData.assignedTo || null,
        notes: `Project: ${formData.projectName}\nWork Location: ${formData.workLocation}\nReceived Via: ${formData.receivedVia}`
      };

      console.log('Submitting RFQ:', rfqPayload);

      const response = await fetch(`${API_BASE}/rfqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rfqPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error('Failed to create RFQ - check server logs');
      }

      const created = await response.json();
      console.log('RFQ Created:', created);
      alert(`RFQ Created Successfully!\n\nJob No: ${created.jobNo}`);
      navigate('/rfq');

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to create RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // RFQ Type Selection Screen
  if (!rfqType) {
    return (
      <div className="container-fluid">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-link text-decoration-none me-3" onClick={() => navigate('/rfq')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="mb-1">Create New RFQ</h2>
            <p className="text-muted mb-0">Select RFQ type to begin</p>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-5">
            <div 
              className="card h-100 border-primary" 
              style={{ cursor: 'pointer' }} 
              onClick={() => { setRfqType('INCOMING'); setCurrentStep(1); }}
            >
              <div className="card-body p-5 text-center">
                <Phone size={60} className="text-primary mb-4" />
                <h3 className="text-primary mb-3">Incoming RFQ</h3>
                <h5 className="text-muted mb-4">Client â†’ ERHA</h5>
                <p className="mb-4">Client requests a quote from ERHA for fabrication, repair, or manufacturing work.</p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">âœ“ External client inquiry</li>
                  <li className="mb-2">âœ“ ERHA provides quote</li>
                  <li className="mb-2">âœ“ Creates job if won</li>
                  <li className="mb-2">âœ“ Revenue-generating</li>
                </ul>
                <button className="btn btn-primary btn-lg mt-3 w-100">Create Incoming RFQ</button>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div 
              className="card h-100 border-success" 
              style={{ cursor: 'pointer' }} 
              onClick={() => { setRfqType('OUTGOING'); setCurrentStep(1); }}
            >
              <div className="card-body p-5 text-center">
                <Package size={60} className="text-success mb-4" />
                <h3 className="text-success mb-3">Outgoing RFQ</h3>
                <h5 className="text-muted mb-4">ERHA â†’ Supplier</h5>
                <p className="mb-4">ERHA requests a quote from supplier for materials, services, or equipment.</p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">âœ“ Supplier inquiry</li>
                  <li className="mb-2">âœ“ ERHA receives quote</li>
                  <li className="mb-2">âœ“ Links to job/project</li>
                  <li className="mb-2">âœ“ Cost management</li>
                </ul>
                <button className="btn btn-success btn-lg mt-3 w-100">Create Outgoing RFQ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Incoming RFQ Form
  if (rfqType === 'INCOMING') {
    return (
      <div className="container-fluid">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-link text-decoration-none me-3" onClick={() => setRfqType(null)}>
            <ArrowLeft size={20} />
          </button>
          <div className="flex-grow-1">
            <h2 className="mb-1">
              <Phone size={24} className="text-primary me-2" />
              Incoming RFQ (Client â†’ ERHA)
            </h2>
            <p className="text-muted mb-0">Capture client inquiry details</p>
          </div>
          <span className="badge bg-primary fs-6">Step {currentStep} of 5</span>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <AlertCircle size={20} className="me-2" />
            {error}
            <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              
              {/* Step 1: Client */}
              {currentStep === 1 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Building size={20} className="me-2" />Step 1: Client Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-bold">Select Client *</label>
                        <select 
                          className="form-select form-select-lg" 
                          value={formData.clientId || ''} 
                          onChange={(e) => handleClientSelect(e.target.value)}
                          required
                        >
                          <option value="">-- Select a Client --</option>
                          {loadingClients && <option disabled>Loading...</option>}
                          {clients.map(client => (
                            <option key={client.clientId} value={client.clientId}>
                              {client.clientCode} - {client.clientName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12"><hr /></div>
                      <div className="col-md-6">
                        <label className="form-label">Contact Person *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          value={formData.contactPerson} 
                          onChange={(e) => updateForm('contactPerson', e.target.value)} 
                          placeholder="Full name" 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label"><Mail size={16} className="me-1" />Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={formData.contactEmail} 
                          onChange={(e) => updateForm('contactEmail', e.target.value)} 
                          placeholder="email@company.co.za" 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label"><Phone size={16} className="me-1" />Phone</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={formData.contactPhone} 
                          onChange={(e) => updateForm('contactPhone', e.target.value)} 
                          placeholder="016 970 1234" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Project */}
              {currentStep === 2 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><FileText size={20} className="me-2" />Step 2: Project Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Operating Entity *</label>
                        <select 
                          className="form-select form-select-lg" 
                          required 
                          value={formData.operatingEntity} 
                          onChange={(e) => updateForm('operatingEntity', e.target.value)}
                        >
                          <option value="">Select Entity</option>
                          <option value="ERHA FC">ERHA FC (Fabrication & Construction)</option>
                          <option value="ERHA SS">ERHA SS (Steel Supplies)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Work Location</label>
                        <select 
                          className="form-select" 
                          value={formData.workLocation} 
                          onChange={(e) => updateForm('workLocation', e.target.value)}
                        >
                          <option value="SHOP">Shop (Workshop)</option>
                          <option value="SITE">Site (Client Location)</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Project Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          value={formData.projectName} 
                          onChange={(e) => updateForm('projectName', e.target.value)} 
                          placeholder="e.g., Stopper Guide Block Refurbishment" 
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description *</label>
                        <textarea 
                          className="form-control" 
                          rows={4} 
                          required 
                          value={formData.description} 
                          onChange={(e) => updateForm('description', e.target.value)} 
                          placeholder="Detailed project description..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Timeline */}
              {currentStep === 3 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Calendar size={20} className="me-2" />Step 3: Timeline & Priority</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Date Received *</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          required 
                          value={formData.requestDate} 
                          onChange={(e) => updateForm('requestDate', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Required By Date *</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          required 
                          value={formData.requiredDate} 
                          onChange={(e) => updateForm('requiredDate', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Priority *</label>
                        <select 
                          className="form-select" 
                          required 
                          value={formData.priority} 
                          onChange={(e) => updateForm('priority', e.target.value)}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Received Via</label>
                        <select 
                          className="form-select" 
                          value={formData.receivedVia} 
                          onChange={(e) => updateForm('receivedVia', e.target.value)}
                        >
                          <option value="PHONE">Phone Call</option>
                          <option value="EMAIL">Email</option>
                          <option value="WALK_IN">Walk-in</option>
                          <option value="DIRECT_CONTACT">Direct Contact</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Commercial */}
              {currentStep === 4 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><DollarSign size={20} className="me-2" />Step 4: Commercial Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Estimated Value (R)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={formData.estimatedValue || ''} 
                          onChange={(e) => updateForm('estimatedValue', parseFloat(e.target.value) || 0)} 
                          placeholder="0.00" 
                          step="0.01" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Assignment */}
              {currentStep === 5 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Users size={20} className="me-2" />Step 5: Assignment</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Assign to Estimator</label>
                        <select 
                          className="form-select" 
                          value={formData.assignedTo} 
                          onChange={(e) => updateForm('assignedTo', e.target.value)}
                        >
                          <option value="">Assign later</option>
                          <option value="Juanic">Juanic</option>
                          <option value="Wessie">Wessie</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="d-flex justify-content-between mb-4">
                {currentStep > 1 && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                    Previous
                  </button>
                )}
                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary ms-auto" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success btn-lg ms-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                    ) : (
                      <><Save size={18} className="me-2" />Create RFQ</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="col-lg-4">
              <div className="card sticky-top" style={{ top: '20px' }}>
                <div className="card-header bg-light">
                  <h6 className="mb-0">RFQ Summary</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted">Type</small>
                    <p className="mb-0 fw-bold text-primary"><Phone size={16} className="me-1" />INCOMING</p>
                  </div>
                  {formData.operatingEntity && (
                    <div className="mb-3">
                      <small className="text-muted">Entity</small>
                      <p className="mb-0"><span className={`badge ${formData.operatingEntity === 'ERHA FC' ? 'bg-primary' : 'bg-success'}`}>{formData.operatingEntity}</span></p>
                    </div>
                  )}
                  {formData.clientId && (
                    <div className="mb-3">
                      <small className="text-muted">Client</small>
                      <p className="mb-0 fw-bold">{clients.find(c => c.clientId === formData.clientId)?.clientName}</p>
                    </div>
                  )}
                  {formData.projectName && (
                    <div className="mb-3">
                      <small className="text-muted">Project</small>
                      <p className="mb-0">{formData.projectName}</p>
                    </div>
                  )}
                  {formData.priority && (
                    <div className="mb-3">
                      <small className="text-muted">Priority</small>
                      <p className="mb-0">
                        <span className={`badge bg-${formData.priority === 'URGENT' ? 'danger' : formData.priority === 'HIGH' ? 'warning' : 'secondary'}`}>
                          {formData.priority}
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="alert alert-info small mt-4">
                    <strong>Progress:</strong> Step {currentStep} of 5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Outgoing RFQ Placeholder
  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link text-decoration-none me-3" onClick={() => setRfqType(null)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="mb-1"><Package size={24} className="text-success me-2" />Outgoing RFQ (ERHA â†’ Supplier)</h2>
          <p className="text-muted mb-0">Request quotes from suppliers</p>
        </div>
      </div>

      <div className="card border-success">
        <div className="card-body p-5 text-center">
          <Package size={80} className="text-success mb-4" />
          <h3 className="text-success mb-3">Procurement Module - Phase 2</h3>
          <p className="text-muted mb-4">This module will enable the Procurement Officer to send RFQs to suppliers, collect quotes, compare prices, and generate Purchase Orders.</p>
          
          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="mb-3">Coming Features:</h5>
                  <ul className="list-unstyled text-start">
                    <li className="mb-2">âœ… Supplier Database (10 suppliers ready)</li>
                    <li className="mb-2">âœ… Send RFQs to multiple suppliers</li>
                    <li className="mb-2">âœ… Quote comparison matrix</li>
                    <li className="mb-2">âœ… Purchase Order generation</li>
                    <li className="mb-2">âœ… Link materials to jobs</li>
                    <li className="mb-2">âœ… Pastel accounting integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-outline-success btn-lg" onClick={() => setRfqType(null)}>
            <ArrowLeft size={18} className="me-2" />Back to RFQ Selection
          </button>
        </div>
      </div>
    </div>
  );
}