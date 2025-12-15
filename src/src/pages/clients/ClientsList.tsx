import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard
} from 'lucide-react';
import { clientService } from '../../services/clientService';
import { PastelExportButton } from '../../components/common/PastelExportButton';

interface Client {
  id: number;
  clientName: string;
  clientCode: string;
  clientType: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  physicalAddress?: string;
  city?: string;
  province?: string;
  vatNumber?: string;
  paymentTermsDays: number;
  creditLimit?: number;
  status: string;
  industry?: string;
}

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, typeFilter, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(client => {
        if (!client.clientType) return false;
        if (typeFilter === 'INTERNAL') {
          return client.clientType.toUpperCase().includes('INTERNAL');
        } else if (typeFilter === 'EXTERNAL') {
          return client.clientType.toUpperCase() === 'EXTERNAL';
        }
        return true;
      });
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(client => 
        client.status && client.status.toUpperCase() === statusFilter
      );
    }

    setFilteredClients(filtered);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    
    try {
      await clientService.deleteClient(selectedClient.id);
      setShowDeleteModal(false);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      alert('Failed to delete client');
    }
  };

  const getTypeBadge = (type?: string) => {
    if (!type) {
      return <span className="badge bg-secondary">Unknown</span>;
    }
    if (type.toUpperCase().includes('INTERNAL')) {
      return (
        <span className="badge bg-info d-inline-flex align-items-center">
          <Building2 size={14} className="me-1" />
          Internal Department
        </span>
      );
    } else {
      return (
        <span className="badge bg-primary d-inline-flex align-items-center">
          <Users size={14} className="me-1" />
          External
        </span>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'ACTIVE': 'success',
      'INACTIVE': 'secondary',
      'SUSPENDED': 'danger'
    };
    const badgeColor = statusMap[status.toUpperCase()] || 'secondary';
    return <span className={`badge bg-${badgeColor}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading clients from backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">Error Loading Clients</h5>
        <p>{error}</p>
        <button className="btn btn-danger mt-2" onClick={fetchClients}>
          <RefreshCw size={16} className="me-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Clients</h4>
          <p className="text-muted mb-0">
            {filteredClients.length} of {clients.length} clients
          </p>
        </div>
        <PastelExportButton exportType="allClients" variant="success" className="me-2" />
        <button
          className="btn btn-primary"
          onClick={() => navigate('/clients/new')}
        >
          <Plus size={18} className="me-2" />
          New Client
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="INTERNAL">Internal Departments</option>
                <option value="EXTERNAL">External Clients</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={fetchClients}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {filteredClients.length === 0 ? (
            <div className="text-center p-5">
              <Filter size={48} className="text-muted mb-3" />
              <h5>No Clients Found</h5>
              <p className="text-muted">
                {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Add your first client to get started'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Client Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Payment Terms</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Building2 size={18} className="text-muted me-2" />
                          <strong>{client.clientName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{client.clientCode}</span>
                      </td>
                      <td>{getTypeBadge(client.clientType)}</td>
                      <td>
                        {client.contactPerson ? (
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <Users size={14} className="text-muted me-1" />
                              <small>{client.contactPerson}</small>
                            </div>
                            {client.phone && (
                              <div className="d-flex align-items-center mb-1">
                                <Phone size={14} className="text-muted me-1" />
                                <small>{client.phone}</small>
                              </div>
                            )}
                            {client.email && (
                              <div className="d-flex align-items-center">
                                <Mail size={14} className="text-muted me-1" />
                                <small>{client.email}</small>
                              </div>
                            )}
                          </div>
                        ) : (
                          <small className="text-muted">No contact info</small>
                        )}
                      </td>
                      <td>
                        {client.city || client.province ? (
                          <div className="d-flex align-items-center">
                            <MapPin size={14} className="text-muted me-1" />
                            <small>
                              {[client.city, client.province].filter(Boolean).join(', ')}
                            </small>
                          </div>
                        ) : (
                          <small className="text-muted">-</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <CreditCard size={14} className="text-muted me-1" />
                          <small>{client.paymentTermsDays} days</small>
                        </div>
                      </td>
                      <td>{getStatusBadge(client.status)}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="View Details"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            title="Edit"
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="mb-0">{clients.length}</h3>
              <small className="text-muted">Total Clients</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="mb-0">
                {clients.filter(c => c.clientType && c.clientType.toUpperCase().includes('INTERNAL')).length}
              </h3>
              <small className="text-muted">Internal Departments</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="mb-0">
                {clients.filter(c => c.clientType && c.clientType.toUpperCase() === 'EXTERNAL').length}
              </h3>
              <small className="text-muted">External Clients</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="mb-0">
                {clients.filter(c => c.status && c.status.toUpperCase() === 'ACTIVE').length}
              </h3>
              <small className="text-muted">Active</small>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && selectedClient && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this client?</p>
                  <div className="alert alert-warning">
                    <strong>{selectedClient.clientName}</strong>
                    <br />
                    Code: {selectedClient.clientCode}
                    <br />
                    Type: {selectedClient.clientType || 'Unknown'}
                  </div>
                  <p className="text-danger mb-0">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientsList;