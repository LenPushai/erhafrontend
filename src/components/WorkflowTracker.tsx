import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface WorkflowTrackerProps {
  rfq: {
    status?: string;
    assigned_quoter_id?: string;
    quote_number?: string;
    quote_status?: string;
    order_number?: string;
    job_id?: string;
    invoice_number?: string;
  } | null;
}

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ rfq }) => {
  const stages = [
    { step: 1, label: 'RFQ Received', description: 'Enquiry logged', status: 'complete' as const, color: 'emerald' },
    { step: 2, label: 'Estimator Assigned', description: 'Quoter allocated', status: rfq?.assigned_quoter_id ? 'complete' as const : 'current' as const, color: 'blue' },
    { step: 3, label: 'Quote Created', description: 'Pricing prepared', status: rfq?.quote_number ? 'complete' as const : (rfq?.assigned_quoter_id ? 'current' as const : 'pending' as const), color: 'violet' },
    { step: 4, label: 'Quote Approved', description: 'Internal sign-off', status: ['QUOTED', 'ACCEPTED', 'WON'].includes(rfq?.status || '') || rfq?.order_number ? 'complete' as const : (rfq?.quote_number ? 'current' as const : 'pending' as const), color: 'amber' },
    { step: 5, label: 'Sent to Client', description: 'Quote delivered', status: ['QUOTED', 'ACCEPTED', 'WON'].includes(rfq?.status || '') || rfq?.order_number ? 'complete' as const : 'pending' as const, color: 'cyan' },
    { step: 6, label: 'Order Received', description: 'Client PO confirmed', status: rfq?.order_number ? 'complete' as const : (rfq?.status === 'ACCEPTED' ? 'current' as const : 'pending' as const), color: 'orange' },
    { step: 7, label: 'Job Created', description: 'Work order generated', status: rfq?.job_id ? 'complete' as const : (rfq?.order_number ? 'current' as const : 'pending' as const), color: 'indigo' },
    { step: 8, label: 'Invoiced', description: 'Payment requested', status: rfq?.invoice_number ? 'complete' as const : (rfq?.job_id ? 'current' as const : 'pending' as const), color: 'green' },
  ];
  
  const completedCount = stages.filter(s => s.status === 'complete').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const colorMap: Record<string, string> = {
    emerald: '#10b981', blue: '#3b82f6', violet: '#8b5cf6', amber: '#f59e0b',
    cyan: '#06b6d4', orange: '#f97316', indigo: '#6366f1', green: '#22c55e',
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white font-semibold flex items-center gap-2">
        <Clock size={16} />
        Workflow Progress
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-bold text-gray-700">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: 'linear-gradient(to right, #10b981, #3b82f6, #8b5cf6)' }} />
          </div>
        </div>
        <div className="space-y-0">
          {stages.map((stage, index) => {
            const isComplete = stage.status === 'complete';
            const isCurrent = stage.status === 'current';
            const isPending = stage.status === 'pending';
            return (
              <div key={stage.step} className="flex items-start gap-3 relative">
                {index < stages.length - 1 && (<div className="absolute left-4 top-8 w-0.5 h-6" style={{ backgroundColor: isComplete ? '#d1d5db' : '#f3f4f6' }} />)}
                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{ backgroundColor: isComplete ? colorMap[stage.color] : isCurrent ? '#fff' : '#f3f4f6', border: isCurrent ? `2px solid ${colorMap[stage.color]}` : 'none', boxShadow: isComplete ? '0 2px 4px rgba(0,0,0,0.1)' : isCurrent ? `0 0 0 4px ${colorMap[stage.color]}20` : 'none', color: isComplete ? '#fff' : isCurrent ? colorMap[stage.color] : '#9ca3af' }}>
                  {isComplete ? (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>) : (<span className="text-xs font-bold">{stage.step}</span>)}
                </div>
                <div className={`pb-6 ${isPending ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isComplete ? 'text-gray-900' : isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>{stage.label}</span>
                    {isCurrent && (<span className="px-1.5 py-0.5 text-xs font-semibold rounded" style={{ backgroundColor: `${colorMap[stage.color]}20`, color: colorMap[stage.color] }}>NOW</span>)}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowTracker;