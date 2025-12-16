import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import './DeliveryModal.css';

interface DeliveryModalProps {
  job: {
    jobId: number;
    jobNumber: string;
    clientName: string;
    description: string;
  };
  onClose: () => void;
  onDeliveryConfirmed: () => void;
}

const DeliveryModal: React.FC<DeliveryModalProps> = ({ job, onClose, onDeliveryConfirmed }) => {
  const [deliveredBy, setDeliveredBy] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const generateDeliveryNoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `DN-${year}${month}${day}-${job.jobNumber}`;
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async () => {
    if (!deliveredBy.trim()) {
      alert('Please enter who delivered the job');
      return;
    }
    if (!receivedBy.trim()) {
      alert('Please enter who received the delivery');
      return;
    }
    if (signatureRef.current?.isEmpty()) {
      alert('Please capture client signature');
      return;
    }

    setSaving(true);
    try {
      const signatureData = signatureRef.current?.toDataURL() || '';
      
      await axios.post(`http://localhost:8080/api/v1/delivery/confirm/${job.jobId}`, {
        deliveredBy,
        vehicle,
        deliveryNoteNumber: generateDeliveryNoteNumber(),
        receivedBy,
        clientSignature: signatureData,
        notes
      });

      alert('Delivery confirmed successfully!');
      onDeliveryConfirmed();
    } catch (error: any) {
      alert('Failed to confirm delivery: ' + (error.response?.data?.error || error.message));
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="delivery-modal">
        <div className="modal-header">
          <h2>Delivery Confirmation</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Job Info */}
          <div className="job-info-section">
            <div className="info-row">
              <span className="label">Job Number:</span>
              <span className="value">{job.jobNumber}</span>
            </div>
            <div className="info-row">
              <span className="label">Client:</span>
              <span className="value">{job.clientName}</span>
            </div>
            <div className="info-row">
              <span className="label">Description:</span>
              <span className="value">{job.description}</span>
            </div>
            <div className="info-row">
              <span className="label">Delivery Note #:</span>
              <span className="value delivery-note">{generateDeliveryNoteNumber()}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="form-section">
            <h3>Delivery Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Delivered By *</label>
                <input
                  type="text"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                  placeholder="Driver / Staff name"
                />
              </div>
              <div className="form-group">
                <label>Vehicle Registration</label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. NKG 123 GP"
                />
              </div>
            </div>
          </div>

          {/* Client Receipt */}
          <div className="form-section">
            <h3>Client Receipt</h3>
            <div className="form-group">
              <label>Received By *</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Client representative name"
              />
            </div>

            <div className="form-group">
              <label>Client Signature *</label>
              <div className="signature-container">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'signature-canvas',
                    width: 500,
                    height: 150
                  }}
                  backgroundColor="#ffffff"
                />
                <button type="button" className="clear-sig-btn" onClick={clearSignature}>
                  Clear Signature
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any delivery notes or comments..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Confirming...' : 'Confirm Delivery'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;