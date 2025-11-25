import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Calendar,
  Download,
  Filter,
  Clock
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const plannedReports = [
    { 
      name: 'Job Profitability Report', 
      description: 'Analyze profit margins per job, client, and department',
      icon: TrendingUp,
      phase: 'Phase 2'
    },
    { 
      name: 'Quote Conversion Analytics', 
      description: 'Track quote-to-job conversion rates and trends',
      icon: PieChart,
      phase: 'Phase 2'
    },
    { 
      name: 'Workshop Productivity', 
      description: 'Monitor job completion times and workshop efficiency',
      icon: BarChart3,
      phase: 'Phase 2'
    },
    { 
      name: 'Client Revenue Report', 
      description: 'Revenue breakdown by client with historical trends',
      icon: FileText,
      phase: 'Phase 2'
    },
    { 
      name: 'Monthly Management Pack', 
      description: 'Consolidated monthly report for management review',
      icon: Calendar,
      phase: 'Phase 2'
    },
    { 
      name: 'Outstanding Quotes Aging', 
      description: 'Track quotes pending approval with aging analysis',
      icon: Clock,
      phase: 'Phase 2'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Reports & Analytics</h4>
          <p className="text-muted mb-0">Business intelligence and reporting module</p>
        </div>
      </div>

      {/* Architecture Decision Banner */}
      <div className="card mb-4 border-primary">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-2">
                <BarChart3 size={32} className="text-primary me-3" />
                <div>
                  <h5 className="mb-1">Reporting Module</h5>
                  <p className="text-muted mb-0">Comprehensive business analytics and reporting</p>
                </div>
              </div>
              <div className="alert alert-info mb-0 mt-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Phase 2 Feature:</strong> The reporting module will provide real-time analytics, 
                custom report builder, and automated report scheduling. Currently, operational reports 
                can be exported from individual modules.
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="btn btn-outline-primary btn-lg" disabled>
                <Filter size={20} className="me-2" />
                Report Builder
              </button>
              <p className="text-muted mt-2 mb-0"><small>Coming in Phase 2</small></p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Capabilities */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">✅ Current Capabilities</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><span className="text-success me-2">✓</span> Export Job Cards to PDF</li>
                <li className="mb-2"><span className="text-success me-2">✓</span> View quote statistics on dashboard</li>
                <li className="mb-2"><span className="text-success me-2">✓</span> Job status tracking</li>
                <li className="mb-2"><span className="text-success me-2">✓</span> RFQ pipeline overview</li>
                <li className="mb-2"><span className="text-success me-2">✓</span> Financial totals on dashboard</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">🚀 Phase 2 Enhancements</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><span className="text-primary me-2">○</span> Custom report builder</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Scheduled report emails</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Excel/PDF export for all reports</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Dashboard customization</li>
                <li className="mb-2"><span className="text-primary me-2">○</span> Trend analysis & forecasting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Reports Grid */}
      <div className="card">
        <div className="card-header bg-light">
          <h6 className="mb-0">📊 Planned Reports</h6>
        </div>
        <div className="card-body">
          <div className="row">
            {plannedReports.map((report, index) => (
              <div key={index} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 border" style={{ opacity: 0.7 }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <report.icon size={24} className="text-secondary me-2" />
                      <h6 className="mb-0">{report.name}</h6>
                    </div>
                    <p className="text-muted small mb-2">{report.description}</p>
                    <span className="badge bg-secondary">{report.phase}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="card bg-light mt-4">
        <div className="card-body text-center">
          <p className="mb-2">
            <strong>"For which of you, intending to build a tower, does not sit down first and count the cost?"</strong>
          </p>
          <small className="text-muted">Luke 14:28</small>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;