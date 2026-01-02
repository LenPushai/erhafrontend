const API_URL = ((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/v1/rfqs') as string;

export interface NotificationResponse {
  success: boolean;
  message: string;
  notifiedAt?: string;
}

export const rfqNotificationService = {
  
  notifyExecutive: async (rfqId: number): Promise<NotificationResponse> => {
    const response = await fetch(`${API_URL}/${rfqId}/notify/executive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  notifyEstimator: async (rfqId: number): Promise<NotificationResponse> => {
    const response = await fetch(`${API_URL}/${rfqId}/notify/estimator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  requestGmApproval: async (rfqId: number): Promise<NotificationResponse> => {
    const response = await fetch(`${API_URL}/${rfqId}/notify/gm-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  sendToCustomer: async (rfqId: number): Promise<NotificationResponse> => {
    const response = await fetch(`${API_URL}/${rfqId}/notify/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  notifyWorkshop: async (rfqId: number): Promise<NotificationResponse> => {
    const response = await fetch(`${API_URL}/${rfqId}/notify/workshop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

export default rfqNotificationService;