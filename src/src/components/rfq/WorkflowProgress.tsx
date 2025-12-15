import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';

interface RFQProps {
  rfq: any;
}

const WorkflowProgress: React.FC<RFQProps> = ({ rfq }) => {
  const stages = [
    {
      id: 1,
      name: 'RFQ Created',
      completed: true,
      date: rfq?.requestDate,
    },
    {
      id: 2,
      name: 'Quote Added',
      completed: !!(rfq?.quoteNumber),
      date: rfq?.quoteDate,
      ref: rfq?.quoteNumber
    },
    {
      id: 3,
      name: 'PDF Uploaded',
      completed: !!(rfq?.quotePdfPath),
      date: rfq?.quotePdfUploadDate,
    },
    {
      id: 4,
      name: 'Customer Signed',
      completed: !!(rfq?.signedDate),
      date: rfq?.signedDate,
    },
    {
      id: 5,
      name: 'Order Received',
      completed: !!(rfq?.orderNumber),
      date: rfq?.orderDate,
      ref: rfq?.orderNumber
    },
    {
      id: 6,
      name: 'Job Created',
      completed: !!(rfq?.jobId),
      date: rfq?.jobCreatedDate,
      ref: rfq?.jobNumber
    },
    {
      id: 7,
      name: 'Invoiced',
      completed: !!(rfq?.invoiceNumber),
      date: rfq?.invoiceDate,
      ref: rfq?.invoiceNumber
    },
    {
      id: 8,
      name: 'Payment Received',
      completed: !!(rfq?.paymentDate),
      date: rfq?.paymentDate,
      ref: rfq?.amountPaid ? `R ${parseFloat(rfq.amountPaid).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : null
    }
  ];

  // FIXED LOGIC: Correct dependency order
  const getNextActionStage = (): number => {
    // Priority order with proper dependencies
    if (!rfq?.quoteNumber) return 2;      // Must have quote FIRST
    if (!rfq?.quotePdfPath) return 3;     // Then PDF (needs quote)
    if (!rfq?.signedDate) return 4;       // Then signature (needs PDF)
    if (!rfq?.orderNumber) return 5;      // Then order (needs signature)
    if (!rfq?.jobId) return 6;            // Then job (needs order)
    if (!rfq?.invoiceNumber) return 7;    // Then invoice (needs job)
    if (!rfq?.paymentDate) return 8;      // Finally payment (needs invoice)
    return -1; // All complete
  };

  const nextActionStage = getNextActionStage();
  const completedCount = stages.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-dark text-white">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0 fw-bold">Workflow Progress</h5>
          <span className="badge bg-light text-dark fs-6 px-3">{progressPercent}%</span>
        </div>
        <div className="progress bg-secondary" style={{ height: '10px' }}>
          <div 
            className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="mt-2">
          <small className="text-white-50">
            <i className="bi bi-check-circle me-1"></i>
            {completedCount} of {stages.length} stages completed
          </small>
        </div>
      </div>

      {/* Stages List */}
      <div className="card-body p-0">
        {stages.map((stage, index) => {
          const isCompleted = stage.completed;
          const isNext = stage.id === nextActionStage;
          const isPending = !isCompleted && !isNext;

          return (
            <div 
              key={stage.id}
              className={`p-3 ${index < stages.length - 1 ? 'border-bottom' : ''} ${
                isCompleted ? 'bg-success bg-opacity-10' : 
                isNext ? 'bg-primary bg-opacity-10' : ''
              }`}
            >
              <div className="d-flex align-items-center">
                {/* Icon Circle */}
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                    isCompleted ? 'bg-success text-white' :
                    isNext ? 'bg-primary text-white' :
                    'bg-light border text-muted'
                  }`}
                  style={{ width: '44px', height: '44px', minWidth: '44px' }}
                >
                  {isCompleted ? (
                    <Check size={24} strokeWidth={3} />
                  ) : isNext ? (
                    <Clock size={22} />
                  ) : (
                    <Circle size={20} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className={`mb-0 ${
                      isCompleted ? 'text-success fw-semibold' :
                      isNext ? 'text-primary fw-semibold' :
                      'text-muted'
                    }`} style={{ fontSize: '0.95rem' }}>
                      {stage.name}
                    </h6>
                    
                    {/* Status Badge */}
                    <span className={`badge ms-2 ${
                      isCompleted ? 'bg-success' :
                      isNext ? 'bg-primary' :
                      'bg-secondary'
                    }`} style={{ fontSize: '0.7rem' }}>
                      {isCompleted ? 'Complete' : isNext ? 'In Progress' : 'Pending'}
                    </span>
                  </div>

                  {/* Details Row */}
                  {(stage.date || stage.ref) && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {stage.date && (
                        <small className={`${isCompleted ? 'text-success' : 'text-muted'}`}>
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatDate(stage.date)}
                        </small>
                      )}
                      
                      {stage.ref && isCompleted && (
                        <span className="badge bg-white border text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
                          {stage.ref}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Helper Text */}
                  {isNext && (
                    <small className="text-primary d-block mt-1">
                      <i className="bi bi-arrow-right me-1"></i>
                      Action required
                    </small>
                  )}
                  
                  {isPending && !stage.date && (
                    <small className="text-muted fst-italic d-block mt-1">
                      Awaiting completion
                    </small>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className={`card-footer ${progressPercent === 100 ? 'bg-success bg-opacity-10 border-success' : 'bg-light'}`}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {progressPercent === 100 ? (
              <>
                <Check className="text-success me-2" size={20} />
                <strong className="text-success mb-0">Complete!</strong>
              </>
            ) : (
              <>
                <Clock className="text-primary me-2" size={20} />
                <strong className="mb-0">{stages.length - completedCount} steps remaining</strong>
              </>
            )}
          </div>
          <small className="text-muted">
            Overall Progress
          </small>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;
