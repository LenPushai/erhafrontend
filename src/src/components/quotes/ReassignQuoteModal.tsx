import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

interface ReassignQuoteModalProps {
  quoteNumber: string;
  currentAssignee?: string;
  onClose: () => void;
  onReassign: (newAssignee: string) => Promise<void>;
}

const ReassignQuoteModal: React.FC<ReassignQuoteModalProps> = ({
  quoteNumber,
  currentAssignee,
  onClose,
  onReassign
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamMembers = [
    'John Smith',
    'Sarah Johnson',
    'Michael Brown',
    'Emily Davis',
    'David Wilson',
    'Lisa Anderson',
    'James Taylor',
    'Jennifer Martinez'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember) {
      setError('Please select a team member');
      return;
    }

    if (selectedMember === currentAssignee) {
      setError('Quote is already assigned to this person');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onReassign(selectedMember);
      onClose();
    } catch (err: any) {
      setError('Failed to reassign quote. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <UserPlus size={20} />
                  Reassign Quote
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
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
                  <label className="text-muted small">Quote Number</label>
                  <p className="mb-0"><strong>{quoteNumber}</strong></p>
                </div>

                {currentAssignee && (
                  <div className="mb-3">
                    <label className="text-muted small">Currently Assigned To</label>
                    <p className="mb-0">{currentAssignee}</p>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    Reassign To <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    disabled={saving}
                    required
                  >
                    <option value="">Select team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="alert alert-info mb-0">
                  <small>
                    <strong>Note:</strong> The assigned person will be notified of this change.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={saving}
                >
                  <X size={18} className="me-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !selectedMember}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Reassigning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="me-2" />
                      Reassign Quote
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReassignQuoteModal;