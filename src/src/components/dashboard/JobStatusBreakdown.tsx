// JobStatusBreakdown.tsx - Visual job status distribution
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface JobStatusData {
  name: string;
  value: number;
  color: string;
}

const JobStatusBreakdown: React.FC = () => {
  const [data, setData] = useState<JobStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs');
        const jobs = await response.json();

        // Count jobs by status
        const statusCounts: { [key: string]: number } = {};
        jobs.forEach((job: any) => {
          const status = job.jobStatus || job.status || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Color mapping for different statuses
        const statusColors: { [key: string]: string } = {
          'Active': '#28a745',
          'ACTIVE': '#28a745',
          'Completed': '#007bff',
          'COMPLETED': '#007bff',
          'On Hold': '#ffc107',
          'ON_HOLD': '#ffc107',
          'Emergency': '#dc3545',
          'EMERGENCY': '#dc3545',
          'Pending': '#6c757d',
          'PENDING': '#6c757d',
          'In Progress': '#17a2b8',
          'IN_PROGRESS': '#17a2b8'
        };

        const chartData: JobStatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
          color: statusColors[status] || '#6c757d'
        }));

        setData(chartData);
        setTotal(jobs.length);
      } catch (error) {
        console.error('Error fetching job status data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-pie-chart me-2 text-primary"></i>
          Job Status Distribution
        </h5>

        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} jobs`, 'Count']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted d-block">Total Jobs</small>
              <h4 className="mb-0 text-primary">{total}</h4>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Most Common</small>
              <h6 className="mb-0">{data.length > 0 ? data[0].name : '-'}</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatusBreakdown;
