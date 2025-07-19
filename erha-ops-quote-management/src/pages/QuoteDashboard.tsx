import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { QualityCostAnalytics } from '../components/quality-cost/QualityCostAnalytics';
import { SafetyRiskIndicator } from '../components/safety-assessment/SafetyRiskIndicator';

export const QuoteDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    dateRange: 'last_30_days',
    riskLevel: 'all'
  });

  const { 
    quotes, 
    quotesStats, 
    qualityMetrics,
    safetyMetrics,
    isLoading, 
    error 
  } = useQuotes(filters);

  const statCards = [
    {
      title: 'Total Quotes',
      value: quotesStats?.total || 0,
      icon: DollarSign,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pending Approval',
      value: quotesStats?.pendingApproval || 0,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Quality Score',
      value: \\%\,
      icon: Shield,
      color: 'bg-green-500',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Risk Assessment',
      value: safetyMetrics?.averageRisk || 'Low',
      icon: AlertTriangle,
      color: 'bg-purple-500',
      change: 'Stable',
      changeType: 'neutral'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-erha-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Quotes</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Management</h1>
          <p className="text-gray-600">Manage quotes with quality cost integration & safety assessment</p>
        </div>
        <button
          className="bg-erha-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = '/quotes/new'}
        >
          Create New Quote
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={\	ext-sm \\}>
                  {stat.change}
                </p>
              </div>
              <div className={\\ p-3 rounded-lg\}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quality Cost Analytics */}
      <QualityCostAnalytics data={qualityMetrics} />

      {/* Filters */}
      <QuoteFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Safety Risk Overview */}
      <SafetyRiskIndicator metrics={safetyMetrics} />

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Quotes</h2>
        </div>
        <QuoteTable quotes={quotes} />
      </div>
    </div>
  );
};
