import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import jobService from '../../services/jobService';

interface Job {
  jobId: number;
  jobNumber: string;
  status: string;
  rfqId?: number;
  clientId: number;
  description: string;
  startDate?: string;
  expectedDeliveryDate?: string;
  completionDate?: string;
  orderValueIncl?: number;
  orderValueExcl?: number;
  notes?: string;
  department?: string;
  location?: string;
  priority?: string;
}

const JobEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<Partial<Job>>({
    jobNumber: '',
    status: 'NEW',
    rfqId: undefined,
    clientId: 0,
    description: '',
    startDate: '',
    expectedDeliveryDate: '',
    completionDate: '',
    orderValueIncl: 0,
    notes: '',
    department: '',
    location: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobById(Number(id));
      console.log('Loaded job data:', data); // Debug log

      // Map backend fields to form fields
      setFormData({
        jobId: data.jobId,
        jobNumber: data.jobNumber || '',
        status: data.status || 'NEW',
        rfqId: data.rfqId,
        clientId: data.clientId || 0,
        description: data.description || '',
        startDate: data.startDate || '',
        expectedDeliveryDate: data.expectedDeliveryDate || '',
        completionDate: data.completionDate || '',
        orderValueIncl: data.orderValueIncl || data.orderValueExcl || 0,
        orderValueExcl: data.orderValueExcl || 0,
        notes: data.notes || '',
        department: data.department || '',
        location: data.location || '',
        priority: data.priority || 'MEDIUM'
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load job:', err);
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Map form fields back to backend expected format
      const updateData = {
        status: formData.status,
        description: formData.description,
        startDate: formData.startDate || null,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        completionDate: formData.completionDate || null,
        orderValueIncl: formData.orderValueIncl,
        notes: formData.notes || null,
        department: formData.department,
        location: formData.location,
        priority: formData.priority
      };

      await jobService.updateJob(Number(id), updateData);
      navigate('/jobs/' + id);
    } catch (err: any) {
      console.error('Failed to update job:', err);
      setError(err.message || 'Failed to update job');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate(`/jobs/${id}`);
    }
  };

  const confirmCancel = () => {
    navigate(`/jobs/${id}`);
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
    );
  }

  return (
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={saving}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="mb-1">Edit Job {formData.jobNumber}</h2>
              <div className="text-muted small">Update job information</div>
            </div>
          </div>
        </div>

        {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> {error}
              <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
              ></button>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Job Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Job Number - Read Only */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Job Number</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.jobNumber}
                      disabled
                  />
                  <div className="form-text">Job number cannot be changed</div>
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                  >
                    <option value="NEW">New</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="INVOICED">Invoiced</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                {/* RFQ ID - Read Only */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Source RFQ</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.rfqId ? `RFQ #${formData.rfqId}` : 'N/A'}
                      disabled
                  />
                </div>

                {/* Client ID - Read Only */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Client</label>
                  <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.clientId ? `Client #${formData.clientId}` : 'N/A'}
                      disabled
                  />
                </div>

                {/* Department */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Department</label>
                  <select
                      className="form-select"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="ERHA FC">ERHA FC</option>
                    <option value="FABRICATION">Fabrication</option>
                    <option value="MACHINING">Machining</option>
                    <option value="WELDING">Welding</option>
                    <option value="ASSEMBLY">Assembly</option>
                    <option value="ELECTRICAL">Electrical</option>
                  </select>
                </div>

                {/* Location */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Location</label>
                  <select
                      className="form-select"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                  >
                    <option value="">Select Location</option>
                    <option value="SHOP">Shop</option>
                    <option value="SITE">Site</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Priority</label>
                  <select
                      className="form-select"
                      value={formData.priority || 'MEDIUM'}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Job Value - Read Only display, but show current value */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Job Value (Incl VAT)</label>
                  <input
                      type="text"
                      className="form-control bg-light text-success fw-bold"
                      value={formatCurrency(formData.orderValueIncl)}
                      disabled
                  />
                  <div className="form-text">Value from order/quote</div>
                </div>

                {/* Description */}
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Job Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      placeholder="Enter detailed job description"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Dates & Timeline</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                      type="date"
                      className="form-control"
                      value={formData.startDate || ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Expected Completion (Due Date)</label>
                  <input
                      type="date"
                      className="form-control"
                      value={formData.expectedDeliveryDate || ''}
                      onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Actual Completion Date</label>
                  <input
                      type="date"
                      className="form-control"
                      value={formData.completionDate || ''}
                      onChange={(e) => handleInputChange('completionDate', e.target.value)}
                  />
                  <div className="form-text">Leave empty if not yet completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Additional Notes</h5>
            </div>
            <div className="card-body">
            <textarea
                className="form-control"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or comments about this job..."
            />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card">
            <div className="card-body bg-light">
              <div className="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                >
                  <X size={16} className="me-2" />
                  Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                >
                  {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                  ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Save Changes
                      </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Unsaved Changes</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowCancelModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>You have unsaved changes. Are you sure you want to cancel?</p>
                    <p className="text-danger mb-0">All changes will be lost.</p>
                  </div>
                  <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCancelModal(false)}
                    >
                      Continue Editing
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={confirmCancel}
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default JobEdit;