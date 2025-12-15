// DepartmentWorkload.tsx - Department job distribution
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DepartmentData {
  name: string;
  jobs: number;
  color: string;
}

const DepartmentWorkload: React.FC = () => {
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs');
        const jobs = await response.json();

        // Count jobs by department
        const deptCounts: { [key: string]: number } = {};
        jobs.forEach((job: any) => {
          const dept = job.department || job.assignedDepartment || 'Unassigned';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        // Department colors
        const deptColors: { [key: string]: string } = {
          'Welding': '#667eea',
          'Fabrication': '#f093fb',
          'Assembly': '#4facfe',
          'Painting': '#43e97b',
          'Installation': '#fa709a',
          'Maintenance': '#feca57',
          'Quality Control': '#ee5a6f',
          'Unassigned': '#95afc0'
        };

        const chartData: DepartmentData[] = Object.entries(deptCounts)
          .map(([dept, count]) => ({
            name: dept,
            jobs: count,
            color: deptColors[dept] || '#6c757d'
          }))
          .sort((a, b) => b.jobs - a.jobs); // Sort by job count descending

        setData(chartData);
      } catch (error) {
        console.error('Error fetching department data:', error);
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

  const maxJobs = data.length > 0 ? Math.max(...data.map(d => d.jobs)) : 10;
  const busiestDept = data.length > 0 ? data[0] : null;
  const totalJobs = data.reduce((sum, d) => sum + d.jobs, 0);

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-bar-chart me-2 text-primary"></i>
          Department Workload
        </h5>

        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, maxJobs + 2]} />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip 
                formatter={(value: any) => [`${value} jobs`, 'Jobs']}
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="jobs" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-top">
          <div className="row text-center">
            <div className="col-4">
              <small className="text-muted d-block">Total Jobs</small>
              <h5 className="mb-0 text-primary">{totalJobs}</h5>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Departments</small>
              <h5 className="mb-0 text-info">{data.length}</h5>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Busiest</small>
              <h6 className="mb-0 text-truncate" title={busiestDept?.name}>
                {busiestDept?.name || '-'}
              </h6>
            </div>
          </div>
        </div>

        {busiestDept && busiestDept.jobs > totalJobs * 0.4 && (
          <div className="mt-2">
            <small className="text-warning">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {busiestDept.name} has {((busiestDept.jobs / totalJobs) * 100).toFixed(0)}% of workload - consider resource allocation
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentWorkload;
