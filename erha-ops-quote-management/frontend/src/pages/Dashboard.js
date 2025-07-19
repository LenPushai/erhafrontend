import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaQuoteRight, FaDollarSign, FaCheckCircle, FaClock } from 'react-icons/fa';
import { quoteService } from '../services/quoteService';

/**
 * 📊 Dashboard Component
 * Quote Management overview and key metrics
 */
const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await quoteService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 text-primary mb-0">
            💰 Quote Management Dashboard
          </h1>
          <p className="lead text-muted">
            Professional quote creation, approval, and client communication
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaQuoteRight className="fa-3x text-primary mb-3" />
              <h2 className="fw-bold text-primary">
                {analytics?.totalQuotes || 0}
              </h2>
              <p className="text-muted mb-0">Total Quotes</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaDollarSign className="fa-3x text-success mb-3" />
              <h2 className="fw-bold text-success">
                R{analytics?.totalApprovedValue?.toLocaleString() || '0'}
              </h2>
              <p className="text-muted mb-0">Approved Value</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCheckCircle className="fa-3x text-info mb-3" />
              <h2 className="fw-bold text-info">
                {analytics?.statusCounts?.APPROVED || 0}
              </h2>
              <p className="text-muted mb-0">Approved Quotes</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaClock className="fa-3x text-warning mb-3" />
              <h2 className="fw-bold text-warning">
                {analytics?.statusCounts?.UNDER_REVIEW || 0}
              </h2>
              <p className="text-muted mb-0">Under Review</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📊 Quote Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {analytics?.statusCounts && Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">{status.replace('_', ' ')}</span>
                  <span className="badge bg-secondary">{count}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">🎯 Priority Distribution</h5>
            </Card.Header>
            <Card.Body>
              {analytics?.priorityCounts && Object.entries(analytics.priorityCounts).map(([priority, count]) => (
                <div key={priority} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">{priority}</span>
                  <span className="badge bg-secondary">{count}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Alert variant="info" className="text-center">
            <h4 className="alert-heading">🚀 Quote Management System Ready!</h4>
            <p className="mb-0">
              Professional quote creation, approval, and client communication with quality assurance costing.
              Start creating quotes with integrated safety and quality cost tracking.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
