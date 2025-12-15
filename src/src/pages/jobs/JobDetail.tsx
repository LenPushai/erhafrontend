import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import axios from 'axios';

interface Job {
  jobId: number;
  jobNumber: string;
  rfqId?: number;
  rfqNumber?: string;
  orderNumber?: string;
  description: string;
  clientId?: number;
  department: string;
  location: string;
  status: string;
  priority: string;
  progressPercentage: number;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  materialOrdered?: string;
  dateReceived?: string;
  createdDate?: string;
  lastModifiedDate?: string;
  isParentJob?: boolean;
  parentJobId?: number;
  jobSequence?: string;
  billingType?: string;
  quoteValueExclVat?: number;
  quoteValueInclVat?: number;
}

interface ChildJob {
  jobId: number;
  jobNumber: string;
  description: string;
  department?: string;
  location?: string;
  status: string;
  priority: string;
  progressPercentage: number;
}

interface TaskTemplate {
  templateId: number;
  templateName: string;
  description: string;
  department: string;
  estimatedTotalHours: number;
  isActive: boolean;
  tasks: TemplateTask[];
}

interface TemplateTask {
  templateTaskId: number;
  sequenceNumber: number;
  description: string;
  estimatedHours: number;
  assignedTo: string;
  notes?: string;
}

const jobService = {
  getJobById: async (id: number): Promise<Job> => {
    const response = await axios.get(`http://localhost:8080/api/v1/jobs/${id}`);
    return response.data;
  },

  getChildJobs: async (parentId: number): Promise<ChildJob[]> => {
    const response = await axios.get(`http://localhost:8080/api/v1/jobs/${parentId}/children`);
    return response.data;
  },

  createChildJobs: async (parentId: number, children: Partial<Job>[]): Promise<any[]> => {
    const response = await axios.post(`http://localhost:8080/api/v1/jobs/${parentId}/children`, children);
    return response.data;
  },

  addTasksToJob: async (jobId: number, tasks: any[]): Promise<void> => {
    await axios.post(`http://localhost:8080/api/v1/jobs/${jobId}/tasks`, tasks);
  }
};

