import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface EmergencyJobModalProps {
  show: boolean;
  onClose: () => void;
}

const EmergencyJobModal: React.FC<EmergencyJobModalProps> = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    client: '',
    orderNumber: '',
    description: '',
    location: '',
    estimatedValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Emergency Job Created! (Demo mode)');
    onClose();
    setFormData({
      client: '',
      orderNumber: '',
      description: '',
      location: '',
      estimatedValue: ''
    });
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="me-2" />
                <h5 className="modal-title mb-0">Create Emergency Job</h5>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Fast-Track Process:</strong> Emergency jobs bypass standard
                RFQ and quoting processes. Use only for urgent breakdown work.
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Order Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estimated Value (R)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                    />
                  </div>
                </div>

                <div className="alert alert-info">
                  <strong>What Happens Next:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Job card created immediately</li>
                    <li>Workshop notified</li>
                    <li>Materials requisition auto-generated</li>
                    <li>Client invoiced on completion</li>
                  </ol>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Create Emergency Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyJobModal;