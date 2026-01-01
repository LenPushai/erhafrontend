import React from 'react';

interface RFQ {
  id: number;
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

interface WorkflowProgressProps {
  rfq: RFQ;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ rfq }) => {
  const steps = [
    { key: 'rfq', label: 'RFQ', done: true },
    { key: 'est', label: 'Estimator', done: !!rfq.assignedQuoter },
    { key: 'quote', label: 'Quote', done: !!rfq.quoteNumber },
    { key: 'pdf', label: 'PDF', done: !!rfq.quotePdfPath },
    { key: 'sent', label: 'Sent', done: ['PENDING', 'SIGNED', 'COMPLETED'].includes(rfq.docusignStatus || '') },
    { key: 'signed', label: 'Signed', done: !!rfq.signedDate || rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED' },
    { key: 'po', label: 'PO', done: !!rfq.orderNumber },
    { key: 'job', label: 'Job', done: !!rfq.jobId },
    { key: 'inv', label: 'Invoice', done: !!rfq.invoiceNumber },
    { key: 'paid', label: 'Paid', done: !!rfq.paymentDate }
  ];

  const completedCount = steps.filter(s => s.done).length;
  const currentIndex = steps.findIndex(s => !s.done);
  const isComplete = currentIndex === -1;

  return (
    <div className="card">
      <div 
        className="card-header py-2 d-flex justify-content-between align-items-center"
        style={{ 
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          color: '#fff'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Progress</span>
        <span 
          className="badge"
          style={{ 
            background: isComplete ? '#22c55e' : 'rgba(255,255,255,0.2)',
            fontSize: '11px'
          }}
        >
          {completedCount}/10
        </span>
      </div>
      <div className="card-body p-2">
        {/* Compact Step Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '4px',
          fontSize: '10px'
        }}>
          {steps.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step.key}
                title={step.label}
                style={{
                  textAlign: 'center',
                  padding: '6px 2px',
                  borderRadius: '4px',
                  background: step.done 
                    ? '#dcfce7' 
                    : (isCurrent ? '#fef9c3' : '#f8fafc'),
                  border: `1.5px solid ${
                    step.done 
                      ? '#22c55e' 
                      : (isCurrent ? '#eab308' : '#e2e8f0')
                  }`
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  marginBottom: '2px' 
                }}>
                  {step.done ? '✅' : (isCurrent ? '🟡' : '○')}
                </div>
                <div style={{ 
                  color: step.done ? '#166534' : (isCurrent ? '#92400e' : '#94a3b8'),
                  fontWeight: isCurrent ? 700 : 500,
                  lineHeight: 1.1
                }}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;