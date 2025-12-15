import React from 'react';
import { Package, ExternalLink, AlertCircle, CheckCircle, FileText, TrendingUp } from 'lucide-react';

const InventoryPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Inventory Management</h4>
          <p className="text-muted mb-0">Integrated with Pastel Accounting</p>
        </div>
      </div>

      {/* Integration Status Card */}
      <div className="card mb-4 border-primary">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-3">
                <Package size={48} className="text-primary me-3" />
                <div>
                  <h5 className="mb-1">Pastel Accounting Integration</h5>
                  <p className="text-muted mb-0">
                    Inventory management is handled through Pastel Accounting system
                  </p>
                </div>
              </div>
              <div className="alert alert-info mb-0">
                <AlertCircle size={18} className="me-2" />
                <strong>Architecture Decision:</strong> ERHA OPS integrates with existing Pastel 
                inventory rather than duplicating functionality. This ensures single source of truth 
                for stock levels, purchasing, and financial integration.
              </div>
            </div>
            <div className="col-md-4 text-center">
              <button className="btn btn-primary btn-lg w-100 mb-2" disabled>
                <ExternalLink size={20} className="me-2" />
                Open Pastel Inventory
              </button>
              <small className="text-muted">Integration Point</small>
            </div>
          </div>
        </div>
      </div>

      {/* Current Integration Features */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <CheckCircle size={18} className="text-success me-2" />
                Current Capabilities
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Stock levels managed in Pastel
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Purchasing through Pastel
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Financial integration maintained
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Single source of truth for inventory
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  Existing workflows preserved
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <TrendingUp size={18} className="text-info me-2" />
                Phase 2 Enhancements
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <AlertCircle size={16} className="text-info me-2" />
                  Material requisition forms from job cards
                </li>
                <li className="mb-2">
                  <AlertCircle size={16} className="text-info me-2" />
                  Real-time stock availability checks
                </li>
                <li className="mb-2">
                  <AlertCircle size={16} className="text-info me-2" />
                  Automated material costing per job
                </li>
                <li className="mb-2">
                  <AlertCircle size={16} className="text-info me-2" />
                  Bill of Materials (BOM) generation
                </li>
                <li className="mb-2">
                  <AlertCircle size={16} className="text-info me-2" />
                  Pastel API integration for live data
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Material Requisition Process */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <FileText size={18} className="me-2" />
            Material Requisition Workflow
          </h6>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light mb-2">
                <h3 className="text-primary mb-2">1</h3>
                <strong>Job Card Created</strong>
                <p className="text-muted small mt-2 mb-0">Materials list defined in ERHA OPS</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light mb-2">
                <h3 className="text-info mb-2">2</h3>
                <strong>Check Pastel</strong>
                <p className="text-muted small mt-2 mb-0">Workshop checks stock availability</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light mb-2">
                <h3 className="text-warning mb-2">3</h3>
                <strong>Requisition</strong>
                <p className="text-muted small mt-2 mb-0">Materials requested from stores</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light mb-2">
                <h3 className="text-success mb-2">4</h3>
                <strong>Issue & Record</strong>
                <p className="text-muted small mt-2 mb-0">Issued in Pastel, linked to job</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <Package size={48} className="text-muted mb-3" />
              <h6>Stock Levels</h6>
              <p className="text-muted small mb-3">View current inventory in Pastel</p>
              <button className="btn btn-outline-primary w-100" disabled>
                Open Pastel
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <FileText size={48} className="text-muted mb-3" />
              <h6>Material Requisitions</h6>
              <p className="text-muted small mb-3">Request materials for jobs</p>
              <button className="btn btn-outline-secondary w-100" disabled>
                Phase 2 Feature
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <TrendingUp size={48} className="text-muted mb-3" />
              <h6>Usage Reports</h6>
              <p className="text-muted small mb-3">Material consumption by job</p>
              <button className="btn btn-outline-secondary w-100" disabled>
                Phase 2 Feature
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="card bg-light mt-4">
        <div className="card-body text-center">
          <p className="mb-2">
            <strong>"The plans of the diligent lead to profit as surely as haste leads to poverty."</strong>
          </p>
          <small className="text-muted">Proverbs 21:5</small>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;