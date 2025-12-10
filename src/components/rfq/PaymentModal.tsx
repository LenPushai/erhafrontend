import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface PaymentModalProps {
  rfq: any;
  show: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ rfq, show, onClose, onPaymentRecorded }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState(rfq?.quoteValueInclVat || '');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    'EFT',
    'Cash',
    'Cheque',
    'Credit Card',
    'Debit Card',
    'Direct Deposit'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentDate) {
      setError('Payment date is required');
      return;
    }
    
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const paymentData = {
        paymentDate,
        amountPaid: parseFloat(amountPaid),
        paymentReference: paymentReference.trim() || null,
        paymentMethod
      };

      const response = await fetch(`http://localhost:8080/api/v1/rfqs/${rfq.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      alert('? Payment recorded successfully!');
      onPaymentRecorded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      console.error('Payment error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 2 
    }).format(value);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title d-flex align-items-center">
              <DollarSign className="me-2" size={24} />
              Mark as Paid
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              disabled={saving}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Invoice Number:</strong>
                  <span className="badge bg-primary">{rfq.invoiceNumber}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Invoice Date:</strong>
                  <span>{rfq.invoiceDate ? new Date(rfq.invoiceDate).toLocaleDateString('en-ZA') : 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Invoice Amount:</strong>
                  <span className="text-success fw-bold fs-5">
                    {formatCurrency(rfq.quoteValueInclVat || 0)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="paymentDate" className="form-label fw-semibold">
                  Payment Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <small className="text-muted">Date when payment was received</small>
              </div>

              <div className="mb-3">
                <label htmlFor="amountPaid" className="form-label fw-semibold">
                  Amount Paid <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">R</span>
                  <input
                    type="number"
                    className="form-control"
                    id="amountPaid"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
                {parseFloat(amountPaid) !== rfq.quoteValueInclVat && amountPaid && (
                  <small className="text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Amount differs from invoice total
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="paymentMethod" className="form-label fw-semibold">
                  Payment Method <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="paymentReference" className="form-label fw-semibold">
                  Payment Reference / Transaction ID
                </label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., EFT-12345, CHQ-9876"
                  maxLength={100}
                />
                <small className="text-muted">
                  Bank reference, EFT number, cheque number, or transaction ID
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Recording...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;