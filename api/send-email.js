// api/send-email.js - Vercel Serverless Function
const RESEND_API_KEY = 're_Q3RKYakG_9yGoARH977FNLhwF2rG9Y8vk';
const FROM_EMAIL = 'ERHA Operations <onboarding@resend.dev>';

const templates = {
  rfq_received: (data) => ({
    subject: `📋 New RFQ Received - ${data.client_name || 'Client'}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New RFQ Received</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>A new Request for Quotation has been received:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.description || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.priority || 'Normal'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Required Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.required_date || 'TBD'}</td></tr>
        </table>
      </div>
      <div style="background: #1e40af; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  estimator_assigned: (data) => ({
    subject: `🔧 You've Been Assigned - ${data.client_name || 'RFQ'}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Assignment</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>Hi ${data.quoter_name || 'Estimator'},</p>
        <p>You have been assigned to quote the following RFQ:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.description || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.priority || 'Normal'}</td></tr>
        </table>
      </div>
      <div style="background: #7c3aed; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  quote_ready: (data) => ({
    subject: `✅ Quote Ready for Review - ${data.quote_number || ''}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #059669; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Quote Ready</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>A quote is ready for your review:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Quote #:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.quote_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Value:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">R ${data.total_value || '0.00'}</td></tr>
        </table>
      </div>
      <div style="background: #059669; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  order_won: (data) => ({
    subject: `🎉 ORDER WON! - ${data.client_name || 'Client'}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🎉 ORDER WON! 🎉</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>Great news! We've won an order:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>PO Number:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.po_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Value:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">R ${data.total_value || '0.00'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.description || 'N/A'}</td></tr>
        </table>
      </div>
      <div style="background: #dc2626; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  job_created: (data) => ({
    subject: `🔨 New Job Created - ${data.job_number || ''}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ea580c; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Job Created</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>A new job has been created:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Job #:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.job_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.due_date || 'TBD'}</td></tr>
        </table>
      </div>
      <div style="background: #ea580c; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  invoice_created: (data) => ({
    subject: `💰 Invoice Created - ${data.invoice_number || ''}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Invoice Created</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Invoice #:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.invoice_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">R ${data.total_value || '0.00'}</td></tr>
        </table>
      </div>
      <div style="background: #f59e0b; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  docusign_sent: (data) => ({
    subject: `📝 Quote Sent for Signature - ${data.quote_number || ''}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Quote Sent for Signature</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>A quote has been sent to the client for signature:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Quote #:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.quote_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Signer:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.signer_name || 'N/A'}</td></tr>
        </table>
        ${data.sign_url ? `<div style="margin-top: 20px; text-align: center;"><a href="${data.sign_url}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Signing Link</a></div>` : ''}
      </div>
      <div style="background: #2563eb; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  }),
  docusign_completed: (data) => ({
    subject: `✅ Quote Signed! - ${data.quote_number || ''}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">✅ Quote Signed!</h1>
      </div>
      <div style="padding: 20px; background: #f8fafc;">
        <p>Great news! The client has signed the quote:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Quote #:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.quote_number || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.client_name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Signed By:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.signer_name || 'N/A'}</td></tr>
        </table>
        <p style="margin-top: 20px; text-align: center; font-weight: bold; color: #16a34a;">Ready to create Job Card!</p>
      </div>
      <div style="background: #16a34a; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">ERHA Fabrication & Construction | Powered by PUSH AI Foundation</p>
      </div>
    </div>`
  })
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, template, data } = req.body;

    if (!to || !template) {
      return res.status(400).json({ error: 'Missing required fields: to, template' });
    }

    const templateFn = templates[template];
    if (!templateFn) {
      return res.status(400).json({ error: `Unknown template: ${template}` });
    }

    const { subject, html } = templateFn(data || {});

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`Email sent: ${template} to ${to}`);
      return res.status(200).json({ success: true, id: result.id, template });
    } else {
      console.error(`Email failed: ${result.message}`);
      return res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
