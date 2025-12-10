import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quoteService } from '../../services/quoteService';
import { clientService } from '../../services/clientService';
import './EditQuote.css';

interface Client {
  clientId: number;
  clientCode: string;
  companyName: string;
}

interface QuoteData {
  quoteId: number;
  quoteNumber: string;
  rfqId: number | null;
  clientId: number | null;
  client: string;
  quoteDate: string;
  validUntilDate: string;
  valueExclVat: number;
  valueInclVat: number;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  quoteStatus: string;
  description: string;
  location: string;
  terms: string;
  notes: string;
}

const EditQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState<QuoteData>({
    quoteId: 0,
    quoteNumber: '',
    rfqId: null,
    clientId: null,
    client: '',
    quoteDate: '',
    validUntilDate: '',
    valueExclVat: 0,
    valueInclVat: 0,
    totalAmount: 0,
    vatAmount: 0,
    grandTotal: 0,
    quoteStatus: 'DRAFT',
    description: '',
    location: 'SHOP',
    terms: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const quoteResponse = await quoteService.getQuoteById(Number(id));
        console.log('Quote data:', quoteResponse);
        
        const clientsResponse = await clientService.getAllClients();
        setClients(clientsResponse);
        
        setFormData({
          quoteId: quoteResponse.quoteId,
          quoteNumber: quoteResponse.quoteNumber || '',
          rfqId: quoteResponse.rfqId || null,
          clientId: quoteResponse.clientId || null,
          client: quoteResponse.client || '',
          quoteDate: quoteResponse.quoteDate || '',
          validUntilDate: quoteResponse.validUntilDate || '',
          valueExclVat: quoteResponse.valueExclVat || 0,
          valueInclVat: quoteResponse.valueInclVat || 0,
          totalAmount: quoteResponse.totalAmount || 0,
          vatAmount: quoteResponse.vatAmount || 0,
          grandTotal: quoteResponse.grandTotal || 0,
          quoteStatus: quoteResponse.quoteStatus || 'DRAFT',
          description: quoteResponse.description || '',
          location: quoteResponse.location || 'SHOP',
          terms: quoteResponse.terms || '',
          notes: quoteResponse.notes || ''
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading quote:', err);
        setError(err.message || 'Failed to load quote');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: numericValue
      };
      
      if (['valueExclVat', 'vatAmount'].includes(name)) {
        const exclVat = name === 'valueExclVat' ? numericValue : updated.valueExclVat;
        const vat = name === 'vatAmount' ? numericValue : updated.vatAmount;
        
        updated.totalAmount = exclVat;
        updated.vatAmount = vat;
        updated.valueInclVat = exclVat + vat;
        updated.grandTotal = exclVat + vat;
      }
      
      return updated;
    });
  };

  const calculateVAT = () => {
    const vat = formData.valueExclVat * 0.15;
    setFormData(prev => ({
      ...prev,
      vatAmount: vat,
      totalAmount: prev.valueExclVat,
      valueInclVat: prev.valueExclVat + vat,
      grandTotal: prev.valueExclVat + vat
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const updatePayload = {
        quoteId: formData.quoteId,
        quoteNumber: formData.quoteNumber,
        rfqId: formData.rfqId,
        clientId: formData.clientId,
        client: formData.client,
        quoteDate: formData.quoteDate,
        validUntilDate: formData.validUntilDate,
        valueExclVat: formData.valueExclVat,
        valueInclVat: formData.valueInclVat,
        totalAmount: formData.totalAmount,
        vatAmount: formData.vatAmount,
        grandTotal: formData.grandTotal,
        quoteStatus: formData.quoteStatus,
        description: formData.description,
        location: formData.location,
        terms: formData.terms,
        notes: formData.notes
      };
      
      console.log('Updating quote:', updatePayload);
      
      await quoteService.updateQuote(formData.quoteId, updatePayload);
      
      navigate(`/quotes/${formData.quoteId}`);
      
    } catch (err: any) {
      console.error('Error updating quote:', err);
      setError(err.message || 'Failed to update quote');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/quotes/${id}`);
  };

  if (loading) {
    return (
      <div className="edit-quote-container">
        <div className="loading">Loading quote...</div>
      </div>
    );
  }

  return (
    <div className="edit-quote-container">
      <div className="edit-quote-header">
        <h1>Edit Quote</h1>
        <div className="quote-number-display">{formData.quoteNumber}</div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-quote-form">
        <div className="form-section">
          <h2>Quote Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Quote Number</label>
              <input
                type="text"
                value={formData.quoteNumber}
                disabled
                className="readonly-field"
              />
            </div>
            
            <div className="form-group">
              <label>Status *</label>
              <select
                name="quoteStatus"
                value={formData.quoteStatus}
                onChange={handleInputChange}
                required
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SENT">Sent</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="SUPERSEDED">Superseded</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quote Date</label>
              <input
                type="date"
                name="quoteDate"
                value={formData.quoteDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Valid Until Date</label>
              <input
                type="date"
                name="validUntilDate"
                value={formData.validUntilDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="SHOP">Shop</option>
                <option value="SITE">Site</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Client</label>
              <select
                name="clientId"
                value={formData.clientId || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.companyName || client.clientCode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Financial Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Value (Excl VAT) *</label>
              <div className="input-with-button">
                <input
                  type="number"
                  name="valueExclVat"
                  value={formData.valueExclVat}
                  onChange={handleNumericChange}
                  step="0.01"
                  required
                />
                <button 
                  type="button" 
                  onClick={calculateVAT}
                  className="calc-button"
                >
                  Calculate VAT
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>VAT Amount (15%)</label>
              <input
                type="number"
                name="vatAmount"
                value={formData.vatAmount}
                onChange={handleNumericChange}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Value (Incl VAT)</label>
              <input
                type="number"
                value={formData.valueInclVat}
                disabled
                className="readonly-field"
              />
            </div>
            
            <div className="form-group">
              <label>Grand Total</label>
              <input
                type="number"
                value={formData.grandTotal}
                disabled
                className="readonly-field"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Description & Details</h2>
          
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter quote description..."
            />
          </div>

          <div className="form-group full-width">
            <label>Terms & Conditions</label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              rows={6}
              placeholder="Enter terms and conditions..."
            />
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Internal notes (not shown to client)..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="btn-cancel"
            disabled={saving}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn-save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuote;
