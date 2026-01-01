import React from 'react';

interface RFQ {
  id: number;
  jobNo: string;
  clientId: number;
  contactPerson: string;
  priority: string;
  estimatedValue: number;
  requiredDate: string;
  assignedQuoter: string | null;
  quoteNumber: string | null;
  quotePdfPath: string | null;
  docusignStatus: string | null;
  signedDate: string | null;
  orderNumber: string | null;
  jobId: number | null;
  invoiceNumber: string | null;
  paymentDate: string | null;
}

interface RFQHeaderProps {
  rfq: RFQ;
}

const RFQHeader: React.FC<RFQHeaderProps> = ({ rfq }) => {
  // Calculate progress
  const steps = [
    { done: true }, // RFQ Received
    { done: !!rfq.assignedQuoter },
    { done: !!rfq.quoteNumber },
    { done: !!rfq.quotePdfPath },
    { done: ['PENDING', 'SIGNED', 'COMPLETED'].includes(rfq.docusignStatus || '') },
    { done: !!rfq.signedDate || rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED' },
    { done: !!rfq.orderNumber },
    { done: !!rfq.jobId },
    { done: !!rfq.invoiceNumber },
    { done: !!rfq.paymentDate }
  ];
  
  const completedCount = steps.filter(s => s.done).length;
  const progress = (completedCount / steps.length) * 100;

  const stepNames = [
    'RFQ Received', 'Estimator Assigned', 'Quote Captured', 'PDF Uploaded',
    'Sent to Customer', 'Customer Signed', 'PO Received', 'Job Created',
    'Invoiced', 'Payment Received'
  ];
  
  const currentStepIndex = steps.findIndex(s => !s.done);
  const currentStepName = currentStepIndex === -1 ? 'Complete!' : stepNames[currentStepIndex];

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-ZA');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return { bg: '#dc2626', text: '#fff' };
      case 'HIGH': return { bg: '#f97316', text: '#fff' };
      case 'NORMAL': return { bg: '#0ea5e9', text: '#fff' };
      case 'LOW': return { bg: '#6b7280', text: '#fff' };
      default: return { bg: '#6b7280', text: '#fff' };
    }
  };

  const priorityColor = getPriorityColor(rfq.priority);

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        color: '#fff'
      }}
    >
      {/* Top Row - Key Info */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
          {rfq.jobNo}
        </h4>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>•</span>
        <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
          {rfq.contactPerson || 'No Contact'}
        </span>
        <span 
          style={{
            background: priorityColor.bg,
            color: priorityColor.text,
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          {rfq.priority}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: 'auto' }}>
          Est. {formatCurrency(rfq.estimatedValue)}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
          Due: {formatDate(rfq.requiredDate)}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '8px' }}>
        <div 
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            height: '8px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              background: completedCount === 10 
                ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                : 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
              height: '100%',
              width: `${progress}%`,
              borderRadius: '6px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Bottom Row - Step Info */}
      <div className="d-flex justify-content-between align-items-center">
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
          Step {completedCount}/10: <span style={{ color: '#fff', fontWeight: 600 }}>{currentStepName}</span>
        </span>
        <div className="d-flex gap-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              title={stepNames[idx]}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: step.done ? '#22c55e' : (idx === currentStepIndex ? '#eab308' : 'rgba(255,255,255,0.2)')
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RFQHeader;