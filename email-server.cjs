const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

const RESEND_API_KEY = 're_Q3RKYakG_9yGoARH977FNLhwF2rG9Y8vk';
const FROM_EMAIL = 'ERHA Operations <onboarding@resend.dev>';

app.use(cors());
app.use(express.json());

const templates = {
  rfq_received: (data) => ({
    subject: `New RFQ Received - ${data.client_name || 'Client'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#1e3a5f;color:white;padding:20px;text-align:center;"><h1>ERHA Operations</h1><p>New RFQ Notification</p></div><div style="padding:30px;background:#f8f9fa;"><h2 style="color:#1e3a5f;">New RFQ Received</h2><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Description:</strong> ${data.description || 'N/A'}</p><p><strong>Priority:</strong> ${data.priority || 'NORMAL'}</p></div><div style="background:#1e3a5f;color:white;padding:15px;text-align:center;font-size:12px;"><p>ERHA Fabrication | PUSH AI Foundation</p></div></div>`
  }),
  estimator_assigned: (data) => ({
    subject: `You've Been Assigned RFQ - ${data.client_name || 'Client'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2563eb;color:white;padding:20px;text-align:center;"><h1>ERHA Operations</h1><p>Task Assignment</p></div><div style="padding:30px;background:#f8f9fa;"><h2 style="color:#2563eb;">You've Been Assigned an RFQ</h2><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Description:</strong> ${data.description || 'N/A'}</p><p><strong>Priority:</strong> ${data.priority || 'NORMAL'}</p></div><div style="background:#2563eb;color:white;padding:15px;text-align:center;font-size:12px;"><p>ERHA Fabrication | PUSH AI Foundation</p></div></div>`
  }),
  quote_ready: (data) => ({
    subject: `Quote Ready for Review - ${data.quote_number || 'Quote'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#7c3aed;color:white;padding:20px;text-align:center;"><h1>ERHA Operations</h1><p>Quote Approval Request</p></div><div style="padding:30px;background:#f8f9fa;"><h2 style="color:#7c3aed;">Quote Ready for Approval</h2><p><strong>Quote #:</strong> ${data.quote_number || 'N/A'}</p><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Value:</strong> R ${data.total_value || '0.00'}</p></div><div style="background:#7c3aed;color:white;padding:15px;text-align:center;font-size:12px;"><p>ERHA Fabrication | PUSH AI Foundation</p></div></div>`
  }),
  order_won: (data) => ({
    subject: `ORDER WON! ${data.client_name || 'Client'} - R${data.total_value || '0'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:30px;text-align:center;"><h1 style="font-size:36px;">ORDER WON!</h1><p style="font-size:18px;">Congratulations Team!</p></div><div style="padding:30px;background:#f8f9fa;"><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Order Value:</strong> <span style="font-size:24px;color:#10b981;">R ${data.total_value || '0.00'}</span></p><p><strong>PO Number:</strong> ${data.po_number || 'Pending'}</p><p><strong>Description:</strong> ${data.description || 'N/A'}</p></div><div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:15px;text-align:center;font-size:12px;"><p>Glory to God! - Proverbs 16:3</p></div></div>`
  }),
  job_created: (data) => ({
    subject: `New Job Created - ${data.job_number || 'Job'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#6366f1;color:white;padding:20px;text-align:center;"><h1>ERHA Operations</h1><p>New Job Alert</p></div><div style="padding:30px;background:#f8f9fa;"><h2 style="color:#6366f1;">Job Card Created</h2><p><strong>Job #:</strong> ${data.job_number || 'N/A'}</p><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Description:</strong> ${data.description || 'N/A'}</p></div><div style="background:#6366f1;color:white;padding:15px;text-align:center;font-size:12px;"><p>ERHA Fabrication | PUSH AI Foundation</p></div></div>`
  }),
  invoice_created: (data) => ({
    subject: `Invoice Created - ${data.invoice_number || 'Invoice'}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#f59e0b;color:white;padding:20px;text-align:center;"><h1>ERHA Operations</h1><p>Invoice Notification</p></div><div style="padding:30px;background:#f8f9fa;"><h2 style="color:#f59e0b;">Invoice Created</h2><p><strong>Invoice #:</strong> ${data.invoice_number || 'N/A'}</p><p><strong>Client:</strong> ${data.client_name || 'N/A'}</p><p><strong>Amount:</strong> R ${data.total_value || '0.00'}</p></div><div style="background:#f59e0b;color:white;padding:15px;text-align:center;font-size:12px;"><p>ERHA Fabrication | PUSH AI Foundation</p></div></div>`
  })
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ERHA Email Server' });
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, template, data } = req.body;
    if (!to || !template) {
      return res.status(400).json({ error: 'Missing: to, template' });
    }
    const templateFn = templates[template];
    if (!templateFn) {
      return res.status(400).json({ error: 'Unknown template: ' + template });
    }
    const { subject, html } = templateFn(data || {});
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
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
      console.log('Email sent: ' + template + ' to ' + to);
      res.json({ success: true, id: result.id, template });
    } else {
      console.error('Email failed: ' + result.message);
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  ERHA Email Server Running');
  console.log('  http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
});