const templateService = {
  getAllTemplates: async (): Promise<TaskTemplate[]> => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/task-templates');
      return response.data;
    } catch {
      return [];
    }
  },

  getTemplateById: async (id: number): Promise<TaskTemplate> => {
    const response = await axios.get(`http://localhost:8080/api/v1/task-templates/${id}`);
    return response.data;
  }
};

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [childJobs, setChildJobs] = useState<ChildJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Child Job Modal State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [applyTemplate, setApplyTemplate] = useState(false);
  const [childJobDescription, setChildJobDescription] = useState('');
  const [childJobLocation, setChildJobLocation] = useState('');
  const [childJobDepartment, setChildJobDepartment] = useState('');
  const [childJobQuantity, setChildJobQuantity] = useState(5);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  // Guard #1: Redirect /jobs/create
  if (id === 'create') {
    return <Navigate to="/jobs" replace />;
  }

  // Guard #2: Validate numeric ID
  const jobId = parseInt(id || '', 10);
  if (isNaN(jobId) || jobId <= 0) {
    return (
        <div className="container-fluid px-4 py-5">
          <div className="alert alert-danger">
            <strong>Invalid Job ID:</strong> "{id}" is not a valid job number.
          </div>
          <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
        </div>
    );
  }

  useEffect(() => {
    loadJob();
    loadTemplates();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await jobService.getJobById(jobId);
      setJob(data);

      // Load child jobs if this job exists
      try {
        const children = await jobService.getChildJobs(jobId);
        setChildJobs(children || []);
      } catch {
        setChildJobs([]);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAllTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    }
  };

  const handleTemplateChange = async (templateId: number | null) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      try {
        const template = await templateService.getTemplateById(templateId);
        setSelectedTemplate(template);
      } catch {
        setSelectedTemplate(null);
      }
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleCreateChildJobs = async () => {
    if (!childJobDescription.trim() || !job) return;

    setCreating(true);
    try {
      const quantity = bulkMode ? childJobQuantity : 1;
      const childJobsToCreate = [];

      for (let i = 0; i < quantity; i++) {
        const desc = bulkMode
            ? `${childJobDescription} #${i + 1}`
            : childJobDescription;

        childJobsToCreate.push({
          description: desc,
          location: childJobLocation || job.location,
          department: childJobDepartment || job.department,
          clientId: job.clientId,
          status: 'NEW',
          priority: job.priority || 'MEDIUM',
          billingType: job.billingType
        });
      }

      const createdJobs = await jobService.createChildJobs(jobId, childJobsToCreate);

      // If template selected, add tasks to each child job
      if (applyTemplate && selectedTemplate && createdJobs.length > 0) {
        for (const createdJob of createdJobs) {
          const tasks = selectedTemplate.tasks.map((task, index) => ({
            sequenceNumber: index + 1,
            description: task.description,
            estimatedHours: task.estimatedHours,
            assignedTo: task.assignedTo,
            notes: task.notes || ''
          }));

          try {
            await jobService.addTasksToJob(createdJob.jobId, tasks);
          } catch (err) {
            console.error('Failed to add tasks to job:', createdJob.jobId, err);
          }
        }
      }

      alert(
          bulkMode
              ? `Successfully created ${quantity} child jobs${applyTemplate ? ' with tasks' : ''}!`
              : `Successfully created child job${applyTemplate ? ' with tasks' : ''}!`
      );

      resetDialog();
      setCreateDialogOpen(false);
      loadJob(); // Reload to show new children
    } catch (err: any) {
      console.error('Error creating child jobs:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create child jobs');
    } finally {
      setCreating(false);
    }
  };

  const resetDialog = () => {
    setChildJobDescription('');
    setChildJobLocation('');
    setChildJobDepartment('');
    setChildJobQuantity(5);
    setBulkMode(false);
    setApplyTemplate(false);
    setSelectedTemplateId(null);
    setSelectedTemplate(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      'NEW': 'bg-secondary',
      'IN_PROGRESS': 'bg-primary',
      'COMPLETE': 'bg-success',
      'COMPLETED': 'bg-success',
      'INVOICED': 'bg-info',
      'ON_HOLD': 'bg-warning text-dark',
      'CANCELLED': 'bg-danger',
      'DELIVERED': 'bg-success',
    };
    return classes[status] || 'bg-secondary';
  };

  const getPriorityBadgeClass = (priority: string) => {
    const classes: Record<string, string> = {
      'LOW': 'bg-success',
      'MEDIUM': 'bg-warning text-dark',
      'HIGH': 'bg-orange',
      'URGENT': 'bg-danger',
    };
    return classes[priority] || 'bg-secondary';
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-ZA');
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

  if (error || !job) {
    return (
        <div className="container-fluid px-4 py-4">
          <div className="alert alert-danger">{error || 'Job not found'}</div>
          <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
        </div>
    );
  }

  return (
      <div className="container-fluid px-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mt-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/jobs">Jobs</Link></li>
            <li className="breadcrumb-item active">{job.jobNumber}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">
              <Link to="/jobs" className="btn btn-outline-secondary me-3">← Back</Link>
              Job: {job.jobNumber}
            </h1>
            <p className="text-muted mb-0">{job.description}</p>
          </div>
          <div>
          <span className={`badge ${getStatusBadgeClass(job.status)} me-2`} style={{ fontSize: '1rem' }}>
            {job.status}
          </span>
            <span className={`badge ${getPriorityBadgeClass(job.priority)}`} style={{ fontSize: '1rem' }}>
            {job.priority}
          </span>
          </div>
        </div>

        <div className="row">
          {/* Main Content */}
          <div className="col-md-8">
            {/* Job Information Card */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-header bg-white">
                <h5 className="mb-0">Job Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Job Number:</strong><br />
                    <span className="text-primary fw-bold">{job.jobNumber}</span>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Order Number:</strong><br />
                    {job.orderNumber || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Department:</strong><br />
                    {job.department || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Location:</strong><br />
                    <span className={`badge ${job.location === 'SHOP' ? 'bg-info' : 'bg-warning text-dark'}`}>
                    {job.location || 'N/A'}
                  </span>
                  </div>
                  <div className="col-12 mb-3">
                    <strong>Description:</strong><br />
                    {job.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #198754' }}>
              <div className="card-header bg-white">
                <h5 className="mb-0">Progress & Dates</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Progress:</strong>
                  <div className="progress mt-2" style={{ height: '25px' }}>
                    <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${job.progressPercentage || 0}%` }}
                    >
                      {job.progressPercentage || 0}%
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <strong>Start Date:</strong><br />
                    {formatDate(job.startDate)}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Due Date:</strong><br />
                    {formatDate(job.dueDate)}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Completion Date:</strong><br />
                    {formatDate(job.completionDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Card */}
            {(job.quoteValueExclVat || job.quoteValueInclVat) && (
                <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #ffc107' }}>
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Financial Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <strong>Quote Value (Excl VAT):</strong><br />
                        {formatCurrency(job.quoteValueExclVat)}
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Quote Value (Incl VAT):</strong><br />
                        <span className="text-success fw-bold">{formatCurrency(job.quoteValueInclVat)}</span>
                      </div>
                      <div className="col-md-6 mb-3">
                        <strong>Billing Type:</strong><br />
                        {job.billingType || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Child Jobs Card */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #6f42c1' }}>
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Child Jobs ({childJobs.length})</h5>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setCreateDialogOpen(true)}
                >
                  + Create Child Job
                </button>
              </div>
              <div className="card-body">
                {childJobs.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p className="mb-2">No child jobs yet</p>
                      <button
                          className="btn btn-outline-success"
                          onClick={() => setCreateDialogOpen(true)}
                      >
                        Create First Child Job
                      </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                        <tr>
                          <th>Job #</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {childJobs.map((child) => (
                            <tr key={child.jobId}>
                              <td>
                                <Link to={`/jobs/${child.jobId}`} className="text-decoration-none fw-bold">
                                  {child.jobNumber}
                                </Link>
                              </td>
                              <td>{child.description}</td>
                              <td>
                            <span className={`badge ${getStatusBadgeClass(child.status)}`}>
                              {child.status}
                            </span>
                              </td>
                              <td>
                                <div className="progress" style={{ height: '20px', width: '100px' }}>
                                  <div
                                      className="progress-bar bg-success"
                                      style={{ width: `${child.progressPercentage || 0}%` }}
                                  >
                                    {child.progressPercentage || 0}%
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Link to={`/jobs/${child.jobId}`} className="btn btn-sm btn-outline-primary">
                                  View
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

          {/* Sidebar */}
          <div className="col-md-4">
            {/* Quick Actions */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-header bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                      onClick={() => navigate(`/jobs/${job.jobId}/edit`)}
                      className="btn btn-outline-primary"
                  >
                    Edit Job Details
                  </button>
                  <button className="btn btn-outline-info">
                    Download Job Card PDF
                  </button>
                  <button
                      onClick={() => setCreateDialogOpen(true)}
                      className="btn btn-success"
                  >
                    + Create Child Job
                  </button>
                  {job.rfqId && (
                      <Link to={`/rfq/${job.rfqId}`} className="btn btn-outline-secondary">
                        View Source RFQ
                      </Link>
                  )}
                  <hr />
                  <Link to="/jobs" className="btn btn-outline-dark">
                    ← Back to All Jobs
                  </Link>
                </div>
              </div>
            </div>

            {/* Parent Job Info (if this is a child) */}
            {job.parentJobId && (
                <div className="card mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #fd7e14' }}>
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Parent Job</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-2">This is a child job.</p>
                    <Link to={`/jobs/${job.parentJobId}`} className="btn btn-outline-primary w-100">
                      View Parent Job
                    </Link>
                  </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #6c757d' }}>
              <div className="card-header bg-white">
                <h5 className="mb-0">Timestamps</h5>
              </div>
              <div className="card-body">
                <p className="mb-2"><strong>Created:</strong><br />{formatDate(job.createdDate)}</p>
                <p className="mb-0"><strong>Last Modified:</strong><br />{formatDate(job.lastModifiedDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Child Job Modal */}
        {createDialogOpen && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-success text-white">
                    <h5 className="modal-title">+ Create Child Job</h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={() => {
                          setCreateDialogOpen(false);
                          resetDialog();
                        }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Job Description */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Job Description *</label>
                      <input
                          type="text"
                          className="form-control"
                          placeholder="Enter child job description..."
                          value={childJobDescription}
                          onChange={(e) => setChildJobDescription(e.target.value)}
                      />
                    </div>

                    {/* Location & Department */}
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Location</label>
                        <select
                            className="form-select"
                            value={childJobLocation}
                            onChange={(e) => setChildJobLocation(e.target.value)}
                        >
                          <option value="">Same as parent ({job.location})</option>
                          <option value="SHOP">SHOP</option>
                          <option value="SITE">SITE</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Department</label>
                        <select
                            className="form-select"
                            value={childJobDepartment}
                            onChange={(e) => setChildJobDepartment(e.target.value)}
                        >
                          <option value="">Same as parent ({job.department})</option>
                          <option value="FABRICATION">FABRICATION</option>
                          <option value="MACHINING">MACHINING</option>
                          <option value="WELDING">WELDING</option>
                          <option value="ASSEMBLY">ASSEMBLY</option>
                          <option value="ELECTRICAL">ELECTRICAL</option>
                          <option value="GENERAL">GENERAL</option>
                        </select>
                      </div>
                    </div>

                    <hr />

                    {/* Bulk Mode Checkbox */}
                    <div className="form-check mb-3">
                      <input
                          type="checkbox"
                          className="form-check-input"
                          id="bulkMode"
                          checked={bulkMode}
                          onChange={(e) => setBulkMode(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="bulkMode">
                        <strong>Create multiple child jobs</strong>
                        <small className="text-muted d-block">Auto-number: "Description #1", "Description #2", etc.</small>
                      </label>
                    </div>

                    {/* Quantity Slider (shown if bulk mode) */}
                    {bulkMode && (
                        <div className="mb-3 ps-4">
                          <label className="form-label">Number of Jobs: <strong>{childJobQuantity}</strong></label>
                          <input
                              type="range"
                              className="form-range"
                              min="2"
                              max="20"
                              value={childJobQuantity}
                              onChange={(e) => setChildJobQuantity(parseInt(e.target.value))}
                          />
                          <div className="d-flex justify-content-between text-muted small">
                            <span>2</span>
                            <span>20</span>
                          </div>
                        </div>
                    )}

                    <hr />

                    {/* Apply Template Checkbox */}
                    <div className="form-check mb-3">
                      <input
                          type="checkbox"
                          className="form-check-input"
                          id="applyTemplate"
                          checked={applyTemplate}
                          onChange={(e) => setApplyTemplate(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="applyTemplate">
                        <strong>Apply task template</strong>
                        <small className="text-muted d-block">Add predefined tasks to each child job</small>
                      </label>
                    </div>

                    {/* Template Selection (shown if apply template) */}
                    {applyTemplate && (
                        <div className="mb-3 ps-4">
                          <label className="form-label">Select Template</label>
                          <select
                              className="form-select"
                              value={selectedTemplateId || ''}
                              onChange={(e) => handleTemplateChange(e.target.value ? parseInt(e.target.value) : null)}
                          >
                            <option value="">-- Select a template --</option>
                            {templates.map((t) => (
                                <option key={t.templateId} value={t.templateId}>
                                  {t.templateName} ({t.tasks?.length || 0} tasks)
                                </option>
                            ))}
                          </select>

                          {/* Template Preview */}
                          {selectedTemplate && (
                              <div className="mt-3 p-3 bg-light rounded">
                                <h6 className="mb-2">{selectedTemplate.templateName}</h6>
                                <p className="text-muted small mb-2">{selectedTemplate.description}</p>
                                <p className="mb-2">
                                  <strong>Tasks ({selectedTemplate.tasks?.length || 0}):</strong>
                                </p>
                                <ul className="list-unstyled mb-0">
                                  {selectedTemplate.tasks?.slice(0, 5).map((task, i) => (
                                      <li key={i} className="small">
                                        {i + 1}. {task.description} ({task.estimatedHours}h)
                                      </li>
                                  ))}
                                  {(selectedTemplate.tasks?.length || 0) > 5 && (
                                      <li className="small text-muted">
                                        ... and {(selectedTemplate.tasks?.length || 0) - 5} more
                                      </li>
                                  )}
                                </ul>
                              </div>
                          )}
                        </div>
                    )}

                    {/* Summary */}
                    {childJobDescription && (
                        <div className="alert alert-info mt-3 mb-0">
                          <strong>Summary:</strong> Creating {bulkMode ? childJobQuantity : 1} child job(s)
                          {applyTemplate && selectedTemplate && (
                              <span>
                        {' '}with {selectedTemplate.tasks?.length || 0} tasks each
                                {bulkMode && ` (${childJobQuantity * (selectedTemplate.tasks?.length || 0)} tasks total)`}
                      </span>
                          )}
                        </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setCreateDialogOpen(false);
                          resetDialog();
                        }}
                    >
                      Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleCreateChildJobs}
                        disabled={!childJobDescription.trim() || creating}
                    >
                      {creating ? 'Creating...' : `Create ${bulkMode ? `${childJobQuantity} Jobs` : 'Job'}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default JobDetail;