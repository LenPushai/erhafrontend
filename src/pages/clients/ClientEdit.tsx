import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { clientService } from '../../services/clientService';

interface Client {
  clientId: number;
  clientName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  notes?: string;
  createdDate: string;
  updatedDate: string;
}

const ClientEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<Partial<Client>>({
    clientName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClientById(Number(id));
      setFormData({
        clientName: data.clientName,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        notes: data.notes || ''
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load client');
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

      await clientService.updateClient(Number(id), formData);
      navigate('/clients/' + id);
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate('/clients/' + id);
    }
  };

  const confirmCancel = () => {
    navigate('/clients/' + id);
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
            <h2 className="mb-1">Edit Client</h2>
            <div className="text-muted small">Update client information</div>
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
          <div className="card-body mb-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Client Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  required
                  placeholder="Enter client company name"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Contact Person <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  required
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Phone <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  required
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  placeholder="Enter full address"
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments about the client"
                />
              </div>
            </div>
          </div>

          <div className="card-footer bg-light mb-4">
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

export default ClientEdit;