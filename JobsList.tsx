// src/pages/jobs/JobsList.tsx
// ERHA OPS - Clean Industrial White Theme

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import jobService from '../../services/jobService';

interface Job {
  jobId: number;
  jobNumber: string;
  description: string;
  clientId?: number;
  status: string;
  priority: string;
  progressPercentage: number;
  orderValueExcl?: number;
  rfqId?: number;
}

export default function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getAllJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: jobs.length,
    totalValue: jobs.reduce((sum, job) => sum + (job.orderValueExcl || 0), 0),
    urgent: jobs.filter(j => j.priority === 'High' || j.priority === 'Urgent').length,
    avgValue: jobs.length > 0 ? jobs.reduce((sum, job) => sum + (job.orderValueExcl || 0), 0) / jobs.length : 0,
  };

  const statusCounts = {
    new: jobs.filter(j => j.status === 'New').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Complete' || j.status === 'Completed').length,
    invoiced: jobs.filter(j => j.status === 'Invoiced').length,
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'All Priorities' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      'New': 'bg-primary', 'In Progress': 'bg-info', 'Complete': 'bg-success',
      'Completed': 'bg-success', 'Invoiced': 'bg-success', 'On Hold': 'bg-warning',
      'Cancelled': 'bg-danger', 'Delivered': 'bg-success'
    };
    return 'badge ' + (map[status] || 'bg-secondary');
  };

  const getPriorityBadgeClass = (priority: string) => {
    const map: Record<string, string> = {
      'Low': 'bg-success', 'Medium': 'bg-warning', 'High': 'bg-danger', 'Urgent': 'bg-danger'
    };
    return 'badge ' + (map[priority] || 'bg-secondary');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading jobs...</p>
          </div>
        </div>
    );
  }

  return (
      <div>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">Job Dashboard</h1>
            <p className="text-muted mb-0">Manage and track all active jobs</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
            <Plus size={20} className="me-2" />
            New Job
          </button>
        </div>

        {/* Stats Cards - Clean White with Colored Left Border */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Total Jobs</p>
                <h2 className="fw-bold mb-0 text-primary">{stats.total}</h2>
                <p className="text-muted small mb-0">Active pipeline</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #198754' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Total Value</p>
                <h2 className="fw-bold mb-0 text-success">{formatCurrency(stats.totalValue)}</h2>
                <p className="text-muted small mb-0">Combined worth</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Urgent Priority</p>
                <h2 className="fw-bold mb-0 text-danger">{stats.urgent}</h2>
                <p className="text-muted small mb-0">Needs attention</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #fd7e14' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Avg. Value</p>
                <h2 className="fw-bold mb-0" style={{ color: '#fd7e14' }}>{formatCurrency(stats.avgValue)}</h2>
                <p className="text-muted small mb-0">Per job</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #6c757d' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">New</p>
                <h3 className="fw-bold mb-0">{statusCounts.new}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #ffc107' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">In Progress</p>
                <h3 className="fw-bold mb-0">{statusCounts.inProgress}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Completed</p>
                <h3 className="fw-bold mb-0">{statusCounts.completed}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #198754' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Invoiced</p>
                <h3 className="fw-bold mb-0">{statusCounts.invoiced}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                  <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Statuses</option>
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Complete</option>
                  <option>Invoiced</option>
                  <option>Delivered</option>
                </select>
              </div>
              <div className="col-md-4">
                <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option>All Priorities</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                <tr>
                  <th>Job Number</th>
                  <th>Description</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Quote/RFQ</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedJobs.map((job) => (
                    <tr key={job.jobId}>
                      <td>
                        <button
                            onClick={() => navigate("/jobs/" + job.jobId)}
                            className="btn btn-link text-decoration-none fw-bold p-0 text-primary"
                        >
                          {job.jobNumber}
                        </button>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.description || 'No description'}
                        </div>
                      </td>
                      <td>Client ID: {job.clientId || 'N/A'}</td>
                      <td className="fw-semibold">{formatCurrency(job.orderValueExcl || 0)}</td>
                      <td>
                        <span className={getStatusBadgeClass(job.status)}>{job.status}</span>
                      </td>
                      <td>
                        <span className={getPriorityBadgeClass(job.priority)}>{job.priority}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '8px', width: '80px' }}>
                            <div className="progress-bar bg-info" style={{ width: (job.progressPercentage || 0) + '%' }}></div>
                          </div>
                          <span className="small text-muted">{job.progressPercentage || 0}%</span>
                        </div>
                      </td>
                      <td>
                        {job.rfqId && <span className="badge bg-info">RFQ #{job.rfqId}</span>}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => navigate('/jobs/' + job.jobId)}>View</button>
                          <button className="btn btn-outline-secondary" onClick={() => navigate('/jobs/' + job.jobId + '/edit')}>Edit</button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={'page-item ' + (currentPage === 1 ? 'disabled' : '')}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                        <li key={page} className={'page-item ' + (currentPage === page ? 'active' : '')}>
                          <button className="page-link" onClick={() => handlePageChange(page)}>
                            {page}
                          </button>
                        </li>
                    );
                  })}
                  <li className={'page-item ' + (currentPage === totalPages ? 'disabled' : '')}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No jobs found matching your filters.</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
