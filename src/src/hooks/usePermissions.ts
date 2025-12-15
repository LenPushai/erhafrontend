// usePermissions.ts - Hook for role-based permission checks
import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string | string[]): boolean => {
    if (!user || !user.roles) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.roles.includes(r));
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isManager = (): boolean => {
    return hasRole('MANAGER');
  };

  const isEstimator = (): boolean => {
    return hasRole('ESTIMATOR');
  };

  const isUser = (): boolean => {
    return hasRole('USER');
  };

  // Permission checks
  const canCreateRFQ = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canEditRFQ = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canDeleteRFQ = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canViewRFQ = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER', 'ESTIMATOR', 'USER']);
  };

  const canCreateQuote = (): boolean => {
    return hasRole(['ADMIN', 'ESTIMATOR']);
  };

  const canEditQuote = (): boolean => {
    return hasRole(['ADMIN', 'ESTIMATOR']);
  };

  const canDeleteQuote = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canApproveQuote = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER']);
  };

  const canViewQuote = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER', 'ESTIMATOR', 'USER']);
  };

  const canCreateJob = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canEditJob = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canDeleteJob = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canUpdateJobStatus = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER', 'USER']);
  };

  const canViewJob = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER', 'ESTIMATOR', 'USER']);
  };

  const canCreateClient = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canEditClient = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canDeleteClient = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canViewClient = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER', 'ESTIMATOR', 'USER']);
  };

  const canCreateWorker = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canEditWorker = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canDeleteWorker = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canViewWorker = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER']);
  };

  const canManageUsers = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canViewReports = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER']);
  };

  const canCreateEmergencyJob = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canAccessInventory = (): boolean => {
    return hasRole(['ADMIN', 'MANAGER']);
  };

  const canAccessSettings = (): boolean => {
    return hasRole(['ADMIN']);
  };

  return {
    hasRole,
    isAdmin,
    isManager,
    isEstimator,
    isUser,
    canCreateRFQ,
    canEditRFQ,
    canDeleteRFQ,
    canViewRFQ,
    canCreateQuote,
    canEditQuote,
    canDeleteQuote,
    canApproveQuote,
    canViewQuote,
    canCreateJob,
    canEditJob,
    canDeleteJob,
    canUpdateJobStatus,
    canViewJob,
    canCreateClient,
    canEditClient,
    canDeleteClient,
    canViewClient,
    canCreateWorker,
    canEditWorker,
    canDeleteWorker,
    canViewWorker,
    canManageUsers,
    canViewReports,
    canCreateEmergencyJob,
    canAccessInventory,
    canAccessSettings
  };
};
