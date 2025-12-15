import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, User, Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react';
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

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClientById(Number(id));
      setClient(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await clientService.deleteClient(Number(id));
      navigate('/clients');
    } catch (err: any) {
      setError(err.message || 'Failed to delete client');
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/clients')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Clients
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning" role="alert">
          Client not found
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/clients')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="mb-1">{client.clientName}</h2>
            <div className="text-muted small">
              Client ID: CLT-{String(client.clientId).padStart(6, '0')}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/clients/' + id + '/edit')}
          >
            <Edit2 size={16} className="me-2" />
            Edit
          </button>
          <button 
            className="btn btn-outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} className="me-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <User size={18} className="me-2" />
                Contact Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <User size={16} className="text-muted" />
                    <div className="text-muted small">Contact Person</div>
                  </div>
                  <div className="fw-medium">{client.contactPerson}</div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Mail size={16} className="text-muted" />
                    <div className="text-muted small">Email</div>
                  </div>
                  <div className="fw-medium">
                    <a href={'mailto:' + client.contactEmail} className="text-decoration-none">
                      {client.contactEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Phone size={16} className="text-muted" />
                    <div className="text-muted small">Phone</div>
                  </div>
                  <div className="fw-medium">
                    <a href={'tel:' + client.contactPhone} className="text-decoration-none">
                      {client.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <MapPin size={16} className="text-muted" />
                    <div className="text-muted small">Address</div>
                  </div>
                  <div className="fw-medium">{client.address}</div>
                </div>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="card mb-3">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <FileText size={18} className="me-2" />
                  Notes
                </h5>
              </div>
              <div className="card-body">
                <div className="border rounded p-3 bg-light">
                  {client.notes}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <Calendar size={16} className="me-2" />
                Timeline
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="text-muted small mb-1">Created</div>
                <div className="fw-medium">{formatDate(client.createdDate)}</div>
              </div>
              <div>
                <div className="text-muted small mb-1">Last Updated</div>
                <div className="fw-medium">{formatDate(client.updatedDate)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <a 
                  href={'mailto:' + client.contactEmail} 
                  className="btn btn-outline-primary btn-sm"
                >
                  <Mail size={14} className="me-2" />
                  Send Email
                </a>
                <a 
                  href={'tel:' + client.contactPhone} 
                  className="btn btn-outline-primary btn-sm"
                >
                  <Phone size={14} className="me-2" />
                  Call Client
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete client <strong>{client.clientName}</strong>?</p>
                <p className="text-danger mb-0">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="me-2" />
                      Delete Client
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;