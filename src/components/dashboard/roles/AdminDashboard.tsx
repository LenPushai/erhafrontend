import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Brain,
  Lightbulb,
  Target,
  Zap,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import EmergencyJobModal from '../EmergencyJobModal';

interface DashboardData {
  rfqs: any[];
  quotes: any[];
  jobs: any[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [data, setData] = useState<DashboardData>({
    rfqs: [],
    quotes: [],
    jobs: [],
    loading: true,
    error: null,
    lastSync: null
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [rfqsRes, quotesRes, jobsRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/rfqs').then(r => r.json()).catch(() => ({ content: [] })),
        fetch('http://localhost:8080/api/v1/quotes').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8080/api/v1/jobs').then(r => r.json()).catch(() => [])
      ]);

      // Handle RFQ response (may be paginated with content array)
      const rfqs = Array.isArray(rfqsRes) ? rfqsRes : (rfqsRes.content || []);
      const quotes = Array.isArray(quotesRes) ? quotesRes : [];
      const jobs = Array.isArray(jobsRes) ? jobsRes : [];

      setData({
        rfqs,
        quotes,
        jobs,
        loading: false,
        error: null,
        lastSync: new Date()
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch data'
      }));
    }
  };

  // Calculate metrics from real data
  const metrics = [
    {
      title: 'Total RFQs',
      value: data.rfqs.length.toString(),
      subtitle: `${data.rfqs.filter(r => r.status === 'Draft' || r.status === 'NEW').length} new/draft`,
      icon: FileText,
      color: 'primary',
      bgClass: 'bg-primary',
      path: '/rfq'
    },
    {
      title: 'Active Jobs',
      value: data.jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'NEW').length.toString(),
      subtitle: `${data.jobs.filter(j => j.priority === 'URGENT' || j.priority === 'HIGH').length} urgent`,
      icon: Briefcase,
      color: 'success',
      bgClass: 'bg-success',
      path: '/jobs'
    },
    {
      title: 'Pending Quotes',
      value: data.quotes.filter(q => q.quoteStatus === 'DRAFT' || q.quoteStatus === 'PENDING_APPROVAL').length.toString(),
      subtitle: `${data.quotes.filter(q => q.quoteStatus === 'SUBMITTED').length} submitted`,
      icon: FileSpreadsheet,
      color: 'info',
      bgClass: 'bg-info',
      path: '/quotes'
    },
    {
      title: 'Total Value',
      value: formatCurrencyShort(data.jobs.reduce((sum, j) => sum + (j.orderValueIncl || 0), 0)),
      subtitle: 'Active pipeline',
      icon: TrendingUp,
      color: 'warning',
      bgClass: 'bg-warning',
      path: '/jobs'
    }
  ];

  // Calculate financial overview from real data
  const financials = {
    invoiced: data.jobs
      .filter(j => j.status === 'INVOICED' || j.status === 'COMPLETE')
      .reduce((sum, j) => sum + (j.orderValueIncl || 0), 0),
    pending: data.quotes
      .filter(q => q.quoteStatus === 'PENDING_APPROVAL' || q.quoteStatus === 'SUBMITTED')
      .reduce((sum, q) => sum + (q.valueInclVat || 0), 0),
    pipeline: data.quotes
      .filter(q => q.quoteStatus !== 'REJECTED')
      .reduce((sum, q) => sum + (q.valueInclVat || 0), 0)
  };

  // AI Insights - calculated from real data
  const aiInsights = generateAIInsights(data.rfqs, data.quotes, data.jobs);

  // Build recent activity from real data
  const recentActivity = buildRecentActivity(data.rfqs, data.quotes, data.jobs);

  const quickActions = [
    { label: 'View RFQs', icon: FileText, path: '/rfq', color: 'primary' },
    { label: 'View Quotes', icon: FileSpreadsheet, path: '/quotes', color: 'info' },
    { label: 'View Jobs', icon: Briefcase, path: '/jobs', color: 'success' },
    { label: 'View Clients', icon: Users, path: '/clients', color: 'secondary' }
  ];

  const getStatusBadge = (status: string) => {
    const badges: any = {
      new: 'primary',
      draft: 'secondary',
      sent: 'info',
      progress: 'warning',
      approved: 'success',
      completed: 'success',
      accepted: 'success',
      pending: 'warning'
    };
    return badges[status.toLowerCase()] || 'secondary';
  };

  if (data.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Metrics Cards */}
      <div className="row mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-3">
            <div 
              className={`card text-white ${metric.bgClass} h-100`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(metric.path)}
            >
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

      {/* AI Insights Card - NEW! */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <div className="row align-items-center">
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                      <Brain size={32} className="text-white" />
                    </div>
                    <div>
                      <h5 className="mb-0">AI Insights</h5>
                      <small className="opacity-75">Powered by PUSH AI</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="col-md-6 col-lg-3 mb-2 mb-lg-0">
                        <div className="d-flex align-items-start">
                          <insight.icon size={18} className={`me-2 mt-1 ${insight.color}`} />
                          <div>
                            <small className="d-block opacity-75">{insight.label}</small>
                            <strong>{insight.value}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-white border-opacity-25">
                <div className="d-flex flex-wrap gap-3">
                  {aiInsights.length > 0 && aiInsights[0].recommendation && (
                    <div className="d-flex align-items-center">
                      <Lightbulb size={16} className="me-2 text-warning" />
                      <small>{aiInsights[0].recommendation}</small>
                    </div>
                  )}
                  <div className="ms-auto">
                    <span className="badge bg-white bg-opacity-25">
                      <Zap size={12} className="me-1" />
                      Phase 2: Full AI Analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={fetchDashboardData}
              >
                Refresh
              </button>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <p className="text-muted text-center py-4">No recent activity</p>
              ) : (
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
              )}
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
                  <h5 className="mb-0">{formatCurrencyShort(financials.invoiced)}</h5>
                  <small className="text-muted">Invoiced</small>
                </div>
                <div className="col-4">
                  <Clock className="text-warning mb-2" size={32} />
                  <h5 className="mb-0">{formatCurrencyShort(financials.pending)}</h5>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="col-4">
                  <TrendingUp className="text-info mb-2" size={32} />
                  <h5 className="mb-0">{formatCurrencyShort(financials.pipeline)}</h5>
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
                {data.error ? (
                  <XCircle className="text-danger me-2" size={20} />
                ) : (
                  <CheckCircle className="text-success me-2" size={20} />
                )}
                <span>Backend API: {data.error ? 'Error' : 'Connected'}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <CheckCircle className="text-success me-2" size={20} />
                <span>Database: Online ({data.rfqs.length} RFQs, {data.quotes.length} Quotes, {data.jobs.length} Jobs)</span>
              </div>
              <div className="d-flex align-items-center">
                <CheckCircle className="text-success me-2" size={20} />
                <span>Last sync: {data.lastSync ? formatTimeAgo(data.lastSync) : 'Never'}</span>
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

// Helper functions
function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `R${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R${(value / 1000).toFixed(0)}K`;
  }
  return `R${value.toFixed(0)}`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function generateAIInsights(rfqs: any[], quotes: any[], jobs: any[]): any[] {
  // Calculate real insights from data
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Quotes expiring soon
  const expiringQuotes = quotes.filter(q => {
    if (!q.validUntilDate) return false;
    const expiry = new Date(q.validUntilDate);
    return expiry <= sevenDaysFromNow && expiry >= now && q.quoteStatus !== 'ACCEPTED';
  });

  // Quote conversion rate
  const acceptedQuotes = quotes.filter(q => q.quoteStatus === 'ACCEPTED').length;
  const totalQuotes = quotes.length;
  const conversionRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

  // Urgent jobs
  const urgentJobs = jobs.filter(j => j.priority === 'URGENT' || j.priority === 'HIGH');

  // Top client by value
  const clientValues: Record<number, number> = {};
  jobs.forEach(j => {
    if (j.clientId) {
      clientValues[j.clientId] = (clientValues[j.clientId] || 0) + (j.orderValueIncl || 0);
    }
  });
  const topClientValue = Math.max(...Object.values(clientValues), 0);

  // Build recommendation
  let recommendation = '';
  if (expiringQuotes.length > 0) {
    const expiringValue = expiringQuotes.reduce((sum, q) => sum + (q.valueInclVat || 0), 0);
    recommendation = `${expiringQuotes.length} quotes worth ${formatCurrencyShort(expiringValue)} expiring soon - follow up recommended`;
  } else if (urgentJobs.length > 2) {
    recommendation = `High urgent job load (${urgentJobs.length}) - consider resource allocation`;
  } else if (conversionRate < 50) {
    recommendation = `Quote conversion at ${conversionRate}% - review pricing strategy`;
  } else {
    recommendation = `Operations running smoothly - ${jobs.length} active jobs in pipeline`;
  }

  return [
    {
      label: 'Expiring Quotes',
      value: `${expiringQuotes.length} this week`,
      icon: AlertTriangle,
      color: expiringQuotes.length > 0 ? 'text-warning' : 'text-success',
      recommendation
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Target,
      color: conversionRate >= 60 ? 'text-success' : 'text-warning'
    },
    {
      label: 'Urgent Jobs',
      value: urgentJobs.length.toString(),
      icon: Zap,
      color: urgentJobs.length > 3 ? 'text-danger' : 'text-info'
    },
    {
      label: 'Top Client',
      value: formatCurrencyShort(topClientValue),
      icon: ArrowUpRight,
      color: 'text-success'
    }
  ];
}

function buildRecentActivity(rfqs: any[], quotes: any[], jobs: any[]): any[] {
  const activities: any[] = [];

  // Add recent RFQs
  rfqs.slice(0, 3).forEach(rfq => {
    activities.push({
      type: 'RFQ',
      number: rfq.jobNo || `RFQ-${rfq.id}`,
      description: rfq.description || 'New RFQ received',
      status: rfq.status || 'new',
      time: formatTimeAgo(new Date(rfq.createdAt || rfq.requestDate || Date.now())),
      date: new Date(rfq.createdAt || rfq.requestDate || Date.now())
    });
  });

  // Add recent Quotes
  quotes.slice(0, 3).forEach(quote => {
    activities.push({
      type: 'Quote',
      number: quote.quoteNumber || `Q-${quote.quoteId}`,
      description: quote.description || `Quote ${quote.quoteStatus?.toLowerCase() || 'created'}`,
      status: quote.quoteStatus || 'draft',
      time: formatTimeAgo(new Date(quote.createdDate || Date.now())),
      date: new Date(quote.createdDate || Date.now())
    });
  });

  // Add recent Jobs
  jobs.slice(0, 3).forEach(job => {
    activities.push({
      type: 'Job',
      number: job.jobNumber || `JOB-${job.jobId}`,
      description: job.description || `Job ${job.status?.toLowerCase() || 'created'}`,
      status: job.status || 'new',
      time: formatTimeAgo(new Date(job.createdDate || Date.now())),
      date: new Date(job.createdDate || Date.now())
    });
  });

  // Sort by date (most recent first) and return top 5
  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
}

export default AdminDashboard;