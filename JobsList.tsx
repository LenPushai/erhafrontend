import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

type SortField = 'jobNumber' | 'status' | 'priority' | 'orderValueExcl';
type SortDirection = 'asc' | 'desc';

const JobsList: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('jobNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobService.getAllJobs();
      setJobs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalValue = jobs.reduce((sum, job) => sum + (job.orderValueExcl || 0), 0);
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = jobs.reduce((acc, job) => {
      acc[job.priority] = (acc[job.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: jobs.length,
      totalValue,
      new: statusCounts['New'] || 0,
      inProgress: statusCounts['In Progress'] || 0,
      completed: statusCounts['Complete'] || statusCounts['Completed'] || 0,
      invoiced: statusCounts['Invoiced'] || 0,
      urgent: priorityCounts['Urgent'] || 0,
      high: priorityCounts['High'] || 0,
      avgValue: jobs.length > 0 ? totalValue / jobs.length : 0
    };
  }, [jobs]);

  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { class: string } } = {
      'New': { class: 'bg-primary text-white' },
      'In Progress': { class: 'bg-info text-white' },
      'Complete': { class: 'bg-success text-white' },
      'Completed': { class: 'bg-success text-white' },
      'Invoiced': { class: 'bg-success text-white' },
      'On Hold': { class: 'bg-warning text-dark' },
      'Cancelled': { class: 'bg-danger text-white' },
      'Delivered': { class: 'bg-success text-white' }
    };
    return configs[status] || configs['New'];
  };

  const getPriorityConfig = (priority: string) => {
    const configs: { [key: string]: { class: string } } = {
      'Low': { class: 'bg-info text-white' },
      'Medium': { class: 'bg-warning text-dark' },
      'High': { class: 'bg-orange text-white' },
      'Urgent': { class: 'bg-danger text-white' }
    };
    return configs[priority] || configs['Medium'];
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const jobNumber = job.jobNumber || '';
      const description = job.description || '';

      const matchesSearch =
          jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'orderValueExcl') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const paginatedJobs = filteredAndSortedJobs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

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
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-semibold text-secondary">Loading Jobs...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        {/* Header with Gradient - EXACT MATCH TO RFQ */}
        <div className="text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 50%, #6610f2 100%)' }}>
          <div className="container-fluid px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold mb-2">
                  <span className="fs-1 me-2"></span>
                  Job Dashboard
                </h1>
                <p className="mb-0 opacity-75">Manage and track all active jobs</p>
              </div>
              <button
                  onClick={() => navigate('/jobs/new')}
                  className="btn btn-light btn-lg fw-semibold shadow"
                  style={{ borderRadius: '12px' }}
              >
                <span className="fs-5 me-2">+</span> New Job
              </button>
            </div>

            {/* Stats Cards Row */}
            <div className="row g-3">
              <div className="col-md-3">
                <div className="card border-0 bg-white bg-opacity-10 backdrop-blur text-white" style={{ borderRadius: '12px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small mb-1 opacity-75">Total Jobs</p>
                        <h2 className="display-6 fw-bold mb-0">{metrics.total}</h2>
                      </div>
                      <div className="fs-1 opacity-75"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 bg-white bg-opacity-10 backdrop-blur text-white" style={{ borderRadius: '12px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small mb-1 opacity-75">Total Value</p>
                        <h3 className="h4 fw-bold mb-0">{formatCurrency(metrics.totalValue)}</h3>
                      </div>
                      <div className="fs-1 opacity-75"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 bg-white bg-opacity-10 backdrop-blur text-white" style={{ borderRadius: '12px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small mb-1 opacity-75">Urgent Priority</p>
                        <h2 className="display-6 fw-bold mb-0">{metrics.urgent}</h2>
                        <p className="small mb-0 opacity-75">+{metrics.high} High</p>
                      </div>
                      <div className="fs-1 opacity-75"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 bg-white bg-opacity-10 backdrop-blur text-white" style={{ borderRadius: '12px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small mb-1 opacity-75">Avg. Value</p>
                        <h3 className="h4 fw-bold mb-0">{formatCurrency(metrics.avgValue)}</h3>
                      </div>
                      <div className="fs-1 opacity-75"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid px-4 py-4">
          {/* Status Overview Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-start border-5 border-primary shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-primary small fw-semibold mb-1">New</p>
                      <h2 className="h3 fw-bold text-primary mb-0">{metrics.new}</h2>
                    </div>
                    <span className="fs-1"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-start border-5 border-warning shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-warning small fw-semibold mb-1">In Progress</p>
                      <h2 className="h3 fw-bold text-warning mb-0">{metrics.inProgress}</h2>
                    </div>
                    <span className="fs-1"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-start border-5 border-success shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-success small fw-semibold mb-1">Completed</p>
                      <h2 className="h3 fw-bold text-success mb-0">{metrics.completed}</h2>
                    </div>
                    <span className="fs-1"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-start border-5 border-success shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-success small fw-semibold mb-1">Invoiced</p>
                      <h2 className="h3 fw-bold text-success mb-0">{metrics.invoiced}</h2>
                    </div>
                    <span className="fs-1"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold">
                  <span className="me-2"></span>Filters & Search
                </h5>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"></span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all"> All Statuses</option>
                    <option value="New"> New</option>
                    <option value="In Progress"> In Progress</option>
                    <option value="Complete"> Complete</option>
                    <option value="Invoiced"> Invoiced</option>
                    <option value="Delivered"> Delivered</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <select
                      className="form-select"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all"> All Priorities</option>
                    <option value="Low"> Low</option>
                    <option value="Medium"> Medium</option>
                    <option value="High"> High</option>
                    <option value="Urgent"> Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                <tr>
                  <th className="px-4 fw-bold">Job Number</th>
                  <th className="px-4 fw-bold">Description</th>
                  <th className="px-4 fw-bold">Client</th>
                  <th className="px-4 text-end fw-bold">Value</th>
                  <th className="px-4 fw-bold">Status</th>
                  <th className="px-4 fw-bold">Priority</th>
                  <th className="px-4 fw-bold">Progress</th>
                  <th className="px-4 fw-bold">Quote/RFQ</th>
                  <th className="px-4 text-center fw-bold">Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <div className="text-muted">
                          <div className="fs-1 mb-3"></div>
                          <p className="fw-semibold">No jobs found matching your filters</p>
                        </div>
                      </td>
                    </tr>
                ) : (
                    paginatedJobs.map((job) => {
                      const statusConfig = getStatusConfig(job.status);
                      const priorityConfig = getPriorityConfig(job.priority);

                      return (
                          <tr key={job.jobId}>
                            <td className="px-4">
                              <button
                                  onClick={() => navigate('/jobs/' + job.jobId)}
                                  className="btn btn-link text-decoration-none fw-bold p-0"
                              >
                                {job.jobNumber}
                              </button>
                            </td>
                            <td className="px-4 text-muted" style={{ maxWidth: '200px' }}>
                              <div className="text-truncate">{job.description || 'No description'}</div>
                            </td>
                            <td className="px-4">Client ID: {job.clientId || 'N/A'}</td>
                            <td className="px-4 text-end fw-bold">{formatCurrency(job.orderValueExcl || 0)}</td>
                            <td className="px-4">
                          <span className={'badge ' + statusConfig.class + ' rounded-pill px-3 py-2'}>
                            {job.status}
                          </span>
                            </td>
                            <td className="px-4">
                          <span className={'badge ' + priorityConfig.class + ' rounded-pill px-3 py-2'}>
                            {job.priority}
                          </span>
                            </td>
                            <td className="px-4">
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '8px', width: '80px' }}>
                                  <div
                                      className="progress-bar bg-info"
                                      style={{ width: (job.progressPercentage || 0) + '%' }}
                                  ></div>
                                </div>
                                <span className="small text-muted">{job.progressPercentage || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4">
                              {job.rfqId && <span className="badge bg-info">RFQ #{job.rfqId}</span>}
                            </td>
                            <td className="px-4">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                    onClick={() => navigate('/jobs/' + job.jobId)}
                                    className="btn btn-sm btn-outline-primary"
                                    title="View"
                                >
                                  View
                                </button>
                                <button
                                    onClick={() => navigate('/jobs/' + job.jobId + '/edit')}
                                    className="btn btn-sm btn-outline-secondary"
                                    title="Edit"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                      );
                    })
                )}
                </tbody>
              </table>
            </div>

            {/* Pagination - EXACT MATCH TO RFQ */}
            {totalPages > 1 && (
                <div className="card-footer bg-light d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing <span className="fw-bold text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="fw-bold text-primary">{Math.min(currentPage * itemsPerPage, filteredAndSortedJobs.length)}</span> of{' '}
                    <span className="fw-bold text-primary">{filteredAndSortedJobs.length}</span> jobs
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={'page-item ' + (currentPage === 1 ? 'disabled' : '')}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      <li className="page-item active">
                    <span className="page-link">
                      Page {currentPage} of {totalPages}
                    </span>
                      </li>
                      <li className={'page-item ' + (currentPage === totalPages ? 'disabled' : '')}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
            )}
          </div>
        </div>

        {/* Custom Styles */}
        <style>{`
        .cursor-pointer { cursor: pointer; }
        .backdrop-blur { backdrop-filter: blur(10px); }
        .bg-orange { background-color: #fd7e14 !important; }
        .card { transition: all 0.2s ease; }
        .card:hover { transform: translateY(-2px); }
        .table > tbody > tr:hover { background-color: rgba(13, 110, 253, 0.05); }
      `}</style>
      </div>
  );
};

export default JobsList;