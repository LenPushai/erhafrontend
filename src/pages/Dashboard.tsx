import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <h1>ERHA Operations Dashboard</h1>
          <p className="text-muted">Welcome to the ERHA Operations Management System</p>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">RFQs</h5>
              <p className="text-muted">Manage requests for quotation</p>
              <Link to="/rfqs" className="btn btn-outline-primary btn-sm">
                View RFQs
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quotes</h5>
              <p className="text-muted">Manage quotations</p>
              <Link to="/quotes" className="btn btn-outline-info btn-sm">
                View Quotes
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Jobs</h5>
              <p className="text-muted">Manage active jobs</p>
              <Link to="/jobs" className="btn btn-outline-success btn-sm">
                View Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
