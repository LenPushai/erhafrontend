import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import EmergencyJobModal from '../EmergencyJobModal';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const metrics = [
    {
      title: 'Total RFQs',
      value: '8',
      subtitle: '2 new this week',
      icon: FileText,
      color: 'primary',
      bgClass: 'bg-primary'
    },
    {
      title: 'Active Jobs',
      value: '12',
      subtitle: '4 urgent',
      icon: Briefcase,
      color: 'success',
      bgClass: 'bg-success'
    },
    {
      title: 'Pending Quotes',
      value: '5',
      subtitle: '3 expiring soon',
      icon: FileSpreadsheet,
      color: 'info',
      bgClass: 'bg-info'
    },
    {
      title: 'Total Value',
      value: 'R750K',
      subtitle: 'Active pipeline',
      icon: TrendingUp,
      color: 'warning',
      bgClass: 'bg-warning'
    }
  ];

  const quickActions = [
    { label: 'View RFQs', icon: FileText, path: '/rfq', color: 'primary' },
    { label: 'View Quotes', icon: FileSpreadsheet, path: '/quotes', color: 'info' },
    { label: 'View Jobs', icon: Briefcase, path: '/jobs', color: 'success' },
    { label: 'View Clients', icon: Users, path: '/clients', color: 'secondary' }
  ];

  const recentActivity = [
    { type: 'RFQ', number: 'RFQ-2024-008', description: 'Compressor Room Piping', status: 'new', time: '2h ago' },
    { type: 'Quote', number: 'NE009008', description: 'Quote sent to client', status: 'sent', time: '3h ago' },
    { type: 'Job', number: 'JOB-2024-025', description: 'EAF Electrode Arm work started', status: 'progress', time: '5h ago' },
    { type: 'RFQ', number: 'RFQ-2024-007', description: 'Boiler Tube Replacement', status: 'approved', time: '1d ago' }
  ];

  const getStatusBadge = (status: string) => {
    const badges: any = {
      new: 'primary',
      sent: 'info',
      progress: 'warning',
      approved: 'success',
      completed: 'success'
    };
    return badges[status] || 'secondary';
  };

  return (
    <div>
      {/* Metrics Cards */}
      <div className="row mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-3">
            <div className={`card text-white ${metric.bgClass} h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-subtitle mb-2 opacity-75">{metric.title}</h6>
                    <h2 className="card-title mb-1">{metric.value}</h2>
                    <small className="opacity-75">{metric.subtitle}</small>
                  </div>
                  <metric.icon size={40} className="opacity-50" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Job Button - Prominent */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-danger">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <AlertCircle size={48} className="text-danger me-3" />
                    <div>
                      <h5 className="mb-1">Emergency Breakdown Work</h5>
                      <p className="text-muted mb-0">
                        Fast-track urgent repairs and breakdowns. Accounts for 27.7% of annual work.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <button
                    className="btn btn-danger btn-lg w-100 w-md-auto"
                    onClick={() => setShowEmergencyModal(true)}
                    style={{ animation: 'pulse 2s infinite' }}
                  >
                    <AlertCircle size={20} className="me-2" />
                    <strong>Create Emergency Job</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Quick Actions */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn btn-outline-${action.color} d-flex align-items-center justify-content-start`}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={18} className="me-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-md-8 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Activity</h6>
              <button className="btn btn-sm btn-outline-primary">
                View All
              </button>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="list-group-item px-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <span className={`badge bg-${getStatusBadge(activity.status)} me-2`}>
                            {activity.type}
                          </span>
                          <strong>{activity.number}</strong>
                        </div>
                        <p className="mb-1 text-muted">{activity.description}</p>
                      </div>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview & System Status */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Financial Overview</h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <DollarSign className="text-success mb-2" size={32} />
                  <h5 className="mb-0">R450K</h5>
                  <small className="text-muted">Invoiced</small>
                </div>
                <div className="col-4">
                  <Clock className="text-warning mb-2" size={32} />
                  <h5 className="mb-0">R300K</h5>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="col-4">
                  <TrendingUp className="text-info mb-2" size={32} />
                  <h5 className="mb-0">R750K</h5>
                  <small className="text-muted">Pipeline</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">System Status</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle className="text-success me-2" size={20} />
                <span>Backend API: Connected</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <CheckCircle className="text-success me-2" size={20} />
                <span>Database: Online (8 RFQs loaded)</span>
              </div>
              <div className="d-flex align-items-center">
                <CheckCircle className="text-success me-2" size={20} />
                <span>Last sync: Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="card bg-light">
        <div className="card-body text-center">
          <p className="mb-2">
            <strong>"Commit to the LORD whatever you do, and he will establish your plans."</strong>
          </p>
          <small className="text-muted">Proverbs 16:3</small>
        </div>
      </div>

      {/* Emergency Job Modal */}
      <EmergencyJobModal
        show={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;