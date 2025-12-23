import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container mt-4">
      <h1>ERHA Operations Dashboard</h1>
      <div className="row">
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
      </div>
    </div>
  );
};

export default Dashboard;
