import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface RFQ {
  id: number;
  jobNo: string;
  clientId: number | null;
  clientName?: string;
  entity: string;
  contact: string;
  description: string | null;
  status: string;
  priority: string;
  estimatedValue: number;
  requestDate: string;
  requiredDate: string;
  createdAt: string;
}

type SortField = 'jobNo' | 'clientName' | 'status' | 'priority' | 'estimatedValue' | 'requestDate' | 'requiredDate';
type SortDirection = 'asc' | 'desc';

const RFQList: React.FC = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('requestDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const itemsPerPage = 20;

  React.useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/rfqs');
      const rawRfqs = response.data.content || [];

      const mappedRfqs = rawRfqs.map((rfq: any) => ({
        id: rfq.id,
        jobNo: rfq.jobNo || 'N/A',
        clientId: rfq.clientId || rfq.client || null,
        clientName: `Client ${rfq.clientId || rfq.client || 'Unknown'}`,
        entity: rfq.entity || rfq.operatingEntity || 'ERHA FC',
        contact: rfq.contact || rfq.contactPerson || 'Not specified',
        description: rfq.description || 'No description',
        status: rfq.status || 'Draft',
        priority: rfq.priority || 'Medium',
        estimatedValue: rfq.estimatedValue || 0,
        requestDate: rfq.requestDate || rfq.createdAt,
        requiredDate: rfq.requiredDate || rfq.createdAt,
        createdAt: rfq.createdAt
      }));

      setRfqs(mappedRfqs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalValue = rfqs.reduce((sum, rfq) => sum + (rfq.estimatedValue || 0), 0);
    const statusCounts = rfqs.reduce((acc, rfq) => {
      acc[rfq.status] = (acc[rfq.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = rfqs.reduce((acc, rfq) => {
      acc[rfq.priority] = (acc[rfq.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: rfqs.length,
      totalValue,
      draft: statusCounts['Draft'] || 0,
      pending: statusCounts['Pending Clarification'] || 0,
      approved: statusCounts['Ready for Quote'] || 0,
      completed: statusCounts['Completed'] || 0,
      urgent: priorityCounts['Urgent'] || 0,
      high: priorityCounts['High'] || 0,
      avgValue: rfqs.length > 0 ? totalValue / rfqs.length : 0
    };
  }, [rfqs]);

  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { class: string } } = {
      'Draft': { class: 'bg-secondary text-white' },
      'Pending Clarification': { class: 'bg-warning text-dark' },
      'Under Review': { class: 'bg-info text-white' },
      'Ready for Quote': { class: 'bg-primary text-white' },
      'Quoted': { class: 'bg-success text-white' },
      'Completed': { class: 'bg-success text-white' },
      'Won': { class: 'bg-success text-white' },
      'Lost': { class: 'bg-danger text-white' }
    };
    return configs[status] || configs['Draft'];
  };

  const getPriorityConfig = (priority: string) => {
    const configs: { [key: string]: { class: string } } = {
      'Low': { class: 'bg-info text-white' },
      'Medium': { class: 'bg-warning text-dark' },
      'High': { class: 'bg-orange text-white' },
      'Urgent': { class: 'bg-danger text-white' }
    };
    return configs[priority] || configs['Medium'];
  };

  const canExport = (status: string) => {
    return ['Ready for Quote', 'Quoted', 'Completed'].includes(status);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRfqs = useMemo(() => {
    let filtered = rfqs.filter(rfq => {
      const jobNo = rfq.jobNo || '';
      const clientName = rfq.clientName || '';
      const description = rfq.description || '';
      const contact = rfq.contact || '';

      const matchesSearch =
          jobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || rfq.priority === priorityFilter;
      const matchesEntity = entityFilter === 'all' || rfq.entity === entityFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesEntity;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'estimatedValue') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rfqs, searchTerm, statusFilter, priorityFilter, entityFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedRfqs.length / itemsPerPage);
  const paginatedRfqs = filteredAndSortedRfqs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedRfqs.map(rfq => rfq.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportToPastel = async (rfqId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/export/pastel/rfqs/${rfqId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PASTEL_RFQ_${rfqId}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('RFQ exported to Pastel CSV successfully!');
    } catch (error) {
      console.error('Error exporting RFQ:', error);
      alert('Failed to export RFQ');
    }
  };

  const handleBulkExport = async () => {
    const exportableIds = Array.from(selectedIds).filter(id => {
      const rfq = rfqs.find(r => r.id === id);
      return rfq && canExport(rfq.status);
    });

    if (exportableIds.length === 0) {
      alert('No exportable RFQs selected.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/export/pastel/rfqs/bulk',
          { rfqIds: exportableIds },
          { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PASTEL_RFQS_BULK_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert(`${exportableIds.length} RFQ(s) exported successfully!`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error exporting RFQs:', error);
      alert('Failed to export RFQs');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <span className="ms-1">↑</span> : <span className="ms-1">↓</span>;
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-semibold text-secondary">Loading RFQs...</p>
          </div>
        </div>
    );
  }

  return (
      <div>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">RFQ Dashboard</h1>
            <p className="text-muted mb-0">Request for Quotation Management System</p>
          </div>
          <button onClick={() => navigate('/rfq/create')} className="btn btn-primary">
            <span className="me-2">+</span> New RFQ
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Total RFQs</p>
                <h2 className="fw-bold mb-0 text-primary">{metrics.total}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #198754' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Total Value</p>
                <h3 className="fw-bold mb-0 text-success">{formatCurrency(metrics.totalValue)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Urgent Priority</p>
                <h2 className="fw-bold mb-0 text-danger">{metrics.urgent}</h2>
                <p className="text-muted small mb-0">+{metrics.high} High</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #fd7e14' }}>
              <div className="card-body">
                <p className="text-muted small mb-1">Avg. Value</p>
                <h3 className="fw-bold mb-0" style={{ color: '#fd7e14' }}>{formatCurrency(metrics.avgValue)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #6c757d' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Draft</p>
                <h3 className="fw-bold mb-0">{metrics.draft}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #ffc107' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Pending</p>
                <h3 className="fw-bold mb-0">{metrics.pending}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #198754' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Ready to Quote</p>
                <h3 className="fw-bold mb-0">{metrics.approved}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #0d6efd' }}>
              <div className="card-body py-3">
                <p className="text-muted small mb-1">Completed</p>
                <h3 className="fw-bold mb-0">{metrics.completed}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-semibold">Filters & Search</h6>
              <div className="btn-group" role="group">
                <button type="button" className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('table')}>Table</button>
                <button type="button" className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('cards')}>Cards</button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Search RFQs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="col-md-3">
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Clarification">Pending Clarification</option>
                  <option value="Ready for Quote">Ready for Quote</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
                  <option value="all">All Entities</option>
                  <option value="ERHA FC">ERHA FC</option>
                  <option value="ERHA SS">ERHA SS</option>
                </select>
              </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="alert alert-primary mt-3 mb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-primary fs-6">{selectedIds.size} selected</span>
                    <button onClick={handleBulkExport} className="btn btn-info btn-sm fw-semibold">Export to Pastel</button>
                  </div>
                  <button onClick={() => setSelectedIds(new Set())} className="btn btn-link text-decoration-none">Clear Selection</button>
                </div>
            )}
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                  <tr>
                    <th className="px-4">
                      <input type="checkbox" className="form-check-input" checked={selectedIds.size === paginatedRfqs.length && paginatedRfqs.length > 0} onChange={handleSelectAll} />
                    </th>
                    <th className="px-4 cursor-pointer" onClick={() => handleSort('jobNo')}>RFQ Number <SortIcon field="jobNo" /></th>
                    <th className="px-4 cursor-pointer" onClick={() => handleSort('clientName')}>Client <SortIcon field="clientName" /></th>
                    <th className="px-4">Description</th>
                    <th className="px-4 cursor-pointer" onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
                    <th className="px-4 cursor-pointer" onClick={() => handleSort('priority')}>Priority <SortIcon field="priority" /></th>
                    <th className="px-4 text-end cursor-pointer" onClick={() => handleSort('estimatedValue')}>Est. Value <SortIcon field="estimatedValue" /></th>
                    <th className="px-4 cursor-pointer" onClick={() => handleSort('requestDate')}>Received <SortIcon field="requestDate" /></th>
                    <th className="px-4 text-center">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {paginatedRfqs.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-5"><p className="text-muted mb-0">No RFQs found matching your filters</p></td></tr>
                  ) : (
                      paginatedRfqs.map((rfq) => {
                        const statusConfig = getStatusConfig(rfq.status);
                        const priorityConfig = getPriorityConfig(rfq.priority);
                        return (
                            <tr key={rfq.id}>
                              <td className="px-4"><input type="checkbox" className="form-check-input" checked={selectedIds.has(rfq.id)} onChange={() => handleSelectOne(rfq.id)} /></td>
                              <td className="px-4"><button onClick={() => navigate(`/rfq/${rfq.id}`)} className="btn btn-link text-decoration-none fw-bold p-0">{rfq.jobNo}</button></td>
                              <td className="px-4 fw-semibold">{rfq.clientName}</td>
                              <td className="px-4 text-muted" style={{ maxWidth: '300px' }}><div className="text-truncate">{rfq.description}</div></td>
                              <td className="px-4"><span className={`badge ${statusConfig.class} rounded-pill px-3 py-2`}>{rfq.status}</span></td>
                              <td className="px-4"><span className={`badge ${priorityConfig.class} rounded-pill px-3 py-2`}>{rfq.priority}</span></td>
                              <td className="px-4 text-end fw-bold">{formatCurrency(rfq.estimatedValue)}</td>
                              <td className="px-4 text-muted">{formatDate(rfq.requestDate)}</td>
                              <td className="px-4">
                                <div className="d-flex justify-content-center gap-2">
                                  <button onClick={() => navigate(`/rfq/${rfq.id}`)} className="btn btn-sm btn-outline-primary" title="View">View</button>
                                  <button onClick={() => navigate(`/rfq/${rfq.id}/edit`)} className="btn btn-sm btn-outline-secondary" title="Edit">Edit</button>
                                  {canExport(rfq.status) && <button onClick={() => handleExportToPastel(rfq.id)} className="btn btn-sm btn-outline-info" title="Export">Export</button>}
                                </div>
                              </td>
                            </tr>
                        );
                      })
                  )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                  <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                    <div className="text-muted small">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRfqs.length)} of {filteredAndSortedRfqs.length} RFQs</div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button></li>
                        <li className="page-item active"><span className="page-link">Page {currentPage} of {totalPages}</span></li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button></li>
                      </ul>
                    </nav>
                  </div>
              )}
            </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
            <div className="row g-4">
              {paginatedRfqs.map((rfq) => {
                const statusConfig = getStatusConfig(rfq.status);
                const priorityConfig = getPriorityConfig(rfq.priority);
                return (
                    <div key={rfq.id} className="col-md-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <button onClick={() => navigate(`/rfq/${rfq.id}`)} className="btn btn-link text-decoration-none fw-bold p-0 h5 mb-1">{rfq.jobNo}</button>
                              <p className="text-muted small mb-0">{rfq.clientName}</p>
                            </div>
                            <input type="checkbox" className="form-check-input" checked={selectedIds.has(rfq.id)} onChange={() => handleSelectOne(rfq.id)} />
                          </div>
                          <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>{(rfq.description || '').substring(0, 100)}{(rfq.description || '').length > 100 && '...'}</p>
                          <div className="d-flex gap-2 mb-3">
                            <span className={`badge ${statusConfig.class} rounded-pill`}>{rfq.status}</span>
                            <span className={`badge ${priorityConfig.class} rounded-pill`}>{rfq.priority}</span>
                          </div>
                          <div className="border-top pt-3 mb-3">
                            <div className="d-flex justify-content-between mb-2"><span className="text-muted small">Estimated Value</span><span className="fw-bold">{formatCurrency(rfq.estimatedValue)}</span></div>
                            <div className="d-flex justify-content-between"><span className="text-muted small">Received</span><span className="fw-semibold small">{formatDate(rfq.requestDate)}</span></div>
                          </div>
                          <div className="d-flex gap-2">
                            <button onClick={() => navigate(`/rfq/${rfq.id}`)} className="btn btn-primary btn-sm flex-fill">View</button>
                            <button onClick={() => navigate(`/rfq/${rfq.id}/edit`)} className="btn btn-outline-secondary btn-sm flex-fill">Edit</button>
                            {canExport(rfq.status) && <button onClick={() => handleExportToPastel(rfq.id)} className="btn btn-outline-info btn-sm">Export</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        <style>{`.cursor-pointer { cursor: pointer; } .bg-orange { background-color: #fd7e14 !important; }`}</style>
      </div>
  );
};

export default RFQList;