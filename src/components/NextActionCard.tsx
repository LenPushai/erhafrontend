import React from 'react';

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

interface NextActionCardProps {
  rfq: RFQ;
  onUploadPdf: () => void;
  onSendForSignature: () => void;
  onCreateJob: () => void;
  onEdit: () => void;
  uploading?: boolean;
  creatingJob?: boolean;
}

interface ActionConfig {
  step: number;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  buttonColor: string;
  action: 'edit' | 'upload' | 'signature' | 'createJob' | 'none';
  hint?: string;
}

const NextActionCard: React.FC<NextActionCardProps> = ({ 
  rfq, 
  onUploadPdf, 
  onSendForSignature, 
  onCreateJob,
  onEdit,
  uploading,
  creatingJob
}) => {

  const getNextAction = (): ActionConfig => {
    // Step 2: Need to assign estimator
    if (!rfq.assignedQuoter) {
      return {
        step: 2,
        title: 'Assign Estimator',
        description: 'Assign an estimator to create the quote for this RFQ.',
        icon: '👤',
        buttonText: 'Edit RFQ to Assign',
        buttonColor: '#3b82f6',
        action: 'edit'
      };
    }

    // Step 3: Need to capture quote number
    if (!rfq.quoteNumber) {
      return {
        step: 3,
        title: 'Capture Quote Number',
        description: `${rfq.assignedQuoter} should create quote in Pastel, then enter the quote number.`,
        icon: '💰',
        buttonText: 'Edit RFQ to Add Quote #',
        buttonColor: '#3b82f6',
        action: 'edit'
      };
    }

    // Step 4: Need to upload PDF
    if (!rfq.quotePdfPath) {
      return {
        step: 4,
        title: 'Upload Quote PDF',
        description: `Quote ${rfq.quoteNumber} is ready. Upload the PDF to send for approval.`,
        icon: '📄',
        buttonText: 'Upload Quote PDF',
        buttonColor: '#f59e0b',
        action: 'upload',
        hint: 'Will notify GM for approval'
      };
    }

    // Step 5: Need to send for signature
    if (!rfq.docusignStatus || rfq.docusignStatus === 'NOT_SENT') {
      const canSend = rfq.quotePdfPath && rfq.contactEmail;
      return {
        step: 5,
        title: 'Send for Customer Signature',
        description: canSend 
          ? 'Quote PDF ready. Send to customer via DocuSign for signature.'
          : 'Quote PDF ready. Need customer email to send for signature.',
        icon: '✍️',
        buttonText: canSend ? 'Send for Signature' : 'Edit RFQ to Add Email',
        buttonColor: '#22c55e',
        action: canSend ? 'signature' : 'edit',
        hint: canSend ? 'Will send DocuSign to customer' : undefined
      };
    }

    // Step 6: Waiting for customer
    if (rfq.docusignStatus === 'PENDING') {
      return {
        step: 6,
        title: 'Awaiting Customer Signature',
        description: 'Quote sent to customer. Waiting for them to sign via DocuSign.',
        icon: '⏳',
        buttonText: '',
        buttonColor: '',
        action: 'none'
      };
    }

    // Step 7: Need PO number
    if ((rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED' || rfq.signedDate) && !rfq.orderNumber) {
      return {
        step: 7,
        title: 'Enter PO Number',
        description: 'Customer has approved. Enter the Purchase Order number when received.',
        icon: '📦',
        buttonText: 'Edit RFQ to Add PO #',
        buttonColor: '#3b82f6',
        action: 'edit'
      };
    }

    // Step 8: Need to create job
    if (rfq.orderNumber && !rfq.jobId) {
      return {
        step: 8,
        title: 'Create Job Card',
        description: `PO ${rfq.orderNumber} received. Create the job to start production.`,
        icon: '🔧',
        buttonText: 'Create Job',
        buttonColor: '#8b5cf6',
        action: 'createJob',
        hint: 'Will notify workshop'
      };
    }

    // Step 9: Need invoice
    if (rfq.jobId && !rfq.invoiceNumber) {
      return {
        step: 9,
        title: 'Create Invoice',
        description: 'Job created. Enter invoice number when work is complete and invoiced.',
        icon: '🧾',
        buttonText: 'Edit RFQ to Add Invoice #',
        buttonColor: '#3b82f6',
        action: 'edit'
      };
    }

    // Step 10: Need payment
    if (rfq.invoiceNumber && !rfq.paymentDate) {
      return {
        step: 10,
        title: 'Record Payment',
        description: 'Invoice sent. Record payment when received from customer.',
        icon: '💵',
        buttonText: 'Edit RFQ to Add Payment',
        buttonColor: '#3b82f6',
        action: 'edit'
      };
    }

    // Complete!
    return {
      step: 11,
      title: 'RFQ Complete!',
      description: 'This RFQ has been fully processed from enquiry to payment.',
      icon: '🎉',
      buttonText: '',
      buttonColor: '',
      action: 'none'
    };
  };

  const nextAction = getNextAction();
  const isComplete = nextAction.step === 11;
  const isWaiting = nextAction.action === 'none' && !isComplete;

  const handleClick = () => {
    switch (nextAction.action) {
      case 'edit':
        onEdit();
        break;
      case 'upload':
        onUploadPdf();
        break;
      case 'signature':
        onSendForSignature();
        break;
      case 'createJob':
        onCreateJob();
        break;
    }
  };

  return (
    <div 
      className="card mb-3" 
      style={{ 
        border: isComplete ? '2px solid #22c55e' : (isWaiting ? '2px solid #94a3b8' : '2px solid #eab308'),
        background: isComplete ? '#f0fdf4' : (isWaiting ? '#f8fafc' : '#fefce8')
      }}
    >
      <div className="card-body">
        <div className="d-flex align-items-start gap-3">
          <div style={{ fontSize: '32px' }}>{nextAction.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              {!isComplete && !isWaiting && (
                <span 
                  className="badge" 
                  style={{ 
                    background: '#eab308', 
                    color: '#fff', 
                    fontSize: '10px',
                    fontWeight: 700 
                  }}
                >
                  STEP {nextAction.step} OF 10
                </span>
              )}
              {isWaiting && (
                <span className="badge bg-secondary" style={{ fontSize: '10px' }}>WAITING</span>
              )}
              {isComplete && (
                <span className="badge bg-success" style={{ fontSize: '10px' }}>COMPLETE</span>
              )}
            </div>
            <h5 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>
              {nextAction.title}
            </h5>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              {nextAction.description}
            </p>
          </div>
        </div>

        {nextAction.action !== 'none' && (
          <div className="mt-3">
            {nextAction.action === 'upload' ? (
              <label 
                className="btn w-100"
                style={{ 
                  background: uploading ? '#94a3b8' : nextAction.buttonColor, 
                  color: '#fff',
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : nextAction.buttonText}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && onUploadPdf()}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="pdf-upload-input"
                />
              </label>
            ) : (
              <button
                className="btn w-100"
                style={{ 
                  background: (creatingJob && nextAction.action === 'createJob') ? '#94a3b8' : nextAction.buttonColor, 
                  color: '#fff',
                  fontWeight: 600
                }}
                onClick={handleClick}
                disabled={creatingJob && nextAction.action === 'createJob'}
              >
                {(creatingJob && nextAction.action === 'createJob') ? 'Creating...' : nextAction.buttonText}
              </button>
            )}
            {nextAction.hint && (
              <div className="text-center mt-2">
                <small style={{ color: '#64748b' }}>📧 {nextAction.hint}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NextActionCard;