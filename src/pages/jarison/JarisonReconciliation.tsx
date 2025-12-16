import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JarisonReconciliation.css';

interface JarisonImport {
  id: number;
  fileName: string;
  periodMonth: number;
  periodYear: number;
  periodDisplay: string;
  totalEmployees: number;
  totalHours: number;
  matchedCount: number;
  unmatchedCount: number;
  importedBy: string;
  importedAt: string;
  status: string;
}

interface JarisonHours {
  id: number;
  jarisonCode: string;
  employeeName: string;
  workerId: number | null;
  workerName: string | null;
  totalHours: number;
  normalHours: number;
  otHours15: number;
  otHours20: number;
  erhaJobHours: number;
  varianceHours: number;
  reconciliationStatus: string;
}

const JarisonReconciliation: React.FC = () => {
  const [imports, setImports] = useState<JarisonImport[]>([]);
  const [selectedImport, setSelectedImport] = useState<JarisonImport | null>(null);
  const [hours, setHours] = useState<JarisonHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'variance' | 'unmatched'>('all');
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/jarison/imports');
      setImports(response.data);
      if (response.data.length > 0) {
        selectImport(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch imports:', error);
    }
  };

  const selectImport = async (imp: JarisonImport) => {
    setSelectedImport(imp);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/jarison/imports/${imp.id}/hours`);
      setHours(response.data);
    } catch (error) {
      console.error('Failed to fetch hours:', error);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month.toString());
    formData.append('year', year.toString());
    formData.append('importedBy', 'admin');

    try {
      const response = await axios.post('http://localhost:8080/api/v1/jarison/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Import successful! ${response.data.totalEmployees} employees, ${response.data.matched} matched, ${response.data.unmatched} unmatched`);
      setFile(null);
      fetchImports();
    } catch (error: any) {
      alert('Import failed: ' + (error.response?.data?.error || error.message));
    }
    setUploading(false);
  };

  const filteredHours = hours.filter(h => {
    if (filter === 'variance') return h.reconciliationStatus === 'VARIANCE';
    if (filter === 'unmatched') return h.reconciliationStatus === 'UNMATCHED';
    return true;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'MATCHED': return 'status-matched';
      case 'VARIANCE': return 'status-variance';
      case 'UNMATCHED': return 'status-unmatched';
      default: return 'status-pending';
    }
  };

  const getVarianceClass = (variance: number) => {
    if (Math.abs(variance) <= 1) return 'variance-ok';
    if (variance > 0) return 'variance-over';
    return 'variance-under';
  };

  return (
    <div className="jarison-container">
      <div className="jarison-header">
        <h1>Jarison Time Reconciliation</h1>
        <p>Import monthly payroll data and reconcile with ERHA job hours</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Import Jarison Batch</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label>Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="form-group">
              <label>Month</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m-1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!file || uploading} className="btn-upload">
              {uploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards */}
      {selectedImport && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-value">{selectedImport.totalEmployees}</div>
            <div className="card-label">Total Employees</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{selectedImport.totalHours?.toFixed(1) || 0}</div>
            <div className="card-label">Total Hours</div>
          </div>
          <div className="summary-card card-success">
            <div className="card-value">{selectedImport.matchedCount}</div>
            <div className="card-label">Matched</div>
          </div>
          <div className="summary-card card-warning">
            <div className="card-value">{hours.filter(h => h.reconciliationStatus === 'VARIANCE').length}</div>
            <div className="card-label">Variances</div>
          </div>
          <div className="summary-card card-danger">
            <div className="card-value">{selectedImport.unmatchedCount}</div>
            <div className="card-label">Unmatched</div>
          </div>
        </div>
      )}

      {/* Import History */}
      {imports.length > 0 && (
        <div className="import-history">
          <h3>Import History</h3>
          <div className="import-tabs">
            {imports.map(imp => (
              <button
                key={imp.id}
                className={`import-tab ${selectedImport?.id === imp.id ? 'active' : ''}`}
                onClick={() => selectImport(imp)}
              >
                {imp.periodDisplay}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({hours.length})
        </button>
        <button
          className={`filter-tab ${filter === 'variance' ? 'active' : ''}`}
          onClick={() => setFilter('variance')}
        >
          Variances ({hours.filter(h => h.reconciliationStatus === 'VARIANCE').length})
        </button>
        <button
          className={`filter-tab ${filter === 'unmatched' ? 'active' : ''}`}
          onClick={() => setFilter('unmatched')}
        >
          Unmatched ({hours.filter(h => h.reconciliationStatus === 'UNMATCHED').length})
        </button>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Jarison Name</th>
                <th>ERHA Worker</th>
                <th>Jarison Hours</th>
                <th>ERHA Job Hours</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHours.map(h => (
                <tr key={h.id} className={getStatusClass(h.reconciliationStatus)}>
                  <td>{h.jarisonCode}</td>
                  <td>{h.employeeName}</td>
                  <td>{h.workerName || <span className="unlinked">Not Linked</span>}</td>
                  <td>{h.totalHours?.toFixed(1) || '-'}</td>
                  <td>{h.erhaJobHours?.toFixed(1) || '0.0'}</td>
                  <td className={getVarianceClass(h.varianceHours)}>
                    {h.varianceHours > 0 ? '+' : ''}{h.varianceHours?.toFixed(1) || '0.0'}h
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(h.reconciliationStatus)}`}>
                      {h.reconciliationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JarisonReconciliation;