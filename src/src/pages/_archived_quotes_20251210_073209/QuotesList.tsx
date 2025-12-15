import React, { useState, useEffect } from 'react';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { quoteService } from '../../services/quoteService';
import type { Quote } from '../../services/quoteService';
import StatusBadge from '../../components/common/StatusBadge';
import type { QuoteStatus } from '../../components/common/StatusBadge';

const QuotesList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ðŸ†• PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  // ðŸ†• Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const data = await quoteService.getAllQuotes();
      setQuotes(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching quotes:', err);
      setError(err.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
          (quote) =>
              quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              quote.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((quote) => quote.quoteStatus === statusFilter);
    }

    setFilteredQuotes(filtered);
  };

  // ðŸ†• PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = filteredQuotes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container-fluid py-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Quotes</h4>
            <p>{error}</p>
            <hr />
            <button className="btn btn-outline-danger" onClick={fetchQuotes}>
              Try Again
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Quotes</h2>
            <p className="text-muted mb-0">
              Manage and track all quotations
            </p>
          </div>
          <Link to="/quotes/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            New Quote
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label small text-muted mb-1">Search</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Search by quote number, description, or client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted mb-1">Status</label>
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="NEEDS_REVISION">Needs Revision</option>
                  <option value="SENT_TO_CLIENT">Sent to Client</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {/* ðŸ†• ITEMS PER PAGE SELECTOR */}
              <div className="col-md-2">
                <label className="form-label small text-muted mb-1">Show</label>
                <select
                    className="form-select"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                    }}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </button>
              </div>
            </div>
            {/* ðŸ†• SHOWING INFO */}
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredQuotes.length)} of {filteredQuotes.length} quotes
                  {filteredQuotes.length !== quotes.length && ` (filtered from ${quotes.length} total)`}
                </span>
                <span className="badge bg-primary">
                  Total Value: {formatCurrency(filteredQuotes.reduce((sum, q) => sum + (q.valueInclVat || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Quotes</h6>
                    <h3 className="mb-0">{quotes.length}</h3>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-file-earmark-text fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Accepted</h6>
                    <h3 className="mb-0">
                      {quotes.filter((q) => q.quoteStatus === 'ACCEPTED').length}
                    </h3>
                  </div>
                  <div className="text-success">
                    <i className="bi bi-check-circle fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Sent</h6>
                    <h3 className="mb-0">
                      {quotes.filter((q) => q.quoteStatus === 'SENT_TO_CLIENT').length}
                    </h3>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-send fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-secondary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Draft</h6>
                    <h3 className="mb-0">
                      {quotes.filter((q) => q.quoteStatus === 'DRAFT').length}
                    </h3>
                  </div>
                  <div className="text-secondary">
                    <i className="bi bi-file-earmark fs-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div className="card">
          <div className="card-body">
            {filteredQuotes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No quotes found</p>
                </div>
            ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                    <tr>
                      <th>Quote Number</th>
                      <th>Description</th>
                      <th>Client</th>
                      <th>Value (Incl VAT)</th>
                      <th>Quote Date</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>RFQ/Job</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* ðŸ†• USING currentQuotes INSTEAD OF filteredQuotes */}
                    {currentQuotes.map((quote) => (
                        <tr key={quote.quoteId}>
                          <td>
                            <Link
                                to={`/quotes/${quote.quoteId}`}
                                className="text-decoration-none fw-bold"
                            >
                              {quote.quoteNumber}
                            </Link>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {quote.description || 'N/A'}
                            </div>
                          </td>
                          <td>{quote.clientName || 'N/A'}</td>
                          <td>{formatCurrency(quote.valueInclVat || 0)}</td>
                          <td>{formatDate(quote.quoteDate)}</td>
                          <td>{formatDate(quote.validUntilDate)}</td>
                          <td>
                            <StatusBadge status={quote.quoteStatus as QuoteStatus} />
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {quote.rfqId && (
                                  <Link
                                      to={`/rfq/${quote.rfqId}`}
                                      className="badge bg-secondary text-decoration-none"
                                  >
                                    RFQ #{quote.rfqId}
                                  </Link>
                              )}
                              {quote.jobId && (
                                  <Link
                                      to={`/jobs/${quote.jobId}`}
                                      className="badge bg-success text-decoration-none"
                                  >
                                    Job #{quote.jobId}
                                  </Link>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                  to={`/quotes/${quote.quoteId}`}
                                  className="btn btn-outline-primary"
                                  title="View Details"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              {quote.quoteStatus === 'DRAFT' && (
                                  <Link
                                      to={`/quotes/${quote.quoteId}/edit`}
                                      className="btn btn-outline-secondary"
                                      title="Edit"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>

          {/* ðŸ†• PAGINATION CONTROLS */}
          {filteredQuotes.length > 0 && totalPages > 1 && (
              <div className="card-footer">
                <nav>
                  <ul className="pagination pagination-sm justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i> Previous
                      </button>
                    </li>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2);

                      if (!showPage) {
                        // Show ellipsis
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                              <li key={page} className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                          );
                        }
                        return null;
                      }

                      return (
                          <li
                              key={page}
                              className={`page-item ${currentPage === page ? 'active' : ''}`}
                          >
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                      );
                    })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                      >
                        Next <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
          )}
        </div>
      </div>
  );
};

export default QuotesList;