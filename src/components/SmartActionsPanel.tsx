import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RFQ {
  id: number;
  jobNo: string;
  assignedQuoter: string | null;
  quoteNumber: string | null;
  quotePdfPath: string | null;
  docusignStatus: string | null;
  signedDate: string | null;
  orderNumber: string | null;
  jobId: number | null;
  invoiceNumber: string | null;
  paymentDate: string | null;
  contactEmail: string | null;
}

interface SmartActionsPanelProps {
  rfq: RFQ;
  onPrintEnq: () => void;
  onUploadPdf: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendForSignature: () => void;
  onCreateJob: () => void;
  onDelete: () => void;
  uploading?: boolean;
  creatingJob?: boolean;
}

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  status: 'ready' | 'waiting' | 'done' | 'current';
  waitingFor?: string;
  doneText?: string;
  onClick?: () => void;
  isFileUpload?: boolean;
  disabled?: boolean;
}

const SmartActionsPanel: React.FC<SmartActionsPanelProps> = ({
  rfq,
  onPrintEnq,
  onUploadPdf,
  onSendForSignature,
  onCreateJob,
  onDelete,
  uploading,
  creatingJob
}) => {
  const navigate = useNavigate();

  // Determine current workflow state
  const hasEstimator = !!rfq.assignedQuoter;
  const hasQuoteNumber = !!rfq.quoteNumber;
  const hasPdf = !!rfq.quotePdfPath;
  const hasSent = rfq.docusignStatus === 'PENDING' || rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED';
  const hasSigned = !!rfq.signedDate || rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED';
  const hasOrder = !!rfq.orderNumber;
  const hasJob = !!rfq.jobId;
  const hasInvoice = !!rfq.invoiceNumber;
  const hasPayment = !!rfq.paymentDate;

  // Determine what the NEXT step is (handles out-of-order completion)
  const getNextStep = (): { step: string; action: string; description: string } | null => {
    // If we have payment, we're done regardless of other steps
    if (hasPayment) return null;
    
    // If we have invoice but no payment
    if (hasInvoice && !hasPayment) return { step: 'Record Payment', action: 'edit', description: 'Record payment when received from customer' };
    
    // If we have job but no invoice
    if (hasJob && !hasInvoice) return { step: 'Enter Invoice #', action: 'edit', description: 'Enter invoice number when work is complete' };
    
    // If we have PO but no job
    if (hasOrder && !hasJob) return { step: 'Create Job', action: 'createJob', description: 'Create job card to start production' };
    
    // If signed but no PO
    if (hasSigned && !hasOrder) return { step: 'Enter PO Number', action: 'edit', description: 'Enter the Purchase Order number from customer' };
    
    // If sent but not signed (and no PO yet - might have been done manually)
    if (hasSent && !hasSigned && !hasOrder) return { step: 'Awaiting Signature', action: 'wait', description: 'Waiting for customer to sign the quote' };
    
    // If PDF exists but not sent (and no PO - if PO exists, skip DocuSign)
    if (hasPdf && !hasSent && !hasOrder) return { step: 'Send for Signature', action: 'signature', description: 'Send quote to customer via DocuSign' };
    
    // If quote number but no PDF
    if (hasQuoteNumber && !hasPdf) return { step: 'Upload Quote PDF', action: 'upload', description: 'Upload the quote PDF to send for approval' };
    
    // If estimator but no quote
    if (hasEstimator && !hasQuoteNumber) return { step: 'Capture Quote #', action: 'edit', description: `${rfq.assignedQuoter} creates quote in Pastel, then enter the number` };
    
    // No estimator yet
    if (!hasEstimator) return { step: 'Assign Estimator', action: 'edit', description: 'Assign an estimator to create the quote' };
    
    return null; // Complete
  };

  const nextStep = getNextStep();
  const isComplete = !nextStep;

  // Build action items
  const workflowActions: ActionItem[] = [
    {
      id: 'upload',
      label: 'Upload Quote PDF',
      icon: '📤',
      status: hasPdf ? 'done' : (!hasQuoteNumber ? 'waiting' : (nextStep?.action === 'upload' ? 'current' : 'ready')),
      waitingFor: 'Quote # first',
      doneText: 'Uploaded',
      onClick: onUploadPdf,
      isFileUpload: true,
      disabled: !hasQuoteNumber || uploading
    },
    {
      id: 'signature',
      label: 'Send for Signature',
      icon: '✍️',
      status: hasSent ? 'done' : (!hasPdf ? 'waiting' : (nextStep?.action === 'signature' ? 'current' : 'ready')),
      waitingFor: 'PDF first',
      doneText: rfq.docusignStatus === 'PENDING' ? 'Sent - Awaiting' : 'Signed',
      onClick: onSendForSignature,
      disabled: !hasPdf || !rfq.contactEmail || hasSent
    },
    {
      id: 'createJob',
      label: 'Create Job',
      icon: '🔧',
      status: hasJob ? 'done' : (!hasOrder ? 'waiting' : (nextStep?.action === 'createJob' ? 'current' : 'ready')),
      waitingFor: 'PO # first',
      doneText: `Job #${rfq.jobId}`,
      onClick: onCreateJob,
      disabled: !hasOrder || hasJob || creatingJob
    }
  ];

  const getStatusBadge = (action: ActionItem) => {
    switch (action.status) {
      case 'done':
        return <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ {action.doneText || 'Done'}</span>;
      case 'waiting':
        return <span className="badge bg-secondary" style={{ fontSize: '10px' }}>Needs: {action.waitingFor}</span>;
      case 'current':
        return <span className="badge" style={{ fontSize: '10px', background: '#eab308', color: '#fff' }}>NEXT</span>;
      default:
        return <span className="badge bg-light text-dark" style={{ fontSize: '10px' }}>Ready</span>;
    }
  };

  const getButtonStyle = (action: ActionItem) => {
    if (action.status === 'done') return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    if (action.status === 'waiting') return { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' };
    if (action.status === 'current') return { background: '#fef9c3', color: '#713f12', border: '2px solid #eab308' };
    return { background: '#fff', color: '#374151', border: '1px solid #d1d5db' };
  };

  return (
    <div className="card mb-3">
      <div className="card-header bg-dark text-white">
        <h6 className="mb-0">Actions</h6>
      </div>
      <div className="card-body p-3">

        {/* Next Step Highlight */}
        {nextStep && nextStep.action !== 'wait' && (
          <div 
            style={{
              background: '#fef9c3',
              border: '2px solid #eab308',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge" style={{ background: '#eab308', color: '#fff', fontSize: '10px' }}>
                NEXT STEP
              </span>
            </div>
            <h6 style={{ margin: '0 0 4px 0', color: '#713f12', fontSize: '14px' }}>
              {nextStep.step}
            </h6>
            <p style={{ margin: '0 0 8px 0', color: '#a16207', fontSize: '12px' }}>
              {nextStep.description}
            </p>
            {nextStep.action === 'edit' && (
              <button 
                className="btn btn-sm w-100"
                style={{ background: '#eab308', color: '#fff', fontWeight: 600 }}
                onClick={() => navigate(`/rfq/${rfq.id}/edit`)}
              >
                ✏️ Edit RFQ
              </button>
            )}
          </div>
        )}

        {/* Waiting State */}
        {nextStep && nextStep.action === 'wait' && (
          <div 
            style={{
              background: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏳</div>
            <h6 style={{ margin: '0 0 4px 0', color: '#0369a1', fontSize: '14px' }}>
              {nextStep.step}
            </h6>
            <p style={{ margin: 0, color: '#0284c7', fontSize: '12px' }}>
              {nextStep.description}
            </p>
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div 
            style={{
              background: '#f0fdf4',
              border: '2px solid #22c55e',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎉</div>
            <h6 style={{ margin: '0', color: '#166534', fontSize: '14px' }}>
              RFQ Complete!
            </h6>
          </div>
        )}

        {/* Print ENQ - Always available */}
        <button 
          className="btn btn-success w-100 mb-2"
          onClick={onPrintEnq}
        >
          📄 Print ENQ Report
        </button>

        {/* Workflow Actions */}
        <div className="d-flex flex-column gap-2 mb-3">
          {workflowActions.map((action) => (
            <div key={action.id}>
              {action.isFileUpload ? (
                <label
                  className="btn w-100 d-flex justify-content-between align-items-center"
                  style={{
                    ...getButtonStyle(action),
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled && action.status !== 'done' ? 0.6 : 1
                  }}
                >
                  <span>{action.icon} {action.label}</span>
                  {getStatusBadge(action)}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => { if (e.target.files?.[0] && action.id === 'upload') { onUploadPdf(e); } else if (action.onClick) { action.onClick(); } }}
                    disabled={action.disabled}
                    style={{ display: 'none' }}
                    id={`file-upload-${action.id}`}
                  />
                </label>
              ) : (
                <button
                  className="btn w-100 d-flex justify-content-between align-items-center"
                  style={{
                    ...getButtonStyle(action),
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled && action.status !== 'done' ? 0.6 : 1
                  }}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <span>{action.icon} {action.label}</span>
                  {getStatusBadge(action)}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Job Link - if job exists */}
        {hasJob && (
          <button 
            className="btn btn-primary w-100 mb-3"
            onClick={() => navigate(`/jobs/${rfq.jobId}`)}
          >
            🔧 View Job #{rfq.jobId}
          </button>
        )}

        <hr className="my-2" />

        {/* Utility Actions */}
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary flex-fill"
            onClick={() => navigate(`/rfq/${rfq.id}/edit`)}
          >
            ✏️ Edit
          </button>
          <button 
            className="btn btn-outline-danger flex-fill"
            onClick={onDelete}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartActionsPanel;