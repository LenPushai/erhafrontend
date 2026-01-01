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
    { name: 'RFQ Received', done: true },
    { name: 'Estimator Assigned', done: !!rfq.assignedQuoter },
    { name: 'Quote Captured', done: !!rfq.quoteNumber },
    { name: 'PDF Uploaded', done: !!rfq.quotePdfPath },
    { name: 'Sent to Customer', done: ['PENDING', 'SIGNED', 'COMPLETED'].includes(rfq.docusignStatus || '') },
    { name: 'Customer Signed', done: !!rfq.signedDate || rfq.docusignStatus === 'SIGNED' || rfq.docusignStatus === 'COMPLETED' },
    { name: 'PO Received', done: !!rfq.orderNumber },
    { name: 'Job Created', done: !!rfq.jobId },
    { name: 'Invoiced', done: !!rfq.invoiceNumber },
    { name: 'Payment Received', done: !!rfq.paymentDate }
  ];

  const completedCount = steps.filter(s => s.done).length;
  const currentIndex = steps.findIndex(s => !s.done);

  return (
    <div className="card">
      <div className="card-header text-white py-2" style={{ background: 'linear-gradient(135deg, #115e59 0%, #0f766e 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Progress</span>
          <span className="badge bg-light text-dark">{completedCount}/{steps.length}</span>
        </div>
      </div>
      <div className="card-body p-2">
        {/* Progress Bar */}
        <div className="d-flex gap-1 mb-2" style={{ padding: '2px', background: '#f1f5f9', borderRadius: '4px' }}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              title={step.name}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: step.done ? '#22c55e' : (idx === currentIndex ? '#eab308' : 'transparent')
              }}
            />
          ))}
        </div>

        {/* Steps List - Compact */}
        <div style={{ fontSize: '11px' }}>
          {steps.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className="d-flex align-items-center gap-2 py-1 px-2"
                style={{
                  background: step.done ? '#f0fdf4' : (isCurrent ? '#fef9c3' : 'transparent'),
                  borderLeft: `3px solid ${step.done ? '#22c55e' : (isCurrent ? '#eab308' : 'transparent')}`,
                  borderRadius: '2px',
                  marginBottom: '1px'
                }}
              >
                <span style={{ width: '14px', textAlign: 'center' }}>
                  {step.done ? '✅' : (isCurrent ? '🟡' : '○')}
                </span>
                <span style={{ 
                  flex: 1,
                  color: step.done ? '#166534' : (isCurrent ? '#713f12' : '#9ca3af'),
                  fontWeight: isCurrent ? 600 : 400
                }}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;