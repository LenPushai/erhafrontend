import React from 'react';

interface RFQData {
  id: number;
  requestDate?: string;
  assignedQuoter?: string | null;
  quoteNumber?: string | null;
  quotePdfPath?: string | null;
  docusignStatus?: string | null;
  orderNumber?: string | null;
  jobId?: number | null;
  invoiceNumber?: string | null;
  amountPaid?: number | null;
}

interface SmartWorkflowProps {
  rfq: RFQData;
}

const SmartWorkflow: React.FC<SmartWorkflowProps> = ({ rfq }) => {
  // If we have a PO, customer has approved (regardless of DocuSign)
  const customerApproved = rfq.docusignStatus === "COMPLETED" || !!rfq.orderNumber;
  const sentToCustomer = !!rfq.docusignStatus || !!rfq.orderNumber;

  const steps = [
    { key: "received", label: "RFQ Received", done: !!rfq.id, info: rfq.requestDate ? new Date(rfq.requestDate).toLocaleDateString("en-ZA") : null },
    { key: "assigned", label: "Quoter Assigned", done: !!rfq.assignedQuoter, info: rfq.assignedQuoter || null },
    { key: "quoted", label: "Quote Captured", done: !!rfq.quoteNumber, info: rfq.quoteNumber || null },
    { key: "pdf", label: "Quote PDF Ready", done: !!rfq.quotePdfPath, info: null },
    { key: "sent", label: "Sent to Customer", done: sentToCustomer, info: rfq.docusignStatus === "PENDING" ? "Awaiting" : null },
    { key: "approved", label: "Customer Approved", done: customerApproved, info: null },
    { key: "po", label: "PO Received", done: !!rfq.orderNumber, info: rfq.orderNumber || null },
    { key: "job", label: "Job Created", done: !!rfq.jobId, info: rfq.jobId ? "Job #" + rfq.jobId : null },
    { key: "invoiced", label: "Invoiced", done: !!rfq.invoiceNumber, info: rfq.invoiceNumber || null },
    { key: "paid", label: "Payment Received", done: (rfq.amountPaid || 0) > 0, info: null }
  ];

  const nextIdx = steps.findIndex(s => !s.done);

  return (
    <div className="card">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Workflow Progress</h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {steps.map((step, idx) => {
            const isNext = idx === nextIdx;
            const isDone = step.done;
            
            let bgClass = "";
            if (isDone) bgClass = "list-group-item-success";
            else if (isNext) bgClass = "list-group-item-warning";

            return (
              <div
                key={step.key}
                className={"list-group-item d-flex align-items-center py-2 " + bgClass}
              >
                <div
                  className={"rounded-circle d-flex align-items-center justify-content-center me-3 " +
                    (isDone ? "bg-success text-white" : isNext ? "bg-warning text-dark" : "bg-light text-muted border")}
                  style={{ width: "28px", height: "28px", fontSize: "12px", fontWeight: "bold" }}
                >
                  {isDone ? "\u2713" : (idx + 1)}
                </div>
                <div className="flex-grow-1">
                  <span className={isDone ? "text-success" : isNext ? "fw-bold" : "text-muted"}>
                    {step.label}
                  </span>
                </div>
                {step.info && isDone && (
                  <span className="badge bg-primary ms-2">{step.info}</span>
                )}
                {isNext && <span className="badge bg-warning text-dark ms-2">NEXT</span>}
              </div>
            );
          })}
        </div>

        {nextIdx === -1 && (
          <div className="p-3 border-top bg-success text-white text-center">
            <strong>Workflow Complete!</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartWorkflow;
