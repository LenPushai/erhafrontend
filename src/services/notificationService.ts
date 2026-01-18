const EMAIL_SERVER_URL = 'http://localhost:3001';

export interface NotificationData {
  client_name?: string;
  rfq_number?: string;
  description?: string;
  priority?: string;
  required_date?: string;
  quote_number?: string;
  total_value?: string;
  quoter_name?: string;
  quoter_email?: string;
  po_number?: string;
  job_number?: string;
  due_date?: string;
  invoice_number?: string;
  invoice_value?: string;
  contact_person?: string;
  contact_email?: string;
  manager_name?: string;
  signing_url?: string;
  days_pending?: string;
  expiry_date?: string;
}

export type NotificationTemplate =
  // RFQ Workflow
  | 'rfq_received'
  | 'estimator_assigned'
  | 'quote_ready'
  | 'order_won'
  | 'job_created'
  | 'invoice_created'
  // E-Signature Workflow
  | 'docusign_sent'
  | 'docusign_manager_pending'
  | 'docusign_manager_signed'
  | 'docusign_client_pending'
  | 'docusign_completed'
  | 'docusign_reminder'
  | 'docusign_expired';

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
      console.log(`📧 Email sent: ${template}`);
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

// ============================================================================
// RFQ WORKFLOW NOTIFICATIONS
// ============================================================================

export const notifyRfqReceived = async (email: string, data: NotificationData) =>
  sendNotification(email, 'rfq_received', data);

export const notifyEstimatorAssigned = async (email: string, data: NotificationData) =>
  sendNotification(email, 'estimator_assigned', data);

export const notifyQuoteReady = async (email: string, data: NotificationData) =>
  sendNotification(email, 'quote_ready', data);

export const notifyOrderWon = async (emails: string | string[], data: NotificationData) =>
  sendNotification(emails, 'order_won', data);

export const notifyJobCreated = async (email: string, data: NotificationData) =>
  sendNotification(email, 'job_created', data);

export const notifyInvoiceCreated = async (email: string, data: NotificationData) =>
  sendNotification(email, 'invoice_created', data);

// ============================================================================
// E-SIGNATURE WORKFLOW NOTIFICATIONS
// ============================================================================

export const notifyDocuSignSent = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_sent', data);

export const notifyManagerPendingSignature = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_manager_pending', data);

export const notifyManagerSigned = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_manager_signed', data);

export const notifyClientPendingSignature = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_client_pending', data);

export const notifyDocuSignCompleted = async (emails: string | string[], data: NotificationData) =>
  sendNotification(emails, 'docusign_completed', data);

export const notifyDocuSignReminder = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_reminder', data);

export const notifyDocuSignExpired = async (email: string, data: NotificationData) =>
  sendNotification(email, 'docusign_expired', data);

// ============================================================================
// TEST FUNCTION
// ============================================================================

export const sendTestNotification = async (email: string) =>
  sendNotification(email, 'order_won', {
    client_name: 'Test Company',
    total_value: '150,000.00',
    po_number: 'PO-TEST-001',
    description: 'Test notification from ERHA OMS'
  });