const EMAIL_SERVER_URL = 'http://localhost:3001';

export interface NotificationData {
  client_name?: string;
  description?: string;
  priority?: string;
  required_date?: string;
  quote_number?: string;
  total_value?: string;
  quoter_name?: string;
  po_number?: string;
  job_number?: string;
  due_date?: string;
  invoice_number?: string;
}

export type NotificationTemplate = 
  | 'rfq_received'
  | 'estimator_assigned'
  | 'quote_ready'
  | 'order_won'
  | 'job_created'
  | 'invoice_created';

export const sendNotification = async (
  to: string | string[],
  template: NotificationTemplate,
  data: NotificationData
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const response = await fetch(`${EMAIL_SERVER_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, template, data }),
    });
    const result = await response.json();
    if (result.success) {
      console.log('Notification sent:', template);
      return { success: true, id: result.id };
    } else {
      console.error('Notification failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const notifyRfqReceived = async (managerEmail: string, data: NotificationData) => 
  sendNotification(managerEmail, 'rfq_received', data);

export const notifyEstimatorAssigned = async (quoterEmail: string, data: NotificationData) => 
  sendNotification(quoterEmail, 'estimator_assigned', data);

export const notifyQuoteReady = async (managerEmail: string, data: NotificationData) => 
  sendNotification(managerEmail, 'quote_ready', data);

export const notifyOrderWon = async (teamEmails: string[], data: NotificationData) => 
  sendNotification(teamEmails, 'order_won', data);

export const notifyJobCreated = async (workshopEmail: string, data: NotificationData) => 
  sendNotification(workshopEmail, 'job_created', data);

export const notifyInvoiceCreated = async (accountsEmail: string, data: NotificationData) => 
  sendNotification(accountsEmail, 'invoice_created', data);

export const sendTestNotification = async (email: string) => 
  sendNotification(email, 'order_won', {
    client_name: 'Test Company',
    total_value: '150,000.00',
    po_number: 'PO-TEST-001',
    description: 'Test notification from ERHA OMS'
  });
