import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface RFQData {
  id: number;
  jobNo: string;
  operatingEntity: string;
  clientId: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  status: string;
  priority: string;
  requestDate: string;
  requiredDate: string;
  estimatedValue: number;
  erhaDepartment: string | null;
  assignedQuoter: string | null;
  mediaReceived: string | null;
  actionsRequired: string | null;
  drawingNumber: string | null;
  department: string | null;
  specialRequirements: string | null;
  notes: string | null;
}

interface ClientData {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
}

const PrintableENQReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rfq, setRfq] = useState<RFQData | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  const allActions = [
    'QUOTE', 'CUT', 'SERVICE', 'REPAIR', 'PAINT', 'MANUFACTURE',
    'MODIFY', 'MACHINING', 'SANDBLAST', 'BREAKDOWN', 'SUPPLY',
    'CHANGE', 'INSTALLATION', 'OTHER'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rfqRes = await axios.get(`http://localhost:8080/api/v1/rfqs/${id}`);
        setRfq(rfqRes.data);
        
        if (rfqRes.data.clientId) {
          try {
            const clientRes = await axios.get(`http://localhost:8080/api/v1/clients/${rfqRes.data.clientId}`);
            setClient(clientRes.data);
          } catch (e) {
            console.error('Failed to load client');
          }
        }
      } catch (err) {
        console.error('Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-ZA');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!rfq) return <div className="p-4">RFQ not found</div>;

  const selectedActions = rfq.actionsRequired ? rfq.actionsRequired.split(',') : [];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .enq-report { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .enq-header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .enq-header h1 { margin: 0; font-size: 24px; }
        .enq-header h2 { margin: 5px 0; font-size: 18px; color: #666; }
        .enq-section { border: 1px solid #000; margin-bottom: 15px; }
        .enq-section-header { background: #333; color: white; padding: 8px 12px; font-weight: bold; font-size: 14px; }
        .enq-section-body { padding: 12px; }
        .enq-row { display: flex; border-bottom: 1px solid #ddd; }
        .enq-row:last-child { border-bottom: none; }
        .enq-label { width: 150px; font-weight: bold; padding: 8px; background: #f5f5f5; border-right: 1px solid #ddd; }
        .enq-value { flex: 1; padding: 8px; }
        .enq-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .enq-grid-item { border: 1px solid #ddd; }
        .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; padding: 10px; }
        .action-item { display: flex; align-items: center; gap: 5px; font-size: 12px; }
        .action-checkbox { width: 16px; height: 16px; border: 2px solid #333; display: inline-flex; align-items: center; justify-content: center; }
        .action-checkbox.checked { background: #333; color: white; }
        .signature-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; }
        .print-btn { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .print-btn:hover { background: #218838; }
      `}</style>

      <button className="print-btn no-print" onClick={handlePrint}>
        ??? Print ENQ Report
      </button>

      <div className="enq-report">
        <div className="enq-header">
          <h1>ERHA FABRICATION & CONSTRUCTION</h1>
          <h2>ENQ PROGRESS REPORT</h2>
          <div style={{marginTop: '10px', fontSize: '14px'}}>
            <strong>ENQ No:</strong> {rfq.jobNo} &nbsp;&nbsp;&nbsp;
            <strong>Date:</strong> {formatDate(rfq.requestDate)}
          </div>
        </div>

        {/* Client & Contact Info */}
        <div className="enq-section">
          <div className="enq-section-header">CLIENT INFORMATION</div>
          <div className="enq-section-body">
            <div className="enq-grid">
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Client</div>
                  <div className="enq-value">{client?.companyName || `Client ID: ${rfq.clientId}`}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Contact Person</div>
                  <div className="enq-value">{rfq.contactPerson || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Email</div>
                  <div className="enq-value">{rfq.contactEmail || client?.email || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Phone</div>
                  <div className="enq-value">{rfq.contactPhone || client?.phone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENQ Details */}
        <div className="enq-section">
          <div className="enq-section-header">ENQ DETAILS</div>
          <div className="enq-section-body">
            <div className="enq-grid">
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Department</div>
                  <div className="enq-value">{rfq.erhaDepartment || rfq.department || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Assigned To</div>
                  <div className="enq-value">{rfq.assignedQuoter || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Media Received</div>
                  <div className="enq-value">{rfq.mediaReceived || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Drawing No.</div>
                  <div className="enq-value">{rfq.drawingNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Priority</div>
                  <div className="enq-value">{rfq.priority || 'MEDIUM'}</div>
                </div>
              </div>
              <div className="enq-grid-item">
                <div className="enq-row">
                  <div className="enq-label">Required By</div>
                  <div className="enq-value">{formatDate(rfq.requiredDate)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="enq-section">
          <div className="enq-section-header">DESCRIPTION OF WORK</div>
          <div className="enq-section-body" style={{minHeight: '80px'}}>
            {rfq.description || 'N/A'}
          </div>
        </div>

        {/* Actions Required */}
        <div className="enq-section">
          <div className="enq-section-header">ACTIONS REQUIRED</div>
          <div className="actions-grid">
            {allActions.map(action => (
              <div key={action} className="action-item">
                <div className={`action-checkbox ${selectedActions.includes(action) ? 'checked' : ''}`}>
                  {selectedActions.includes(action) ? '?' : ''}
                </div>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <div className="enq-section">
          <div className="enq-section-header">SPECIAL REQUIREMENTS / NOTES</div>
          <div className="enq-section-body" style={{minHeight: '60px'}}>
            {rfq.specialRequirements || rfq.notes || 'None'}
          </div>
        </div>

        {/* Signatures */}
        <div className="signature-section">
          <div>
            <div className="signature-box">
              <strong>Received By</strong>
            </div>
            <div style={{marginTop: '5px', fontSize: '12px'}}>Date: _______________</div>
          </div>
          <div>
            <div className="signature-box">
              <strong>Quoter Signature</strong>
            </div>
            <div style={{marginTop: '5px', fontSize: '12px'}}>Date: _______________</div>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#666'}}>
          Generated by ERHA OPS on {new Date().toLocaleString('en-ZA')}
        </div>
      </div>
    </>
  );
};

export default PrintableENQReport;
