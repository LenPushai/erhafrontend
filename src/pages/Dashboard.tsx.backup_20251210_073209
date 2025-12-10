import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h2>
          <p className="text-muted">Welcome to ERHA Operations Management System</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">RFQs</h5>
                <i className="bi bi-file-earmark-text fs-2 text-primary"></i>
              </div>
              <p className="text-muted">Manage quote requests</p>
              <Link to="/rfqs" className="btn btn-outline-primary btn-sm">
                View RFQs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Quotes</h5>
                <i className="bi bi-file-earmark-check fs-2 text-info"></i>
              </div>
              <p className="text-muted">Manage quotations</p>
              <Link to="/quotes" className="btn btn-outline-info btn-sm">
                View Quotes
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Jobs</h5>
                <i className="bi bi-briefcase fs-2 text-success"></i>
              </div>
              <p className="text-muted">Track active jobs</p>
              <Link to="/jobs" className="btn btn-outline-success btn-sm">
                View Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Clients</h5>
                <i className="bi bi-people fs-2 text-warning"></i>
              </div>
              <p className="text-muted">Manage clients</p>
              <Link to="/clients" className="btn btn-outline-warning btn-sm">
                View Clients
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/rfqs/create" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create RFQ
                </Link>
                <Link to="/quotes/create" className="btn btn-info">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Quote
                </Link>
                <Link to="/clients/create" className="btn btn-warning">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Client
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;