import { supabase } from '../lib/supabase';

const RESEND_API_KEY = 're_Q3RKYakG_9yGoARH977FNLhwF2rG9Y8vk';
const FROM_EMAIL = 'ERHA OPS <noreply@erha.co.za>';

// Email templates for each lifecycle stage
const EMAIL_TEMPLATES = {
  rfq_received: {
    subject: 'New RFQ Assigned: {rfq_number}',
    body: `
      <h2>New RFQ Assigned to You</h2>
      <p>A new Request for Quotation has been assigned to you.</p>
      <table>
        <tr><td><strong>RFQ Number:</strong></td><td>{rfq_number}</td></tr>
        <tr><td><strong>Client:</strong></td><td>{client_name}</td></tr>
        <tr><td><strong>Description:</strong></td><td>{description}</td></tr>
        <tr><td><strong>Priority:</strong></td><td>{priority}</td></tr>
        <tr><td><strong>Required By:</strong></td><td>{required_by}</td></tr>
      </table>
      <p>Please log in to ERHA OPS to review and prepare a quote.</p>
    `
  },
  quote_ready: {
    subject: 'Quote Ready for Review: {rfq_number}',
    body: `
      <h2>Quote Ready for Approval</h2>
      <p>A quote has been prepared and is ready for review.</p>
      <table>
        <tr><td><strong>RFQ Number:</strong></td><td>{rfq_number}</td></tr>
        <tr><td><strong>Quote Number:</strong></td><td>{quote_no}</td></tr>
        <tr><td><strong>Client:</strong></td><td>{client_name}</td></tr>
        <tr><td><strong>Quote Value:</strong></td><td>R {quote_value}</td></tr>
      </table>
      <p>Please review and approve the quote in ERHA OPS.</p>
    `
  },
  quote_sent: {
    subject: 'Your Quote from ERHA: {quote_no}',
    body: `
      <h2>Your Quote is Ready</h2>
      <p>Dear {contact_person},</p>
      <p>Please find your quote attached. Click the link below to review and sign:</p>
      <p><a href="{signature_link}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Review & Sign Quote</a></p>
      <table>
        <tr><td><strong>Quote Number:</strong></td><td>{quote_no}</td></tr>
        <tr><td><strong>Value (excl VAT):</strong></td><td>R {quote_value}</td></tr>
        <tr><td><strong>Valid Until:</strong></td><td>{valid_until}</td></tr>
      </table>
      <p>Thank you for your business!</p>
      <p>ERHA Fabrication & Construction</p>
    `
  },
  order_won: {
    subject: '🎉 Order Won: {rfq_number} - {client_name}',
    body: `
      <h2>🎉 Congratulations! Order Confirmed</h2>
      <p>Great news! The client has confirmed their order.</p>
      <table>
        <tr><td><strong>RFQ Number:</strong></td><td>{rfq_number}</td></tr>
        <tr><td><strong>Client:</strong></td><td>{client_name}</td></tr>
        <tr><td><strong>PO Number:</strong></td><td>{po_number}</td></tr>
        <tr><td><strong>Order Value:</strong></td><td>R {quote_value}</td></tr>
      </table>
      <p>A Job Card has been automatically created: <strong>{job_number}</strong></p>
    `
  },
  job_created: {
    subject: 'New Job Created: {job_number}',
    body: `
      <h2>New Job Card Created</h2>
      <p>A new job has been created and is ready for the workshop.</p>
      <table>
        <tr><td><strong>Job Number:</strong></td><td>{job_number}</td></tr>
        <tr><td><strong>Client:</strong></td><td>{client_name}</td></tr>
        <tr><td><strong>Description:</strong></td><td>{description}</td></tr>
        <tr><td><strong>Priority:</strong></td><td>{priority}</td></tr>
        <tr><td><strong>Due Date:</strong></td><td>{due_date}</td></tr>
      </table>
      <p>Please begin work as scheduled.</p>
    `
  },
  emergency_job: {
    subject: '🚨 EMERGENCY JOB: {job_number} - {severity}',
    body: `
      <h2 style="color:#dc2626;">🚨 EMERGENCY JOB ALERT</h2>
      <p><strong>IMMEDIATE ATTENTION REQUIRED</strong></p>
      <table>
        <tr><td><strong>Job Number:</strong></td><td>{job_number}</td></tr>
        <tr><td><strong>Client:</strong></td><td>{client_name}</td></tr>
        <tr><td><strong>Contact:</strong></td><td>{contact_person} - {contact_phone}</td></tr>
        <tr><td><strong>Location:</strong></td><td>{site_location}</td></tr>
        <tr><td><strong>Severity:</strong></td><td style="color:#dc2626;font-weight:bold;">{severity}</td></tr>
        <tr><td><strong>Production Stopped:</strong></td><td>{production_stopped}</td></tr>
        <tr><td><strong>Safety Risk:</strong></td><td>{safety_risk}</td></tr>
      </table>
      <p><strong>Description:</strong> {description}</p>
      <p>Please respond immediately!</p>
    `
  },
  invoice_sent: {
    subject: 'Invoice from ERHA: {invoice_number}',
    body: `
      <h2>Invoice</h2>
      <p>Dear {contact_person},</p>
      <p>Please find your invoice attached.</p>
      <table>
        <tr><td><strong>Invoice Number:</strong></td><td>{invoice_number}</td></tr>
        <tr><td><strong>Invoice Date:</strong></td><td>{invoice_date}</td></tr>
        <tr><td><strong>Amount Due:</strong></td><td>R {invoice_value}</td></tr>
        <tr><td><strong>Job Reference:</strong></td><td>{job_number}</td></tr>
      </table>
      <p>Thank you for your business!</p>
      <p>ERHA Fabrication & Construction</p>
    `
  }
};

class EmailService {
  
  // Send email via Resend
  async sendEmail(to: string, templateKey: string, data: Record<string, any>): Promise<boolean> {
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      console.error('Unknown email template:', templateKey);
      return false;
    }
    
    // Replace placeholders
    let subject = template.subject;
    let body = template.body;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(placeholder, value?.toString() || '');
      body = body.replace(placeholder, value?.toString() || '');
    });
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${body}
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                This email was sent from ERHA Operations Portal.<br>
                ERHA Fabrication & Construction | 016 933 9882 | pa@erha.co.za
              </p>
            </div>
          `,
        }),
      });
      
      const result = await response.json();
      
      // Log to database
      await this.logEmail(templateKey, to, subject, result.id, data.rfq_id, data.job_id);
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
  
  // Log email to database
  async logEmail(type: string, to: string, subject: string, resendId: string, rfqId?: string, jobId?: string) {
    await supabase.from('email_log').insert({
      email_type: type,
      recipient_email: to,
      subject: subject,
      resend_id: resendId,
      rfq_id: rfqId,
      job_id: jobId,
    });
  }
  
  // Trigger email based on RFQ lifecycle change
  async onRFQUpdate(rfq: any, previousStatus?: string) {
    const workshopEmail = 'workshop@erha.co.za';
    const adminEmail = 'pa@erha.co.za';
    
    // Estimator assigned
    if (rfq.assigned_quoter && !previousStatus) {
      // In real app, look up estimator email
      await this.sendEmail(adminEmail, 'rfq_received', {
        rfq_number: rfq.rfq_number,
        client_name: rfq.client_name,
        description: rfq.description,
        priority: rfq.priority,
        required_by: rfq.required_by,
        rfq_id: rfq.id,
      });
    }
    
    // Quote created
    if (rfq.quote_no && rfq.quote_date) {
      await this.sendEmail(adminEmail, 'quote_ready', {
        rfq_number: rfq.rfq_number,
        quote_no: rfq.quote_no,
        client_name: rfq.client_name,
        quote_value: rfq.quote_value,
        rfq_id: rfq.id,
      });
    }
    
    // Order received - this triggers job creation too
    if (rfq.order_no && rfq.order_date && rfq.job_card_no) {
      await this.sendEmail(workshopEmail, 'order_won', {
        rfq_number: rfq.rfq_number,
        client_name: rfq.client_name,
        po_number: rfq.client_po_number,
        quote_value: rfq.quote_value,
        job_number: rfq.job_card_no,
        rfq_id: rfq.id,
      });
    }
    
    // Invoice sent
    if (rfq.invoice_number && rfq.invoice_date && rfq.contact_email) {
      await this.sendEmail(rfq.contact_email, 'invoice_sent', {
        contact_person: rfq.contact_person,
        invoice_number: rfq.invoice_number,
        invoice_date: rfq.invoice_date,
        invoice_value: rfq.invoice_value,
        job_number: rfq.job_card_no,
        rfq_id: rfq.id,
      });
    }
  }
  
  // Send emergency job alert
  async sendEmergencyAlert(job: any) {
    const workshopEmail = 'workshop@erha.co.za';
    const adminEmail = 'pa@erha.co.za';
    
    const emailData = {
      job_number: job.job_number,
      client_name: job.client_name,
      contact_person: job.contact_person,
      contact_phone: job.contact_phone,
      site_location: job.site_location || 'Not specified',
      severity: job.severity_level,
      production_stopped: job.production_stopped ? 'YES' : 'No',
      safety_risk: job.safety_risk ? 'YES' : 'No',
      description: job.description,
      job_id: job.id,
    };
    
    // Send to workshop and admin
    await this.sendEmail(workshopEmail, 'emergency_job', emailData);
    await this.sendEmail(adminEmail, 'emergency_job', emailData);
  }
}

export const emailService = new EmailService();
export default emailService;