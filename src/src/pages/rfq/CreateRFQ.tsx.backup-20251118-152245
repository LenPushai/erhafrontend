import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Phone, Mail, Building, Package, Calendar, DollarSign, AlertCircle, FileText, Users } from 'lucide-react';

type RFQType = 'INCOMING' | 'OUTGOING';
type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
type WorkLocation = 'SHOP' | 'SITE';
type ReceivedVia = 'PHONE' | 'EMAIL' | 'WALK_IN' | 'DIRECT_CONTACT';

interface IncomingRFQ {
  rfqType: 'INCOMING';
  clientName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  projectName?: string;
  description?: string;
  receivedDate?: string;
  receivedVia?: ReceivedVia;
  requiredBy?: string;
  priority?: Priority;
  workLocation?: WorkLocation;
  operatingEntity?: string;
  estimatedValue?: number;
  assignedTo?: string;
}

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [rfqType, setRfqType] = useState<RFQType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const [incomingData, setIncomingData] = useState<Partial<IncomingRFQ>>({
    rfqType: 'INCOMING',
    receivedDate: new Date().toISOString().split('T')[0],
    receivedVia: 'PHONE',
    priority: 'Normal',
    workLocation: 'SHOP',
    operatingEntity: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating RFQ:', incomingData);
    alert('RFQ Created Successfully! (Mock)');
    setTimeout(() => navigate('/rfqs'), 1500);
  };

  const updateIncoming = (field: keyof IncomingRFQ, value: any) => {
    setIncomingData(prev => ({ ...prev, [field]: value }));
  };

  if (!rfqType) {
    return (
      <div className="container-fluid">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-link text-decoration-none me-3" onClick={() => navigate('/rfqs')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="mb-1">Create New RFQ</h2>
            <p className="text-muted mb-0">Select RFQ type to begin</p>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-5">
            <div className="card h-100 border-primary" style={{ cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => { setRfqType('INCOMING'); setCurrentStep(1); }}>
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <Phone size={60} className="text-primary" />
                </div>
                <h3 className="card-title text-primary mb-3">Incoming RFQ</h3>
                <h5 className="text-muted mb-4">Client ? ERHA</h5>
                <p className="card-text mb-4">Client requests a quote from ERHA for fabrication, repair, or manufacturing work.</p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">? External client inquiry</li>
                  <li className="mb-2">? ERHA provides quote</li>
                  <li className="mb-2">? Creates job if won</li>
                  <li className="mb-2">? Revenue-generating</li>
                </ul>
                <button className="btn btn-primary btn-lg mt-3 w-100">Create Incoming RFQ</button>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card h-100 border-success" style={{ cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => { setRfqType('OUTGOING'); setCurrentStep(1); }}>
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <Package size={60} className="text-success" />
                </div>
                <h3 className="card-title text-success mb-3">Outgoing RFQ</h3>
                <h5 className="text-muted mb-4">ERHA ? Supplier</h5>
                <p className="card-text mb-4">ERHA requests a quote from supplier for materials, services, or equipment needed for a job.</p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">? Supplier inquiry</li>
                  <li className="mb-2">? ERHA receives quote</li>
                  <li className="mb-2">? Links to job/project</li>
                  <li className="mb-2">? Cost management</li>
                </ul>
                <button className="btn btn-success btn-lg mt-3 w-100">Create Outgoing RFQ</button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <small className="text-muted">Choose the type of RFQ based on the direction of the request</small>
        </div>
      </div>
    );
  }

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
              Incoming RFQ (Client ? ERHA)
            </h2>
            <p className="text-muted mb-0">Capture client inquiry details</p>
          </div>
          <span className="badge bg-primary fs-6">Step {currentStep} of 5</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              {currentStep === 1 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Building size={20} className="me-2" />Step 1: Client Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Client Company Name *</label>
                        <input type="text" className="form-control" required value={incomingData.clientName || ''} onChange={(e) => updateIncoming('clientName', e.target.value)} placeholder="e.g., CG-MILLS, SASOL" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Contact Person *</label>
                        <input type="text" className="form-control" required value={incomingData.contactPerson || ''} onChange={(e) => updateIncoming('contactPerson', e.target.value)} placeholder="Full name" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label"><Mail size={16} className="me-1" />Contact Email *</label>
                        <input type="email" className="form-control" required value={incomingData.contactEmail || ''} onChange={(e) => updateIncoming('contactEmail', e.target.value)} placeholder="email@company.co.za" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label"><Phone size={16} className="me-1" />Contact Phone *</label>
                        <input type="tel" className="form-control" required value={incomingData.contactPhone || ''} onChange={(e) => updateIncoming('contactPhone', e.target.value)} placeholder="016 970 1234" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><FileText size={20} className="me-2" />Step 2: Project Details & Operating Entity</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="alert alert-info mb-3">
                          <Building size={18} className="me-2" />
                          <strong>Select Operating Entity First</strong> - Determines which ERHA division handles this RFQ
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label"><Building size={16} className="me-1" />Operating Entity *</label>
                        <select className="form-select form-select-lg" required value={incomingData.operatingEntity || ''} onChange={(e) => updateIncoming('operatingEntity', e.target.value)}>
                          <option value="">Select Operating Entity</option>
                          <option value="ERHA FC">ERHA FC (Fabrication & Construction)</option>
                          <option value="ERHA SS">ERHA SS (Steel Supplies)</option>
                        </select>
                        <small className="text-muted">Which ERHA division will handle this RFQ?</small>
                      </div>
                      <div className="col-md-6">
                        <div className="card bg-light border-0 h-100">
                          <div className="card-body">
                            <small className="text-muted d-block mb-2">Entity Info:</small>
                            {incomingData.operatingEntity === 'ERHA FC' && (<div><strong className="text-primary">ERHA Fabrication & Construction</strong><p className="small mb-0 mt-1">Manufacturing, repairs, refurbishment, site work</p></div>)}
                            {incomingData.operatingEntity === 'ERHA SS' && (<div><strong className="text-success">ERHA Steel Supplies</strong><p className="small mb-0 mt-1">Steel sales, material supply, warehouse</p></div>)}
                            {!incomingData.operatingEntity && (<p className="small text-muted mb-0">Select entity to see details</p>)}
                          </div>
                        </div>
                      </div>
                      <div className="col-12"><hr /></div>
                      <div className="col-12">
                        <label className="form-label">Project Name *</label>
                        <input type="text" className="form-control" required value={incomingData.projectName || ''} onChange={(e) => updateIncoming('projectName', e.target.value)} placeholder="e.g., Stopper Guide Block Refurbishment" />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Detailed Description *</label>
                        <textarea className="form-control" rows={5} required value={incomingData.description || ''} onChange={(e) => updateIncoming('description', e.target.value)} placeholder="Provide comprehensive project description..." />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Calendar size={20} className="me-2" />Step 3: Timeline & Priority</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Date Received *</label>
                        <input type="date" className="form-control" required value={incomingData.receivedDate || ''} onChange={(e) => updateIncoming('receivedDate', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Required By Date *</label>
                        <input type="date" className="form-control" required value={incomingData.requiredBy || ''} onChange={(e) => updateIncoming('requiredBy', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Priority Level *</label>
                        <select className="form-select" required value={incomingData.priority || ''} onChange={(e) => updateIncoming('priority', e.target.value as Priority)}>
                          <option value="Low">Low</option>
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><DollarSign size={20} className="me-2" />Step 4: Technical & Commercial Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Estimated Value (R)</label>
                        <input type="number" className="form-control" value={incomingData.estimatedValue || ''} onChange={(e) => updateIncoming('estimatedValue', parseFloat(e.target.value))} placeholder="0.00" step="0.01" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><Users size={20} className="me-2" />Step 5: Internal Assignment</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Assign to Estimator</label>
                        <select className="form-select" value={incomingData.assignedTo || ''} onChange={(e) => updateIncoming('assignedTo', e.target.value)}>
                          <option value="">Assign later</option>
                          <option value="Juanic">Juanic</option>
                          <option value="Wessie">Wessie</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between mb-4">
                {currentStep > 1 && (<button type="button" className="btn btn-outline-secondary" onClick={() => setCurrentStep(currentStep - 1)}>Previous</button>)}
                {currentStep < 5 ? (<button type="button" className="btn btn-primary ms-auto" onClick={() => setCurrentStep(currentStep + 1)}>Next Step</button>) : (<button type="submit" className="btn btn-success ms-auto"><Save size={18} className="me-2" />Create RFQ</button>)}
              </div>
            </div>

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
                  {incomingData.operatingEntity && (<div className="mb-3"><small className="text-muted">Operating Entity</small><p className="mb-0"><span className={'badge ' + (incomingData.operatingEntity === 'ERHA FC' ? 'bg-primary' : 'bg-success')}>{incomingData.operatingEntity}</span></p></div>)}
                  {incomingData.clientName && (<div className="mb-3"><small className="text-muted">Client</small><p className="mb-0 fw-bold">{incomingData.clientName}</p></div>)}
                  {incomingData.projectName && (<div className="mb-3"><small className="text-muted">Project</small><p className="mb-0">{incomingData.projectName}</p></div>)}
                  <div className="alert alert-info small mt-4"><strong>Progress:</strong> Step {currentStep} of 5</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="alert alert-info">
        <h4>Outgoing RFQ Form</h4>
        <p>ERHA ? Supplier RFQ form will be implemented here.</p>
        <button className="btn btn-primary" onClick={() => setRfqType(null)}>Go Back</button>
      </div>
    </div>
  );
}