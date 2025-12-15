import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { quoteService } from '../../services/quoteService';
import { rfqService } from '../../services/rfqService';
import { clientService } from '../../services/clientService';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const CreateQuote: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqId = searchParams.get('rfqId');

  const [formData, setFormData] = useState({
    rfqId: rfqId || '',
    clientId: '',
    clientName: '',
    quoteNumber: '',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntilDate: '',
    description: '',
    shopOrSite: 'SHOP',
    remarks: '',
    terms: '',
    quoteStatus: 'DRAFT'
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [rfqData, setRfqData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRFQ, setLoadingRFQ] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    if (rfqId) {
      fetchRFQData(rfqId);
    }
    // Auto-calculate valid until date (30 days from today)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      validUntilDate: validDate.toISOString().split('T')[0]
    }));
  }, [rfqId]);

  const fetchClients = async () => {
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchRFQData = async (id: string) => {
    try {
      setLoadingRFQ(true);
      const data = await rfqService.getRfqById(parseInt(id));
      setRfqData(data);

      // Pre-fill form with RFQ data
      setFormData(prev => ({
        ...prev,
        rfqId: data.id,
        clientId: data.clientId ? data.clientId.toString() : '',
        description: data.description || ''
      }));

      // Fetch client details if clientId exists
      if (data.clientId) {
        try {
          const client = await clientService.getClientById(data.clientId);
          setSelectedClient(client);
          setFormData(prev => ({
            ...prev,
            clientName: client.clientName
          }));
        } catch (err) {
          console.error('Error fetching client for RFQ:', err);
        }
      }

      // If RFQ has estimated value, add as first line item
      if (data.estimatedValue) {
        const exclVat = data.estimatedValue / 1.15;
        setLineItems([{
          id: 1,
          description: data.description || 'Work as per RFQ',
          quantity: 1,
          unitPrice: parseFloat(exclVat.toFixed(2)),
          total: parseFloat(exclVat.toFixed(2))
        }]);
      }

      // Auto-select client if available
      if (data.clientId) {
        const client = await clientService.getClientById(data.clientId);
        setSelectedClient(client);
      }
    } catch (err: any) {
      console.error('Error fetching RFQ:', err);
      setError('Failed to load RFQ data');
    } finally {
      setLoadingRFQ(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setFormData(prev => ({
      ...prev,
      clientId: clientId
    }));

    if (clientId) {
      try {
        const client = await clientService.getClientById(parseInt(clientId));
        setSelectedClient(client);
        setFormData(prev => ({
          ...prev,
          clientName: client.clientName
        }));
      } catch (err) {
        console.error('Error fetching client:', err);
      }
    } else {
      setSelectedClient(null);
    }
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id), 0) + 1;
    setLineItems([...lineItems, {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }

    const totals = calculateTotals();
    if (parseFloat(totals.subtotal) <= 0) {
      alert('Please add at least one line item with a value');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const quoteData = {
        ...formData,
        clientId: parseInt(formData.clientId),
        rfqId: formData.rfqId ? parseInt(formData.rfqId) : null,
        valueExclVat: parseFloat(totals.subtotal),
        valueInclVat: parseFloat(totals.total),
        lineItems: lineItems.filter(item => item.description && item.total > 0)
      };

      const response = await quoteService.createQuote(quoteData);

      alert('Quote created successfully!');
      navigate(`/quotes/${response.quoteId}`);
    } catch (err: any) {
      console.error('Error creating quote:', err);
      setError(err.response?.data?.message || 'Failed to create quote');
      alert(err.response?.data?.message || 'Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (loadingRFQ) {
    return (
        <div className="container-fluid py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading RFQ data...</span>
            </div>
            <p className="mt-2 text-muted">Loading RFQ information...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2>
              <i className="bi bi-file-earmark-plus me-2"></i>
              Create New Quote
            </h2>
            <p className="text-muted">
              {rfqId ? `Creating quote from RFQ #${rfqData?.jobNo || rfqId}` : 'Create a new quotation'}
            </p>
          </div>
        </div>

        {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
        )}

        {rfqData && (
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-start">
                <i className="bi bi-link-45deg me-2 fs-4"></i>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-1">Linked to RFQ #{rfqData.rfqNumber}</h6>
                  <p className="mb-2 small">Client and details pre-filled from RFQ</p>
                  <Link to={`/rfq/${rfqId}`} className="btn btn-sm btn-outline-info">
                    <i className="bi bi-arrow-left me-1"></i>
                    View Original RFQ
                  </Link>
                </div>
              </div>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              {/* Client Selection */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Client Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="clientId" className="form-label">
                        Client <span className="text-danger">*</span>
                      </label>
                      <select
                          id="clientId"
                          className="form-select"
                          name="clientId"
                          value={formData.clientId}
                          onChange={handleClientChange}
                          required
                      >
                        <option key="empty" value="">Select Client</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.companyName || client.clientCode || `Client #${client.id}`}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="shopOrSite" className="form-label">
                        Location <span className="text-danger">*</span>
                      </label>
                      <select
                          id="shopOrSite"
                          name="shopOrSite"
                          className="form-select"
                          value={formData.shopOrSite}
                          onChange={handleChange}
                          required
                      >
                        <option value="SHOP">Shop</option>
                        <option value="SITE">Site</option>
                      </select>
                    </div>
                  </div>

                  {selectedClient && (
                      <div className="alert alert-light mt-3 mb-0">
                        <strong className="d-block mb-2">{selectedClient.clientName}</strong>
                        <div className="row small text-muted">
                          <div className="col-md-6">
                            <strong>Contact:</strong> {selectedClient.contactPerson || 'N/A'}
                          </div>
                          <div className="col-md-6">
                            <strong>Phone:</strong> {selectedClient.contactPhone || 'N/A'}
                          </div>
                          <div className="col-12 mt-1">
                            <strong>Email:</strong> {selectedClient.contactEmail || 'N/A'}
                          </div>
                        </div>
                      </div>
                  )}
                </div>
              </div>

              {/* Quote Details */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Quote Details</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="quoteDate" className="form-label">
                        Quote Date <span className="text-danger">*</span>
                      </label>
                      <input
                          type="date"
                          id="quoteDate"
                          name="quoteDate"
                          className="form-control"
                          value={formData.quoteDate}
                          onChange={handleChange}
                          required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="validUntilDate" className="form-label">
                        Valid Until <span className="text-danger">*</span>
                      </label>
                      <input
                          type="date"
                          id="validUntilDate"
                          name="validUntilDate"
                          className="form-control"
                          value={formData.validUntilDate}
                          onChange={handleChange}
                          required
                      />
                      <small className="text-muted">Default: 30 days from quote date</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe the work to be quoted..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Line Items</h5>
                  <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addLineItem}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Item
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                      <tr>
                        <th style={{width: '40%'}}>Description</th>
                        <th style={{width: '15%'}}>Quantity</th>
                        <th style={{width: '20%'}}>Unit Price (Excl VAT)</th>
                        <th style={{width: '20%'}}>Total</th>
                        <th style={{width: '5%'}}></th>
                      </tr>
                      </thead>
                      <tbody>
                      {lineItems.map(item => (
                          <tr key={item.id}>
                            <td>
                              <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.description}
                                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                  placeholder="Item description"
                                  required
                              />
                            </td>
                            <td>
                              <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  required
                              />
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <span className="input-group-text">R</span>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.unitPrice}
                                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                              </div>
                            </td>
                            <td>
                              <strong>R {item.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </td>
                            <td>
                              <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeLineItem(item.id)}
                                  disabled={lineItems.length === 1}
                                  title="Remove item"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Additional Information</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label htmlFor="remarks" className="form-label">
                      Internal Remarks
                    </label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        className="form-control"
                        rows={2}
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Internal notes (not visible to client)..."
                    ></textarea>
                  </div>

                  <div className="mb-0">
                    <label htmlFor="terms" className="form-label">
                      Terms & Conditions
                    </label>
                    <textarea
                        id="terms"
                        name="terms"
                        className="form-control"
                        rows={3}
                        value={formData.terms}
                        onChange={handleChange}
                        placeholder="Payment terms, delivery conditions, warranty, etc..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Quote Summary */}
              <div className="card shadow-sm mb-4 sticky-top" style={{top: '20px'}}>
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Quote Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong>Client:</strong>
                    <p className="mb-0 text-muted">{formData.clientName || 'Not selected'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Location:</strong>
                    <p className="mb-0 text-muted">{formData.shopOrSite}</p>
                  </div>
                  <hr />
                  <table className="table table-sm table-borderless mb-0">
                    <tbody>
                    <tr>
                      <td>Subtotal (Excl VAT):</td>
                      <td className="text-end">R {parseFloat(totals.subtotal).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td>VAT (15%):</td>
                      <td className="text-end">R {parseFloat(totals.vat).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-top">
                      <td><strong>Total (Incl VAT):</strong></td>
                      <td className="text-end">
                        <strong className="text-success fs-4">
                          R {parseFloat(totals.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quote Status */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Quote Status</h5>
                </div>
                <div className="card-body">
                  <div className="mb-0">
                    <label htmlFor="quoteStatus" className="form-label">
                      Status
                    </label>
                    <select
                        id="quoteStatus"
                        name="quoteStatus"
                        className="form-select"
                        value={formData.quoteStatus}
                        onChange={handleChange}
                    >
                      <option value="DRAFT">ðŸ’¾ Draft - Save for later</option>
                      <option value="SENT">ðŸ“§ Sent - Ready for client</option>
                    </select>
                    <small className="text-muted">
                      {formData.quoteStatus === 'DRAFT'
                          ? 'Quote will be saved but not sent to client. You can edit it later.'
                          : 'Quote will be marked as sent to client and ready for approval.'}
                    </small>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-grid gap-2">
                <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={loading}
                >
                  {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Quote...
                      </>
                  ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Quote
                      </>
                  )}
                </button>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(rfqId ? `/rfq/${rfqId}` : '/quotes')}
                    disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
  );
};

export default CreateQuote;