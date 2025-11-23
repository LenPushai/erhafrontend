import React, { useState } from 'react';
import { UserPlus, X, Loader } from 'lucide-react';

interface ReassignRFQModalProps {
  show: boolean;
  rfqNumber: string;
  currentAssignee: string;
  onClose: () => void;
  onReassign: (newAssignee: string) => Promise<void>;
}

const ReassignRFQModal: React.FC<ReassignRFQModalProps> = ({
  show,
  rfqNumber,
  currentAssignee,
  onClose,
  onReassign
}) => {
  const [newAssignee, setNewAssignee] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Team members list (in Phase 2, this would come from backend)
  const teamMembers = [
    'John Smith',
    'Sarah Johnson',
    'Mike Williams',
    'Emily Davis',
    'David Brown',
    'Lisa Anderson',
    'James Wilson',
    'Maria Garcia'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignee) {
      setError('Please select a team member');
      return;
    }

    if (newAssignee === currentAssignee) {
      setError('RFQ is already assigned to this person');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onReassign(newAssignee);
      setNewAssignee('');
      onClose();
    } catch (err) {
      setError('Failed to reassign RFQ. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setNewAssignee('');
      setError(null);
      onClose();
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <UserPlus size={24} className="text-primary me-2" />
                <h5 className="modal-title mb-0">Reassign RFQ</h5>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={saving}
              />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="text-muted small mb-2">RFQ Number</label>
                <div className="p-2 bg-light rounded">
                  <strong>{rfqNumber}</strong>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small mb-2">Current Assignment</label>
                <div className="p-2 bg-light rounded">
                  {currentAssignee || <span className="text-muted">Unassigned</span>}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="newAssignee" className="form-label">
                    Reassign To <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="newAssignee"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    required
                    disabled={saving}
                  >
                    <option value="">-- Select Team Member --</option>
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Select a team member to assign this RFQ
                  </small>
                </div>

                <div className="alert alert-info mb-3">
                  <strong>Note:</strong> The assignee will be notified and can view this RFQ in their dashboard.
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={saving}
                  >
                    <X size={18} className="me-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader size={18} className="me-2 spinner-border spinner-border-sm" />
                        Reassigning...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="me-2" />
                        Reassign
                      </>
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

export default ReassignRFQModal;