import React from 'react';

const DocSign: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">
                <i className="bi bi-pen me-2"></i>
                Document Signing
              </h4>
            </div>
            <div className="card-body text-center py-5">
              <i className="bi bi-file-earmark-text display-1 text-muted mb-4"></i>
              <h3>Document Signing Module</h3>
              <p className="text-muted">Phase 2 Feature - Coming Soon</p>
              <div className="mt-4">
                <p className="text-muted small">
                  Digital document signing and approval workflows will be available in the next phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocSign;