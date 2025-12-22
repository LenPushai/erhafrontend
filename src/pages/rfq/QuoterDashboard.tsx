import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface RFQ {
  id: number;
  jobNo: string;
  clientId: number;
  contactPerson: string;
  description: string;
  status: string;
  priority: string;
  requestDate: string;
  requiredDate: string;
  erhaDepartment: string | null;
  assignedQuoter: string | null;
  mediaReceived: string | null;
  actionsRequired: string | null;
  quoteStatus: string | null;
  quoteNumber: string | null;
}

interface Client {
  id: number;
  companyName: string;
}

const QuoterDashboard: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [clients, setClients] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedQuoter, setSelectedQuoter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  const quoters = ['ALL', 'HENDRIK', 'DEWALD', 'JACO', 'ESTIMATOR'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch RFQs
      const rfqRes = await axios.get('http://localhost:8080/api/v1/rfqs?size=100');
      const rfqData = rfqRes.data.content || rfqRes.data || [];
      setRfqs(rfqData);

      // Fetch clients for name lookup
      const clientRes = await axios.get('http://localhost:8080/api/v1/clients');
      const clientData = clientRes.data.value || clientRes.data.content || clientRes.data || [];
      const clientMap = new Map<number, string>();
      clientData.forEach((c: Client) => {
        clientMap.set(c.id, c.companyName);
      });
      setClients(clientMap);

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRfqs = rfqs.filter(rfq => {
    if (selectedQuoter === 'ALL') {
      return rfq.assignedQuoter !== null && rfq.assignedQuoter !== '';
    }
    return rfq.assignedQuoter === selectedQuoter;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'DRAFT': 'bg-secondary',
      'NEW': 'bg-info',
      'QUOTING': 'bg-warning text-dark',
      'QUOTED': 'bg-primary',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'ORDERED': 'bg-success',
    };
    return badges[status?.toUpperCase()] || 'bg-secondary';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      'LOW': 'bg-success',
      'MEDIUM': 'bg-warning text-dark',
      'HIGH': 'bg-orange text-white',
      'URGENT': 'bg-danger',
    };
    return badges[priority?.toUpperCase()] || 'bg-secondary';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'URGENT') return <AlertTriangle size={16} className="text-danger" />;
    if (priority === 'HIGH') return <Clock size={16} className="text-warning" />;
    return null;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-ZA');
  };

  const isOverdue = (requiredDate: string | null) => {
    if (!requiredDate) return false;
    return new Date(requiredDate) < new Date();
  };

  const getQuoterStats = (quoter: string) => {
    const quoterRfqs = quoter === 'ALL' 
      ? rfqs.filter(r => r.assignedQuoter)
      : rfqs.filter(r => r.assignedQuoter === quoter);
    
    return {
      total: quoterRfqs.length,
      pending: quoterRfqs.filter(r => !r.quoteNumber).length,
      quoted: quoterRfqs.filter(r => r.quoteNumber).length,
      urgent: quoterRfqs.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH').length,
    };
  };

  const stats = getQuoterStats(selectedQuoter);

  if (loading) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading quoter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Quoter Dashboard</h1>
          <p className="text-muted mb-0">Manage and track assigned RFQs</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <label className="form-label mb-0 fw-bold">Quoter:</label>
          <select
            className="form-select"
            style={{width: '180px'}}
            value={selectedQuoter}
            onChange={(e) => setSelectedQuoter(e.target.value)}
          >
            {quoters.map(q => (
              <option key={q} value={q}>{q === 'ALL' ? 'All Quoters' : q}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Total Assigned</h6>
                  <h2 className="mb-0">{stats.total}</h2>
                </div>
                <FileText size={40} opacity={0.5} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Pending Quote</h6>
                  <h2 className="mb-0">{stats.pending}</h2>
                </div>
                <Clock size={40} opacity={0.5} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Quoted</h6>
                  <h2 className="mb-0">{stats.quoted}</h2>
                </div>
                <CheckCircle size={40} opacity={0.5} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Urgent/High</h6>
                  <h2 className="mb-0">{stats.urgent}</h2>
                </div>
                <AlertTriangle size={40} opacity={0.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            {selectedQuoter === 'ALL' ? 'All Assigned RFQs' : `RFQs Assigned to ${selectedQuoter}`}
            <span className="badge bg-light text-dark ms-2">{filteredRfqs.length}</span>
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredRfqs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FileText size={48} className="mb-3" />
              <p>No RFQs assigned {selectedQuoter !== 'ALL' ? `to ${selectedQuoter}` : ''}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>RFQ #</th>
                    <th>Client</th>
                    <th>Department</th>
                    <th>Actions Required</th>
                    <th>Priority</th>
                    <th>Required By</th>
                    <th>Status</th>
                    <th>Quote #</th>
                    <th className="text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRfqs.map(rfq => (
                    <tr key={rfq.id} className={isOverdue(rfq.requiredDate) && !rfq.quoteNumber ? 'table-danger' : ''}>
                      <td>
                        <strong>{rfq.jobNo}</strong>
                      </td>
                      <td>{clients.get(rfq.clientId) || `Client #${rfq.clientId}`}</td>
                      <td>{rfq.erhaDepartment || 'N/A'}</td>
                      <td>
                        {rfq.actionsRequired ? (
                          <div className="d-flex flex-wrap gap-1">
                            {rfq.actionsRequired.split(',').slice(0, 3).map((action, idx) => (
                              <span key={idx} className="badge bg-secondary" style={{fontSize: '10px'}}>{action}</span>
                            ))}
                            {rfq.actionsRequired.split(',').length > 3 && (
                              <span className="badge bg-light text-dark" style={{fontSize: '10px'}}>
                                +{rfq.actionsRequired.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadge(rfq.priority)}`}>
                          {getPriorityIcon(rfq.priority)} {rfq.priority}
                        </span>
                      </td>
                      <td className={isOverdue(rfq.requiredDate) ? 'text-danger fw-bold' : ''}>
                        {formatDate(rfq.requiredDate)}
                        {isOverdue(rfq.requiredDate) && !rfq.quoteNumber && (
                          <span className="badge bg-danger ms-1">OVERDUE</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(rfq.status)}`}>{rfq.status}</span>
                      </td>
                      <td>
                        {rfq.quoteNumber ? (
                          <span className="text-success fw-bold">{rfq.quoteNumber}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        <Link to={`/rfq/${rfq.id}`} className="btn btn-sm btn-outline-primary">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoterDashboard;
