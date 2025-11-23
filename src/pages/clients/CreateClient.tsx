import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
    contactPerson: '',
    vatNumber: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newClient = await clientService.createClient(formData);
      navigate('/clients/' + newClient.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Create New Client
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      className="form-control"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Province</label>
                    <input
                      type="text"
                      name="province"
                      className="form-control"
                      value={formData.province}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-control"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;