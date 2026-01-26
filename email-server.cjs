const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend('re_Q3RKYakG_9yGoARH977FNLhwF2rG9Y8vk');

// Email templates with clickable signature buttons
const templates = {
  // STAGE 1: Manager Approval Request (Internal)
  docusign_manager_pending: (data) => ({
    subject: `?? Approval Required: Quote ${data.quote_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">?? INTERNAL APPROVAL REQUIRED</h1>
        </div>
        <div style="background: #fffbeb; padding: 30px; border: 2px solid #f59e0b; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #92400e;">Dear ${data.manager_name || 'Manager'},</p>
          <p style="color: #78350f;">A quote requires your approval before being sent to the client.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Quote Number:</td><td style="padding: 8px 0; font-weight: bold;">${data.quote_number}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Client:</td><td style="padding: 8px 0; font-weight: bold;">${data.client_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Value (excl VAT):</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">R ${data.total_value}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.signature_url}" 
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ?? REVIEW & APPROVE QUOTE
            </a>
          </div>
          <p style="color: #78350f; font-size: 14px;">Once approved, the quote will be sent to the client for their signature.</p>
          <hr style="border: none; border-top: 1px solid #fcd34d; margin: 20px 0;">
          <p style="color: #92400e; font-size: 12px; text-align: center;">ERHA Fabrication & Construction (Pty) Ltd</p>
        </div>
      </body>
      </html>
    `
  }),

  // STAGE 2: Client Signature Request (External)
  docusign_client_pending: (data) => ({
    subject: `?? Quote Ready for Signature: ${data.quote_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">?? QUOTE READY FOR SIGNATURE</h1>
        </div>
        <div style="background: #eff6ff; padding: 30px; border: 2px solid #2563eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #1e40af;">Dear ${data.client_name},</p>
          <p style="color: #1e3a8a;">Your quote from ERHA Fabrication & Construction is ready for review and signature.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Quote Number:</td><td style="padding: 8px 0; font-weight: bold;">${data.quote_number}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Total Value:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">R ${data.total_value}</td></tr>
            </table>
          </div>
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #166534; font-weight: bold;">? Approved by ERHA Management</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.signature_url}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ?? SIGN & ACCEPT QUOTE
            </a>
          </div>
          <p style="color: #1e3a8a; font-size: 14px;">Click the button above to review and sign the quote electronically.</p>
          <hr style="border: none; border-top: 1px solid #93c5fd; margin: 20px 0;">
          <p style="color: #1e40af; font-size: 12px; text-align: center;">ERHA Fabrication & Construction (Pty) Ltd</p>
        </div>
      </body>
      </html>
    `
  }),

  // Manager signed notification
  docusign_manager_signed: (data) => ({
    subject: `? Quote ${data.quote_number} Approved - Ready for Client`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">? QUOTE APPROVED</h1>
        </div>
        <div style="background: #ecfdf5; padding: 30px; border: 2px solid #059669; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #065f46;">Quote ${data.quote_number} has been approved by ${data.manager_name || 'management'}.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Client:</td><td style="padding: 8px 0; font-weight: bold;">${data.client_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Value:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">R ${data.total_value}</td></tr>
            </table>
          </div>
          <p style="color: #065f46;">The quote will now be sent to the client for signature.</p>
        </div>
      </body>
      </html>
    `
  }),

  // Order Won notification
  order_won: (data) => ({
    subject: `?? ORDER WON: ${data.quote_number} - R ${data.total_value}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">?? ORDER WON!</h1>
        </div>
        <div style="background: #ecfdf5; padding: 30px; border: 2px solid #059669; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #065f46; text-align: center; font-weight: bold;">Congratulations! A new order has been confirmed!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Order Number:</td><td style="padding: 8px 0; font-weight: bold;">${data.order_number || data.quote_number}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Client:</td><td style="padding: 8px 0; font-weight: bold;">${data.client_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Value:</td><td style="padding: 8px 0; font-weight: bold; color: #059669; font-size: 20px;">R ${data.total_value}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Signed by:</td><td style="padding: 8px 0;">${data.signer_name || 'Client'}</td></tr>
            </table>
          </div>
          <p style="color: #065f46; text-align: center;">The job card can now be created for this order.</p>
        </div>
      </body>
      </html>
    `
  }),

  // DocuSign completed notification
  docusign_completed: (data) => ({
    subject: `? Quote ${data.quote_number} Signed by Client`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">? Signature Complete</h1>
        </div>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>Quote ${data.quote_number} has been signed by ${data.signer_name || 'the client'}.</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Value:</strong> R ${data.total_value}</p>
        </div>
      </body>
      </html>
    `
  }),

  // DocuSign sent notification
  docusign_sent: (data) => ({
    subject: `?? Quote ${data.quote_number} Sent for Signature`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #7c3aed; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">?? Quote Sent</h1>
        </div>
        <div style="background: #faf5ff; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>Quote ${data.quote_number} has been sent for signature.</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Contact:</strong> ${data.contact_email}</p>
          <p><strong>Value:</strong> R ${data.total_value}</p>
        </div>
      </body>
      </html>
    `
  }),

  // RFQ Received notification
  rfq_received: (data) => ({
    subject: `?? New RFQ Received: ${data.rfq_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0ea5e9; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">?? New RFQ</h1>
        </div>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>A new Request for Quote has been received.</p>
          <p><strong>RFQ Number:</strong> ${data.rfq_number}</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Description:</strong> ${data.description || 'N/A'}</p>
        </div>
      </body>
      </html>
    `
  }),

  // Estimator assigned notification
  estimator_assigned: (data) => ({
    subject: `?? RFQ ${data.rfq_number} Assigned to You`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #8b5cf6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">?? RFQ Assigned</h1>
        </div>
        <div style="background: #faf5ff; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>You have been assigned to prepare a quote for:</p>
          <p><strong>RFQ Number:</strong> ${data.rfq_number}</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Description:</strong> ${data.description || 'N/A'}</p>
        </div>
      </body>
      </html>
    `
  }),

  // Quote ready notification
  quote_ready: (data) => ({
    subject: `? Quote ${data.quote_number} Ready for Review`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #10b981; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">? Quote Ready</h1>
        </div>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>Quote ${data.quote_number} is ready for review.</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Value:</strong> R ${data.total_value}</p>
        </div>
      </body>
      </html>
    `
  }),

  // Invoice created notification
  invoice_created: (data) => ({
    subject: `?? Invoice Created: ${data.invoice_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">?? Invoice Created</h1>
        </div>
        <div style="background: #fffbeb; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>A new invoice has been created.</p>
          <p><strong>Invoice Number:</strong> ${data.invoice_number}</p>
          <p><strong>Client:</strong> ${data.client_name}</p>
          <p><strong>Amount:</strong> R ${data.total_value}</p>
        </div>
      </body>
      </html>
    `
  })
};

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, template, data } = req.body;
    
    console.log('Email request: ' + template + ' to ' + to);
    
    if (!templates[template]) {
      return res.status(400).json({ error: 'Unknown template: ' + template });
    }
    
    const emailContent = templates[template](data);
    
    const result = await resend.emails.send({
      from: 'ERHA Operations <onboarding@resend.dev>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log('Email sent: ' + result.id);
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', templates: Object.keys(templates) });
});

// Start server
const PORT = 3001;
const server = app.listen(PORT, function() {
  console.log('Email server running on port ' + PORT);
  console.log('Available templates: ' + Object.keys(templates).join(', '));
});

// Keep the server running
server.on('error', function(err) {
  console.error('Server error:', err);
});
