import React from 'react';

interface RFQ {
  id: number;
  jobNo: string;
  clientId: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  operatingEntity: string;
  description: string;
  requestDate: string;
  requiredDate: string;
  priority: string;
  status: string;
  estimatedValue: number;
  assignedQuoter: string | null;
  erhaDepartment: string | null;
  mediaReceived: string | null;
  actionsRequired: string | null;
  drawingNumber: string | null;
  quoteNumber: string | null;
  quoteStatus: string | null;
  quoteValueExclVat: number | null;
  quoteValueInclVat: number | null;
  quotePdfPath: string | null;
  docusignStatus: string | null;
  orderNumber: string | null;
  orderDate: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  paymentDate: string | null;
  jobId: number | null;
}

interface RFQDetailsCardProps {
  rfq: RFQ;
}

const RFQDetailsCard: React.FC<RFQDetailsCardProps> = ({ rfq }) => {
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-ZA');
  };

  const Section: React.FC<{ title: string; children: React.ReactNode; show?: boolean }> = ({ title, children, show = true }) => {
    if (!show) return null;
    return (
      <div style={{ marginBottom: '16px' }}>
        <h6 style={{ 
          color: '#0f766e', 
          fontSize: '11px', 
          fontWeight: 700, 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          paddingBottom: '4px',
          borderBottom: '2px solid #0f766e'
        }}>
          {title}
        </h6>
        {children}
      </div>
    );
  };

  const Field: React.FC<{ label: string; value: React.ReactNode; highlight?: boolean }> = ({ label, value, highlight }) => {
    if (!value) return null;
    return (
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#64748b', fontSize: '11px' }}>{label}</span>
        <div style={{ 
          color: highlight ? '#0f766e' : '#1e293b', 
          fontSize: '13px', 
          fontWeight: highlight ? 600 : 400 
        }}>
          {value}
        </div>
      </div>
    );
  };

  const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#6b7280' }) => (
    <span style={{
      background: color,
      color: '#fff',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 600,
      marginRight: '4px',
      marginBottom: '4px',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );

  const hasQuote = !!rfq.quoteNumber;
  const hasOrder = !!rfq.orderNumber;
  const hasInvoice = !!rfq.invoiceNumber;

  return (
    <div className="card" style={{ border: '1px solid #e2e8f0' }}>
      <div 
        className="card-header" 
        style={{ 
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          color: '#fff',
          padding: '10px 16px'
        }}
      >
        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Details</h5>
      </div>
      <div className="card-body" style={{ padding: '16px' }}>
        
        {/* Customer & Contact */}
        <Section title="Customer">
          <div className="row">
            <div className="col-6">
              <Field label="Contact Person" value={rfq.contactPerson} />
              <Field label="Email" value={rfq.contactEmail} />
              <Field label="Phone" value={rfq.contactPhone} />
            </div>
            <div className="col-6">
              <Field label="Operating Entity" value={rfq.operatingEntity} />
              <Field label="Status" value={<Badge color="#0ea5e9">{rfq.status}</Badge>} />
            </div>
          </div>
        </Section>

        {/* Assignment */}
        <Section title="Assignment">
          <div className="row">
            <div className="col-6">
              <Field label="Estimator" value={rfq.assignedQuoter} highlight />
              <Field label="Department" value={rfq.erhaDepartment} />
            </div>
            <div className="col-6">
              <Field label="Media Received" value={rfq.mediaReceived} />
              <Field label="Drawing #" value={rfq.drawingNumber} />
            </div>
          </div>
          {rfq.actionsRequired && (
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Actions Required</span>
              <div>
                {rfq.actionsRequired.split(',').map((action, idx) => (
                  <Badge key={idx} color="#475569">{action.trim()}</Badge>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Description */}
        <Section title="Description">
          <p style={{ margin: 0, color: '#334155', fontSize: '13px', lineHeight: 1.5 }}>
            {rfq.description || 'No description provided'}
          </p>
        </Section>

        {/* Quote - only show if has quote */}
        <Section title="Quote" show={hasQuote}>
          <div className="row">
            <div className="col-6">
              <Field label="Quote Number" value={rfq.quoteNumber} highlight />
              <Field label="Excl VAT" value={formatCurrency(rfq.quoteValueExclVat)} />
            </div>
            <div className="col-6">
              <Field label="Status" value={rfq.quoteStatus && <Badge color="#f59e0b">{rfq.quoteStatus}</Badge>} />
              <Field label="Incl VAT" value={formatCurrency(rfq.quoteValueInclVat)} highlight />
            </div>
          </div>
          {rfq.quotePdfPath && (
            <a 
              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/rfqs/${rfq.id}/quote-pdf`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary mt-2"
            >
              📄 View Quote PDF
            </a>
          )}
          {rfq.docusignStatus && (
            <div style={{ marginTop: '8px' }}>
              <Field 
                label="DocuSign Status" 
                value={
                  <Badge color={rfq.docusignStatus === 'COMPLETED' || rfq.docusignStatus === 'SIGNED' ? '#22c55e' : '#f59e0b'}>
                    {rfq.docusignStatus}
                  </Badge>
                } 
              />
            </div>
          )}
        </Section>

        {/* Order - only show if has order */}
        <Section title="Order" show={hasOrder}>
          <div className="row">
            <div className="col-6">
              <Field label="PO Number" value={rfq.orderNumber} highlight />
            </div>
            <div className="col-6">
              <Field label="Order Date" value={formatDate(rfq.orderDate)} />
            </div>
          </div>
        </Section>

        {/* Invoice - only show if has invoice */}
        <Section title="Invoice" show={hasInvoice}>
          <div className="row">
            <div className="col-6">
              <Field label="Invoice Number" value={rfq.invoiceNumber} highlight />
            </div>
            <div className="col-6">
              <Field label="Invoice Date" value={formatDate(rfq.invoiceDate)} />
            </div>
          </div>
          {rfq.paymentDate && (
            <Field label="Payment Received" value={formatDate(rfq.paymentDate)} highlight />
          )}
        </Section>

      </div>
    </div>
  );
};

export default RFQDetailsCard;