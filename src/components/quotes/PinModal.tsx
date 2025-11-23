import React from 'react';

interface PinModalProps {
  show: boolean;
  onClose: () => void;
  pin: string;
  quoteNumber: string;
  expiresAt: string;
  clientName?: string;
  quoteValue?: number;
}

const PinModal: React.FC<PinModalProps> = ({
  show,
  onClose,
  pin,
  quoteNumber,
  expiresAt,
  clientName,
  quoteValue
}) => {
  if (!show) return null;

  const expiryDate = new Date(expiresAt);
  const formattedExpiry = expiryDate.toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const whatsappMessage = `Please approve Quote ${quoteNumber}${clientName ? ` for ${clientName}` : ''}${quoteValue ? ` - R${quoteValue.toLocaleString('en-ZA')}` : ''}. PIN: ${pin}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1050 }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">
                <i className="bi bi-shield-check me-2"></i>
                Quote Submitted for Approval
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {/* PIN Display */}
              <div className="alert alert-success text-center mb-4">
                <h6 className="mb-2">Approval PIN</h6>
                <div
                  className="display-1 fw-bold text-success mb-2"
                  style={{ letterSpacing: '0.5rem', fontFamily: 'monospace' }}
                >
                  {pin}
                </div>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  Expires: {formattedExpiry}
                </small>
              </div>

              {/* Instructions */}
              <div className="mb-3">
                <h6 className="fw-bold">
                  <i className="bi bi-info-circle me-2"></i>
                  Next Steps
                </h6>
                <ol className="small mb-0">
                  <li>Share this PIN with the approving manager</li>
                  <li>Manager enters PIN in their dashboard to approve</li>
                  <li>PIN expires in 24 hours</li>
                  <li>Once approved, you can send the quote to the client</li>
                </ol>
              </div>

              {/* WhatsApp Template */}
              <div className="alert alert-light mb-0">
                <div className="d-flex align-items-start">
                  <i className="bi bi-whatsapp text-success fs-3 me-3"></i>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-2">WhatsApp Message Template</h6>
                    <div
                      className="p-2 bg-white border rounded small mb-2"
                      style={{ fontFamily: 'system-ui' }}
                    >
                      {whatsappMessage}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => copyToClipboard(whatsappMessage)}
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      Copy Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PinModal;