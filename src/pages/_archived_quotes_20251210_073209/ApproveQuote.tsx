import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../../services/quoteService';

const ApproveQuote: React.FC = () => {
  const navigate = useNavigate();
  const [quoteNumber, setQuoteNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const approvedQuote = await quoteService.approveWithPin(
        quoteNumber.toUpperCase(),
        pin
      );

      setSuccess(true);

      setTimeout(() => {
        navigate(`/quotes/${approvedQuote.quoteId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error approving quote:', err);

      if (err.response?.status === 400) {
        setError('Invalid PIN or quote number. Please check and try again.');
      } else if (err.response?.status === 404) {
        setError('Quote not found. Please check the quote number.');
      } else if (err.response?.status === 410) {
        setError('PIN has expired. Please request a new approval PIN.');
      } else {
        setError('Failed to approve quote. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-success">
              <div className="card-body text-center py-5">
                <div className="text-success mb-4">
                  <i className="bi bi-check-circle" style={{ fontSize: '5rem' }}></i>
                </div>
                <h2 className="text-success mb-3">Quote Approved!</h2>
                <p className="lead mb-4">
                  Quote {quoteNumber} has been successfully approved.
                </p>
                <p className="text-muted">
                  Redirecting to quote details...
                </p>
                <div className="spinner-border text-success mt-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-header bg-success text-white py-3">
              <h4 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Approve Quote
              </h4>
            </div>
            <div className="card-body p-4">
              <p className="text-muted mb-4">
                Enter the quote number and approval PIN provided by the admin.
              </p>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="quoteNumber" className="form-label fw-bold">
                    Quote Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="quoteNumber"
                    className="form-control form-control-lg"
                    placeholder="e.g., NE008883"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value.toUpperCase())}
                    required
                    disabled={loading}
                  />
                  <small className="text-muted">
                    Enter the quote number exactly as shown
                  </small>
                </div>

                <div className="mb-4">
                  <label htmlFor="pin" className="form-label fw-bold">
                    Approval PIN <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="pin"
                    className="form-control form-control-lg text-center"
                    placeholder="6-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setPin(value);
                      }
                    }}
                    maxLength={6}
                    required
                    disabled={loading}
                    style={{
                      fontSize: '2rem',
                      letterSpacing: '0.5rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <small className="text-muted">
                    Enter the 6-digit PIN provided
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={loading || pin.length !== 6 || !quoteNumber}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Approving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Approve Quote
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="alert alert-info mt-4">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Manager Note:</strong> Approval PINs expire after 24 hours or once used.
            If you encounter issues, contact the admin for a new PIN.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveQuote;