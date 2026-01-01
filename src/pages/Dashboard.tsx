import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">RFQs</h5>
              <p className="text-muted">Manage requests for quotation</p>
              <Link to="/rfq" className="btn btn-outline-primary btn-sm">
                View RFQs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Jobs</h5>
              <p className="text-muted">Manage production jobs</p>
              <Link to="/jobs" className="btn btn-outline-success btn-sm">
                View Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Clients</h5>
              <p className="text-muted">Manage client information</p>
              <Link to="/clients" className="btn btn-outline-info btn-sm">
                View Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;