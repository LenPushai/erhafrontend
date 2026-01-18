// Workflow Progress Calculator
// Calculates progress based on actual RFQ data

export interface WorkflowStep {
  step: number;
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export function calculateWorkflowProgress(rfq: any): { steps: WorkflowStep[]; percentage: number } {
  const steps: WorkflowStep[] = [
    {
      step: 1,
      name: 'RFQ Received',
      description: 'Enquiry logged',
      completed: !!rfq?.created_at,
      current: false,
    },
    {
      step: 2,
      name: 'Estimator Assigned',
      description: 'Quoter allocated',
      completed: !!rfq?.assigned_quoter,
      current: false,
    },
    {
      step: 3,
      name: 'Quote Created',
      description: 'Pricing prepared',
      completed: !!(rfq?.quote_no && rfq?.quote_date),
      current: false,
    },
    {
      step: 4,
      name: 'Quote Approved',
      description: 'Internal sign-off',
      completed: rfq?.status === 'APPROVED' || rfq?.status === 'SENT' || rfq?.status === 'ACCEPTED' || rfq?.status === 'WON',
      current: false,
    },
    {
      step: 5,
      name: 'Sent to Client',
      description: 'Quote delivered',
      completed: rfq?.status === 'SENT' || rfq?.status === 'ACCEPTED' || rfq?.status === 'WON',
      current: false,
    },
    {
      step: 6,
      name: 'Order Received',
      description: 'Client PO confirmed',
      completed: !!(rfq?.order_no && rfq?.order_date),
      current: false,
    },
    {
      step: 7,
      name: 'Job Created',
      description: 'Work order generated',
      completed: !!rfq?.job_id || !!rfq?.job_card_no,
      current: false,
    },
    {
      step: 8,
      name: 'Invoiced',
      description: 'Payment requested',
      completed: !!(rfq?.invoice_number && rfq?.invoice_date),
      current: false,
    },
  ];
  
  // Find current step (first incomplete after completed steps)
  let foundCurrent = false;
  for (let i = 0; i < steps.length; i++) {
    if (!steps[i].completed && !foundCurrent) {
      steps[i].current = true;
      foundCurrent = true;
    }
  }
  
  // Calculate percentage
  const completedCount = steps.filter(s => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);
  
  return { steps, percentage };
}

export default calculateWorkflowProgress;