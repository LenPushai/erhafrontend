import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { useToast } from '../common/ToastContext';

interface EmergencyJobModalProps {
  show: boolean;
  onClose: () => void;
}

const EmergencyJobModal: React.FC<EmergencyJobModalProps> = ({ show, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    orderNumber: '',
    description: '',
    location: 'SHOP',
    estimatedValue: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate emergency job number
      const year = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-4);
      const jobNumber = `${year}-EMG-${timestamp}`;

      // Calculate VAT
      const valueExcl = formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0;
      const valueIncl = valueExcl * 1.15;

      // Create emergency job via API
      const response = await fetch('http://localhost:8080/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobNumber: jobNumber,
          jobType: 'SHUTDOWN',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          description: formData.description,
          location: formData.location || 'SHOP',
          orderNumber: formData.orderNumber || null,
          orderValueExcl: valueExcl,
          orderValueIncl: valueIncl,
          orderReceivedDate: new Date().toISOString().split('T')[0],
          createdBy: 'Emergency System'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create emergency job');
      }

      const newJob = await response.json();
      
      // Reset form
      setFormData({
        client: '',
        orderNumber: '',
        description: '',
        location: 'SHOP',
        estimatedValue: ''
      });
      
      onClose();
      
      // Navigate to the new job
      toast.success('Emergency Job Created!', `Job ${newJob.jobNumber} created with URGENT priority`);
      navigate(`/jobs/${newJob.jobId}`);
      
    } catch (err: any) {
      console.error('Error creating emergency job:', err);
      setError(err.message || 'Failed to create emergency job');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={handleClose}
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
                onClick={handleClose}
                disabled={loading}
              />
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Fast-Track Process:</strong> Emergency jobs bypass standard
                RFQ and quoting processes. Use only for urgent breakdown work.
              </div>

              {error && (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                </div>
              )}

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
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Order Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                      disabled={loading}
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
                    disabled={loading}
                    placeholder="Describe the emergency work required..."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location</label>
                    <select
                      className="form-select"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      disabled={loading}
                    >
                      <option value="SHOP">Shop</option>
                      <option value="SITE">Site</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estimated Value (R)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                      disabled={loading}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="alert alert-info">
                  <strong>What Happens Next:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Job card created immediately with URGENT priority</li>
                    <li>Job number auto-generated (e.g., 24-EMG-XXXX)</li>
                    <li>You'll be redirected to print the Job Card</li>
                    <li>Workshop can begin work immediately</li>
                  </ol>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="me-2 spinner-border spinner-border-sm" />
                        Creating...
                      </>
                    ) : (
                      'Create Emergency Job'
                    )}
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