import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Shield, AlertCircle } from 'lucide-react';

interface QualityMetrics {
  totalQualityCost: number;
  averageQualityPercentage: number;
  qualityCostByCategory: Array<{
    category: string;
    cost: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    qualityCost: number;
    safetyCost: number;
    complianceCost: number;
  }>;
  riskDistribution: Array<{
    risk: string;
    count: number;
    value: number;
  }>;
}

interface QualityCostAnalyticsProps {
  data: QualityMetrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const QualityCostAnalytics: React.FC<QualityCostAnalyticsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-quality-purple" />
          Quality Cost Analytics
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Quality Investment</p>
                <p className="text-2xl font-bold text-blue-900">
                  R{data.totalQualityCost?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Quality %</p>
                <p className="text-2xl font-bold text-green-900">
                  {data.averageQualityPercentage?.toFixed(1) || '0'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Risk Score</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.riskDistribution?.[0]?.value || 'Low'}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Monthly Quality Cost Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [\R\\, '']}
                  labelFormatter={(label) => \Month: \\}
                />
                <Bar dataKey="qualityCost" fill="#8884d8" name="Quality Cost" />
                <Bar dataKey="safetyCost" fill="#82ca9d" name="Safety Cost" />
                <Bar dataKey="complianceCost" fill="#ffc658" name="Compliance Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Cost Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Cost by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.qualityCostByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cost"
                    label={({ category, percentage }) => \\ (\%)\}
                  >
                    {data.qualityCostByCategory?.map((entry, index) => (
                      <Cell key={\cell-\\} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [\R\\, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              {data.riskDistribution?.map((risk, index) => (
                <div key={risk.risk} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className={\w-3 h-3 rounded-full mr-3\}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium text-gray-900">{risk.risk} Risk</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{risk.count}</div>
                    <div className="text-sm text-gray-500">quotes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
