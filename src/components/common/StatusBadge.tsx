import React from 'react';

// Centralized status type definitions
export type RFQStatus = 'PENDING' | 'IN_PROGRESS' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';
export type QuoteStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'NEEDS_REVISION' | 'SENT_TO_CLIENT' | 'ACCEPTED' | 'REJECTED';
export type JobStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' |
    'NEW' | 'ACTIVE' | 'PENDING' | 'INVOICED' | 'DELIVERED' | 'COMPLETE' |
    'In Progress'; // Support both formats from backend

type StatusType = RFQStatus | QuoteStatus | JobStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

// Centralized status configuration
const statusConfig: Record<StatusType, {
  label: string;
  colorClass: string;
  icon: string;
}> = {
  // RFQ Statuses
  'PENDING': {
    label: 'Pending',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳'
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '⚙️'
  },
  'QUOTED': {
    label: 'Quoted',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '📋'
  },
  'ACCEPTED': {
    label: 'Accepted',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅'
  },
  'REJECTED': {
    label: 'Rejected',
    colorClass: 'bg-red-100 text-red-800 border-red-300',
    icon: '❌'
  },

  // Quote Statuses
  'DRAFT': {
    label: 'Draft',
    colorClass: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '📝'
  },
  'PENDING_APPROVAL': {
    label: 'Pending Approval',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '🔐'
  },
  'APPROVED': {
    label: 'Approved',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅'
  },
  'NEEDS_REVISION': {
    label: 'Needs Revision',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '🔄'
  },
  'SENT_TO_CLIENT': {
    label: 'Sent to Client',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '📤'
  },

  // Job Statuses
  'NOT_STARTED': {
    label: 'Not Started',
    colorClass: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '⏸️'
  },
  'NEW': {
    label: 'New',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '✨'
  },
  'PENDING': {
    label: 'Pending',
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳'
  },
  'ACTIVE': {
    label: 'Active',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '⚙️'
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '⚙️'
  },
  'In Progress': {
    label: 'In Progress',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '⚙️'
  },
  'ON_HOLD': {
    label: 'On Hold',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '⏸️'
  },
  'COMPLETED': {
    label: 'Completed',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅'
  },
  'COMPLETE': {
    label: 'Complete',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅'
  },
  'DELIVERED': {
    label: 'Delivered',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '📦'
  },
  'INVOICED': {
    label: 'Invoiced',
    colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: '💰'
  },
  'CANCELLED': {
    label: 'Cancelled',
    colorClass: 'bg-red-100 text-red-800 border-red-300',
    icon: '🚫'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];

  if (!config) {
    // Fallback for unknown status
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-300 ${className}`}>
        <span className="mr-1">❓</span>
          {status}
      </span>
    );
  }

  return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.colorClass} ${className}`}>
      <span className="mr-1">{config.icon}</span>
        {config.label}
    </span>
  );
};

// Export helper function to get status label
export const getStatusLabel = (status: StatusType): string => {
  return statusConfig[status]?.label || status;
};

// Export helper function to get all statuses for a module
export const getRFQStatuses = (): RFQStatus[] => {
  return ['PENDING', 'IN_PROGRESS', 'QUOTED', 'ACCEPTED', 'REJECTED'];
};

export const getQuoteStatuses = (): QuoteStatus[] => {
  return ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'NEEDS_REVISION', 'SENT_TO_CLIENT', 'ACCEPTED', 'REJECTED'];
};

export const getJobStatuses = (): JobStatus[] => {
  return ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
};

// Status mapper to normalize backend statuses to component statuses
export const normalizeJobStatus = (backendStatus: string): JobStatus => {
  const statusMap: Record<string, JobStatus> = {
    'NEW': 'NEW',
    'PENDING': 'PENDING',
    'ACTIVE': 'ACTIVE',
    'IN_PROGRESS': 'IN_PROGRESS',
    'In Progress': 'IN_PROGRESS',
    'in progress': 'IN_PROGRESS',
    'ON_HOLD': 'ON_HOLD',
    'COMPLETED': 'COMPLETED',
    'COMPLETE': 'COMPLETE',
    'DELIVERED': 'DELIVERED',
    'INVOICED': 'INVOICED',
    'CANCELLED': 'CANCELLED',
    'NOT_STARTED': 'NOT_STARTED'
  };

  return statusMap[backendStatus] || backendStatus as JobStatus;
};

export default StatusBadge;