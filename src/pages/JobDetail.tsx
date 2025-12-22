import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserPlus,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  PlayCircle
} from 'lucide-react';
import jobService from '../../services/jobService';

interface Job {
  id: number;
  jobNumber: string;
  quoteId: number;
  clientId: number;
  jobDescription: string;
  jobStatus: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  totalCost: number;
  notes?: string;
  createdDate: string;
  updatedDate?: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobById(Number(id));
      setJob(data);
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    try {
      await jobService.deleteJob(job.id);
      navigate('/jobs');
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <Briefcase size={20} />;
    
    const icons: any = {
      'SCHEDULED': <Clock size={20} className="text-warning" />,
      'IN PROGRESS': <PlayCircle size={20} className="text-primary" />,
      'ON HOLD': <Pause size={20} className="text-secondary" />,
      'COMPLETED': <CheckCircle size={20} className="text-success" />,
      'CANCELLED': <XCircle size={20} className="text-danger" />
    };
    return icons[status.toUpperCase()] || <Briefcase size={20} />;
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="badge bg-secondary">Unknown</span>;
    
    const statusMap: any = {
      'SCHEDULED': 'warning',
      'IN PROGRESS': 'primary',
      'ON HOLD': 'secondary',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'NEW': 'info',
      'COMPLETE': 'success',
      'INVOICED': 'success',
      'DELIVERED': 'success'
    };
    const badgeColor = statusMap[status.toUpperCase()] || 'secondary';
    return (
      <span className={`badge bg-${badgeColor} d-inline-flex align-items-center gap-1`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const calculateDaysRemaining = () => {
    if (!job || !job.expectedCompletionDate) return null;
    const today = new Date();
    const completionDate = new Date(job.expectedCompletionDate);
    const diffTime = completionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimelineStatus = () => {
    if (job?.actualCompletionDate) {
      return <span className="badge bg-success">Job Completed</span>;
    }
    
    const daysRemaining = calculateDaysRemaining();
    if (daysRemaining === null) return null;
    
    if (daysRemaining < 0) {
      return <span className="badge bg-danger">Overdue by {Math.abs(daysRemaining)} days</span>;
    } else if (daysRemaining === 0) {
      return <span className="badge bg-warning">Due today</span>;
    } else if (daysRemaining <= 7) {
      return <span className="badge bg-warning">Due in {daysRemaining} days</span>;
    } else {
      return <span className="badge bg-success">{daysRemaining} days remaining</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">Error</h5>
        <p>{error || 'Job not found'}</p>
        <button className="btn btn-danger mt-2" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/jobs')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="mb-1">Job Details</h4>
            <p className="text-muted mb-0">{job.jobNumber}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/jobs/${job.id}/edit`)}
          >
            <Edit size={18} className="me-2" />
            Edit
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Left Column */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Job Information</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Job Number</label>
                  <p className="mb-0"><strong>{job.jobNumber}</strong></p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Status</label>
                  <p className="mb-0">{getStatusBadge(job.jobStatus)}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Quote Reference</label>
                  <p className="mb-0">
                    <span className="badge bg-primary">Quote #{job.quoteId}</span>
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Client Reference</label>
                  <p className="mb-0">
                    <span className="badge bg-secondary">Client #{job.clientId}</span>
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Description</label>
                <p className="mb-0">{job.jobDescription || 'No description provided'}</p>
              </div>

              {job.notes && (
                <div className="mb-3">
                  <label className="text-muted small">Notes</label>
                  <p className="mb-0 text-muted">{job.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-4">
          {/* Financial Details */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <DollarSign size={18} />
                Financial Details
              </h6>
            </div>
            <div className="card-body">
              <div>
                <label className="text-muted small">Total Job Cost</label>
                <h4 className="mb-0 text-success">{formatCurrency(job.totalCost || 0)}</h4>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <Calendar size={18} />
                Timeline
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small">Start Date</label>
                <p className="mb-0">{formatDate(job.startDate)}</p>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Expected Completion</label>
                <p className="mb-0">{formatDate(job.expectedCompletionDate)}</p>
              </div>
              {job.actualCompletionDate && (
                <div className="mb-3">
                  <label className="text-muted small">Actual Completion</label>
                  <p className="mb-0">{formatDate(job.actualCompletionDate)}</p>
                </div>
              )}
              <div>
                <label className="text-muted small">Status</label>
                <p className="mb-0">{getTimelineStatus()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                  <p>Are you sure you want to delete this job?</p>
                  <div className="alert alert-warning">
                    <strong>{job.jobNumber}</strong>
                    <br />
                    {job.jobDescription}
                    <br />
                    <strong>Cost: {formatCurrency(job.totalCost || 0)}</strong>
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
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete Job
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

export default JobDetail;
