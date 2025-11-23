// RFQConversionFunnel.tsx - Sales funnel analytics
import React, { useEffect, useState } from 'react';

interface FunnelData {
  totalRfqs: number;
  rfqsWithQuotes: number;
  quotesWithJobs: number;
}

const RFQConversionFunnel: React.FC = () => {
  const [data, setData] = useState<FunnelData>({
    totalRfqs: 0,
    rfqsWithQuotes: 0,
    quotesWithJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch RFQs, Quotes, and Jobs
        const [rfqsRes, quotesRes, jobsRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/rfqs?page=0&size=1000'),
          fetch('http://localhost:8080/api/v1/quotes'),
          fetch('http://localhost:8080/api/v1/jobs')
        ]);

        const rfqs = await rfqsRes.json();
        const quotes = await quotesRes.json();
        const jobs = await jobsRes.json();

        // Calculate funnel metrics
        const totalRfqs = rfqs.content?.length || 0;
        const rfqsWithQuotes = new Set(quotes.map((q: any) => q.rfqId)).size;
        const quotesWithJobs = new Set(jobs.map((j: any) => j.quoteId).filter((id: any) => id)).size;

        setData({
          totalRfqs,
          rfqsWithQuotes,
          quotesWithJobs
        });
      } catch (error) {
        console.error('Error fetching funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm" style={{ height: '100%' }}>
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const quoteConversionRate = data.totalRfqs > 0 
    ? Math.round((data.rfqsWithQuotes / data.totalRfqs) * 100) 
    : 0;
  
  const jobConversionRate = data.rfqsWithQuotes > 0 
    ? Math.round((data.quotesWithJobs / data.rfqsWithQuotes) * 100) 
    : 0;

  const overallConversionRate = data.totalRfqs > 0 
    ? Math.round((data.quotesWithJobs / data.totalRfqs) * 100) 
    : 0;

  return (
    <div className="card shadow-sm" style={{ height: '100%' }}>
      <div className="card-body">
        <h5 className="card-title mb-4">
          <i className="bi bi-funnel me-2 text-primary"></i>
          RFQ Conversion Funnel
        </h5>

        {/* Funnel Visualization */}
        <div className="position-relative" style={{ minHeight: '320px' }}>
          
          {/* Stage 1: RFQs */}
          <div className="mb-3">
            <div 
              className="d-flex align-items-center justify-content-between p-3 rounded"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Total RFQs</div>
                <div className="fs-4 fw-bold">{data.totalRfqs}</div>
              </div>
              <i className="bi bi-inbox fs-1" style={{ opacity: 0.3 }}></i>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="text-center my-2">
            <i className="bi bi-arrow-down fs-4 text-muted"></i>
            <div className="badge bg-light text-dark ms-2">{quoteConversionRate}% convert</div>
          </div>

          {/* Stage 2: Quotes */}
          <div className="mb-3" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <div 
              className="d-flex align-items-center justify-content-between p-3 rounded"
              style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Quotes Generated</div>
                <div className="fs-4 fw-bold">{data.rfqsWithQuotes}</div>
              </div>
              <i className="bi bi-file-earmark-text fs-1" style={{ opacity: 0.3 }}></i>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="text-center my-2">
            <i className="bi bi-arrow-down fs-4 text-muted"></i>
            <div className="badge bg-light text-dark ms-2">{jobConversionRate}% convert</div>
          </div>

          {/* Stage 3: Jobs */}
          <div style={{ paddingLeft: '40px', paddingRight: '40px' }}>
            <div 
              className="d-flex align-items-center justify-content-between p-3 rounded"
              style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}
            >
              <div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Jobs Created</div>
                <div className="fs-4 fw-bold">{data.quotesWithJobs}</div>
              </div>
              <i className="bi bi-hammer fs-1" style={{ opacity: 0.3 }}></i>
            </div>
          </div>

        </div>

        {/* Overall Conversion */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted d-block">Overall Conversion Rate</small>
              <div className="fs-5 fw-bold text-primary">
                {overallConversionRate}%
                {overallConversionRate >= 50 && <i className="bi bi-arrow-up-right text-success ms-2"></i>}
                {overallConversionRate < 50 && overallConversionRate >= 30 && <i className="bi bi-dash text-warning ms-2"></i>}
                {overallConversionRate < 30 && <i className="bi bi-arrow-down-right text-danger ms-2"></i>}
              </div>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Lost Opportunities</small>
              <div className="fs-6 fw-bold text-danger">{data.totalRfqs - data.quotesWithJobs}</div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-lightbulb me-1"></i>
            {quoteConversionRate >= 70 && 'Excellent quote conversion! '}
            {quoteConversionRate < 70 && quoteConversionRate >= 50 && 'Good quote conversion. '}
            {quoteConversionRate < 50 && 'Consider improving RFQ qualification. '}
            {jobConversionRate >= 70 && 'Strong closing rate!'}
            {jobConversionRate < 70 && jobConversionRate >= 50 && 'Good closing rate.'}
            {jobConversionRate < 50 && 'Focus on quote quality and pricing.'}
          </small>
        </div>

      </div>
    </div>
  );
};

export default RFQConversionFunnel;
