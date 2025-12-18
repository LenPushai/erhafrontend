import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton
} from '@mui/material';
import {
  Upload,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  CreditCard,
  Download,
  Plus,
  UserPlus,
  ClipboardList,
  X
} from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';

interface Worker {
  id: number;
  clockNumber: string;
  name: string;
  contactDetails: string;
  bankName: string;
  bankAccount: string;
  branchCode: string;
  status: string;
  notes: string;
}

interface LaborEntry {
  id: number;
  requestNumber: string;
  jobId: number | null;
  jobNo: string | null;
  workerId: number;
  workerName: string;
  workerClockNo: string;
  originator: string;
  place: string;
  workItem: string;
  requiredDates: string;
  dateReceived: string;
  payMethod: string;
  payDate: string | null;
  paymentAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  workStatus: 'REQUESTED' | 'ASSIGNED' | 'WORKING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  notes: string;
}

interface Job {
  jobId: number;
  jobNumber: string;
  description: string;
}

interface Summary {
  totalWorkers: number;
  activeWorkers: number;
  totalEntries: number;
  pendingPayments: number;
  totalPaid: number;
  totalPending: number;
}

const API_BASE = 'http://localhost:8080/api/v1/casuals';
const JOBS_API = 'http://localhost:8080/api/v1/jobs';

const CasualLabor: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [entries, setEntries] = useState<LaborEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  
  // Mark as Paid state
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [processing, setProcessing] = useState(false);
  
  // New Worker Dialog
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    clockNumber: '',
    contactDetails: '',
    bankName: '',
    bankAccount: '',
    branchCode: '',
    notes: ''
  });
  
  // New Request Dialog
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    jobId: '',
    workerId: '',
    originator: '',
    place: 'SHOP',
    workItem: '',
    requiredDates: '',
    payMethod: 'EFT',
    paymentAmount: '',
    notes: ''
  });
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, workersRes, entriesRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/summary`),
        fetch(`${API_BASE}/workers`),
        fetch(`${API_BASE}/entries`),
        fetch(JOBS_API)
      ]);
      
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (workersRes.ok) setWorkers(await workersRes.json());
      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success || result.entriesCreated > 0) {
        showToast(`Imported ${result.entriesCreated} entries, ${result.workersCreated} new workers`, 'success');
        fetchData();
      } else {
        showToast('Import completed with errors', 'warning');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('Import failed', 'error');
      setImportResult({ error: 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  // ============================================================
  // NEW WORKER HANDLERS
  // ============================================================
  const handleOpenWorkerDialog = () => {
    setNewWorker({
      name: '',
      clockNumber: '',
      contactDetails: '',
      bankName: '',
      bankAccount: '',
      branchCode: '',
      notes: ''
    });
    setWorkerDialogOpen(true);
  };

  const handleSaveWorker = async () => {
    if (!newWorker.name.trim()) {
      showToast('Worker name is required', 'error');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWorker,
          status: 'ACTIVE'
        })
      });

      if (response.ok) {
        showToast(`Worker "${newWorker.name}" added successfully`, 'success');
        setWorkerDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        showToast(err.error || 'Failed to add worker', 'error');
      }
    } catch (error) {
      showToast('Failed to add worker', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // NEW REQUEST HANDLERS
  // ============================================================
  const generateRequestNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = entries.filter(e => 
      e.requestNumber?.startsWith(`${year}-${month}`)
    ).length + 1;
    return `${year}-${month}-#${String(count).padStart(2, '0')}`;
  };

  const handleOpenRequestDialog = () => {
    setNewRequest({
      jobId: '',
      workerId: '',
      originator: '',
      place: 'SHOP',
      workItem: '',
      requiredDates: '',
      payMethod: 'EFT',
      paymentAmount: '',
      notes: ''
    });
    setRequestDialogOpen(true);
  };

  const handleSaveRequest = async () => {
    if (!newRequest.originator.trim()) {
      showToast('Originator is required', 'error');
      return;
    }
    if (!newRequest.workItem.trim()) {
      showToast('Work item/description is required', 'error');
      return;
    }

    setProcessing(true);
    try {
      const payload: any = {
        requestNumber: generateRequestNumber(),
        originator: newRequest.originator,
        place: newRequest.place,
        workItem: newRequest.workItem,
        requiredDates: newRequest.requiredDates,
        dateReceived: new Date().toISOString().split('T')[0],
        payMethod: newRequest.payMethod,
        paymentStatus: 'PENDING',
        workStatus: newRequest.workerId ? 'ASSIGNED' : 'REQUESTED',
        notes: newRequest.notes
      };

      if (newRequest.paymentAmount) {
        payload.paymentAmount = parseFloat(newRequest.paymentAmount);
      }
      if (newRequest.workerId) {
        payload.workerId = parseInt(newRequest.workerId);
      }
      if (newRequest.jobId) {
        payload.jobId = parseInt(newRequest.jobId);
      }

      const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast('Casual labor request created', 'success');
        setRequestDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        showToast(err.error || 'Failed to create request', 'error');
      }
    } catch (error) {
      showToast('Failed to create request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Checkbox handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const pendingIds = entries
        .filter(e => e.paymentStatus === 'PENDING')
        .map(e => e.id);
      setSelectedEntries(pendingIds);
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (id: number) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleOpenPayDialog = () => {
    if (selectedEntries.length === 0) {
      showToast('Select entries to mark as paid', 'warning');
      return;
    }
    setPayDialogOpen(true);
  };

  const handleMarkAsPaid = async () => {
    setProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const entryId of selectedEntries) {
      try {
        const response = await fetch(`${API_BASE}/entries/${entryId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payDate })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setProcessing(false);
    setPayDialogOpen(false);
    setSelectedEntries([]);
    
    if (successCount > 0) {
      showToast(`Marked ${successCount} entries as paid`, 'success');
      fetchData();
    }
    if (failCount > 0) {
      showToast(`${failCount} entries failed to update`, 'error');
    }
  };

  const handleExportPending = () => {
    const pending = entries.filter(e => e.paymentStatus === 'PENDING' && e.payMethod === 'EFT');
    if (pending.length === 0) {
      showToast('No pending EFT payments to export', 'info');
      return;
    }

    const headers = ['Worker Name', 'Clock No', 'Amount', 'Reference'];
    const rows = pending.map(e => [
      e.workerName,
      e.workerClockNo || '',
      e.paymentAmount?.toFixed(2) || '0.00',
      `ERHA-${e.requestNumber || e.id}`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERHA_EFT_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${pending.length} EFT payments`, 'success');
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return 'R 0.00';
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'info';
      case 'ASSIGNED': return 'primary';
      case 'WORKING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'NO_SHOW': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const pendingEntries = entries.filter(e => e.paymentStatus === 'PENDING');
  const pendingTotal = pendingEntries.reduce((sum, e) => sum + (e.paymentAmount || 0), 0);
  const requestedEntries = entries.filter(e => e.workStatus === 'REQUESTED');
  const activeWorkers = workers.filter(w => w.status === 'ACTIVE');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Casual Labor Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track casual workers, assignments, and payments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ClipboardList size={18} />}
            onClick={handleOpenRequestDialog}
          >
            New Request
          </Button>
          <Button
            variant="outlined"
            startIcon={<UserPlus size={18} />}
            onClick={handleOpenWorkerDialog}
          >
            Add Worker
          </Button>
        </Box>
      </Box>

      {/* Alert for pending requests */}
      {requestedEntries.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>{requestedEntries.length} request(s)</strong> awaiting worker assignment.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Users size={24} color="#1976d2" />
              <Typography variant="h5" fontWeight="bold">{summary?.totalWorkers || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Total Workers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle size={24} color="#4caf50" />
              <Typography variant="h5" fontWeight="bold">{summary?.activeWorkers || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <FileSpreadsheet size={24} color="#ff9800" />
              <Typography variant="h5" fontWeight="bold">{summary?.totalEntries || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Total Entries</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Clock size={24} color="#f44336" />
              <Typography variant="h5" fontWeight="bold">{summary?.pendingPayments || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <AlertCircle size={24} color="#f44336" />
              <Typography variant="h5" fontWeight="bold" color="error">{formatCurrency(summary?.totalPending)}</Typography>
              <Typography variant="caption" color="text.secondary">Pending Amt</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <DollarSign size={24} color="#4caf50" />
              <Typography variant="h5" fontWeight="bold" color="success.main">{formatCurrency(summary?.totalPaid)}</Typography>
              <Typography variant="caption" color="text.secondary">Total Paid</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Dashboard" />
          <Tab label={`Workers (${workers.length})`} />
          <Tab label={`Labor Entries (${entries.length})`} />
          <Tab label="Import" />
        </Tabs>
      </Paper>

      {/* Tab 0: Dashboard */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button 
                variant="contained"
                color="primary"
                startIcon={<ClipboardList size={18} />}
                onClick={handleOpenRequestDialog}
              >
                New Casual Request
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CreditCard size={18} />}
                onClick={() => setTabValue(2)}
                disabled={pendingEntries.length === 0}
              >
                Process Payments ({pendingEntries.length})
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<Download size={18} />}
                onClick={handleExportPending}
              >
                Export EFT CSV
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<UserPlus size={18} />}
                onClick={handleOpenWorkerDialog}
              >
                Add Worker
              </Button>
            </Grid>
          </Grid>

          {pendingEntries.length > 0 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <strong>{pendingEntries.length} pending payments</strong> totaling <strong>{formatCurrency(pendingTotal)}</strong> awaiting processing.
            </Alert>
          )}
        </Paper>
      )}

      {/* Tab 1: Workers */}
      {tabValue === 1 && (
        <Paper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Workers Database</Typography>
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={handleOpenWorkerDialog}
            >
              Add Worker
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Clock No</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>Bank Details</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map(worker => (
                  <TableRow key={worker.id} hover>
                    <TableCell>{worker.clockNumber || '-'}</TableCell>
                    <TableCell><strong>{worker.name}</strong></TableCell>
                    <TableCell>{worker.contactDetails || '-'}</TableCell>
                    <TableCell>
                      {worker.bankName ? `${worker.bankName} - ${worker.bankAccount || ''}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={worker.status} 
                        size="small"
                        color={worker.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {workers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No workers found. Add a worker to get started.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 2: Labor Entries */}
      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ClipboardList size={18} />}
              onClick={handleOpenRequestDialog}
            >
              New Request
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle size={18} />}
              onClick={handleOpenPayDialog}
              disabled={selectedEntries.length === 0}
            >
              Mark as Paid ({selectedEntries.length})
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={handleExportPending}
            >
              Export EFT
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedEntries.length} | Pending Total: {formatCurrency(pendingTotal)}
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedEntries.length > 0 && selectedEntries.length < pendingEntries.length}
                      checked={pendingEntries.length > 0 && selectedEntries.length === pendingEntries.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>Req #</strong></TableCell>
                  <TableCell><strong>Worker</strong></TableCell>
                  <TableCell><strong>Job</strong></TableCell>
                  <TableCell><strong>Work Item</strong></TableCell>
                  <TableCell><strong>Place</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell><strong>Method</strong></TableCell>
                  <TableCell><strong>Work Status</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(entry => (
                  <TableRow 
                    key={entry.id} 
                    hover
                    selected={selectedEntries.includes(entry.id)}
                    sx={{ 
                      backgroundColor: entry.paymentStatus === 'PAID' ? '#e8f5e9' : 
                                      entry.workStatus === 'REQUESTED' ? '#fff3e0' : 'inherit'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        disabled={entry.paymentStatus === 'PAID'}
                      />
                    </TableCell>
                    <TableCell>{entry.requestNumber || '-'}</TableCell>
                    <TableCell>
                      {entry.workerName ? (
                        <>
                          <strong>{entry.workerName}</strong>
                          {entry.workerClockNo && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              #{entry.workerClockNo}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>{entry.jobNo || '-'}</TableCell>
                    <TableCell>{entry.workItem || '-'}</TableCell>
                    <TableCell>{entry.place || '-'}</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(entry.paymentAmount)}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.payMethod || 'N/A'} 
                        size="small"
                        color={entry.payMethod === 'EFT' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.workStatus || 'N/A'} 
                        size="small"
                        color={getStatusColor(entry.workStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.paymentStatus} 
                        size="small"
                        color={entry.paymentStatus === 'PAID' ? 'success' : entry.paymentStatus === 'PENDING' ? 'warning' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No entries found. Create a new request to get started.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 3: Import */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Import Casuals from Excel</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload Casuals_2025.xlsx to import historical workers and entries.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Note:</strong> Excel import is for migrating historical data. For new requests, use the "New Request" button.
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button variant="outlined" component="label" startIcon={<Upload size={18} />}>
              Choose File
              <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileSelect} />
            </Button>
            <Typography>{selectedFile?.name || 'No file selected'}</Typography>
            <Button 
              variant="contained" 
              onClick={handleImport}
              disabled={!selectedFile || importing}
              startIcon={importing ? <CircularProgress size={18} /> : <FileSpreadsheet size={18} />}
            >
              {importing ? 'Importing...' : 'Import File'}
            </Button>
          </Box>

          {importResult && (
            <Alert severity={importResult.success ? 'success' : importResult.error ? 'error' : 'warning'} sx={{ mt: 2 }}>
              {importResult.error ? (
                importResult.error
              ) : (
                <>
                  <strong>Import Complete!</strong><br />
                  Workers created: {importResult.workersCreated}<br />
                  Workers updated: {importResult.workersUpdated}<br />
                  Entries created: {importResult.entriesCreated}<br />
                  {importResult.errorCount > 0 && `Errors: ${importResult.errorCount}`}
                  {importResult.missingJobs?.length > 0 && (
                    <><br />Jobs not found: {importResult.missingJobs.join(', ')}</>
                  )}
                </>
              )}
            </Alert>
          )}
        </Paper>
      )}

      {/* ============================================================ */}
      {/* NEW WORKER DIALOG - Matching App Style */}
      {/* ============================================================ */}
      <Dialog 
        open={workerDialogOpen} 
        onClose={() => setWorkerDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {/* Green Header */}
        <Box sx={{ 
          bgcolor: '#2e7d32', 
          color: 'white', 
          px: 3, 
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserPlus size={22} />
            <Typography variant="h6" fontWeight="bold">Add New Worker</Typography>
          </Box>
          <IconButton size="small" onClick={() => setWorkerDialogOpen(false)} sx={{ color: 'white' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          {/* Info Box */}
          <Box sx={{ 
            bgcolor: '#e3f2fd', 
            border: '1px solid #90caf9',
            borderRadius: 1, 
            p: 2, 
            mb: 3 
          }}>
            <Typography variant="body2">
              <strong>Worker Database:</strong> Add casual workers with their contact and banking details for quick assignment to jobs.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Full Name *</Typography>
              <TextField
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                fullWidth
                size="small"
                placeholder="Enter worker's full name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Clock Number</Typography>
              <TextField
                value={newWorker.clockNumber}
                onChange={(e) => setNewWorker({ ...newWorker, clockNumber: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., 1277"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Contact Details</Typography>
              <TextField
                value={newWorker.contactDetails}
                onChange={(e) => setNewWorker({ ...newWorker, contactDetails: e.target.value })}
                fullWidth
                size="small"
                placeholder="Phone number or email"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Bank Name</Typography>
              <TextField
                value={newWorker.bankName}
                onChange={(e) => setNewWorker({ ...newWorker, bankName: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., FNB"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Account Number</Typography>
              <TextField
                value={newWorker.bankAccount}
                onChange={(e) => setNewWorker({ ...newWorker, bankAccount: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Branch Code</Typography>
              <TextField
                value={newWorker.branchCode}
                onChange={(e) => setNewWorker({ ...newWorker, branchCode: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Notes</Typography>
              <TextField
                value={newWorker.notes}
                onChange={(e) => setNewWorker({ ...newWorker, notes: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Any additional notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
          <Button 
            onClick={() => setWorkerDialogOpen(false)}
            sx={{ bgcolor: '#424242', color: 'white', '&:hover': { bgcolor: '#616161' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveWorker}
            disabled={processing}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            {processing ? 'Adding...' : 'Add Worker'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================ */}
      {/* NEW REQUEST DIALOG - Matching App Style */}
      {/* ============================================================ */}
      <Dialog 
        open={requestDialogOpen} 
        onClose={() => setRequestDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {/* Blue Header */}
        <Box sx={{ 
          bgcolor: '#1976d2', 
          color: 'white', 
          px: 3, 
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ClipboardList size={22} />
            <Typography variant="h6" fontWeight="bold">New Casual Labor Request</Typography>
          </Box>
          <IconButton size="small" onClick={() => setRequestDialogOpen(false)} sx={{ color: 'white' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          {/* Info Box */}
          <Box sx={{ 
            bgcolor: '#e3f2fd', 
            border: '1px solid #90caf9',
            borderRadius: 1, 
            p: 2, 
            mb: 3 
          }}>
            <Typography variant="body2">
              <strong>Casual Request:</strong> Create a request for casual labor. You can assign a worker now or leave unassigned for HR to process.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Originator *</Typography>
              <TextField
                value={newRequest.originator}
                onChange={(e) => setNewRequest({ ...newRequest, originator: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., ZACH, KOBUS"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Job (Optional)</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newRequest.jobId}
                  onChange={(e) => setNewRequest({ ...newRequest, jobId: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">-- No Job --</MenuItem>
                  {jobs.map(job => (
                    <MenuItem key={job.jobId} value={job.jobId}>
                      {job.jobNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Work Description *</Typography>
              <TextField
                value={newRequest.workItem}
                onChange={(e) => setNewRequest({ ...newRequest, workItem: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., PIPE ROLLING, GRINDING, STOCK COUNTING"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Location</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newRequest.place}
                  onChange={(e) => setNewRequest({ ...newRequest, place: e.target.value })}
                >
                  <MenuItem value="SHOP">SHOP</MenuItem>
                  <MenuItem value="SHOP STORE">SHOP STORE</MenuItem>
                  <MenuItem value="SITE">SITE</MenuItem>
                  <MenuItem value="OFFICE">OFFICE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Required Dates</Typography>
              <TextField
                value={newRequest.requiredDates}
                onChange={(e) => setNewRequest({ ...newRequest, requiredDates: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., 2025/01/06 - 10"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Assign Worker</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newRequest.workerId}
                  onChange={(e) => setNewRequest({ ...newRequest, workerId: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">-- Leave Unassigned --</MenuItem>
                  {activeWorkers.map(worker => (
                    <MenuItem key={worker.id} value={worker.id}>
                      {worker.name} {worker.clockNumber ? `(#${worker.clockNumber})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Pay Method</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={newRequest.payMethod}
                  onChange={(e) => setNewRequest({ ...newRequest, payMethod: e.target.value })}
                >
                  <MenuItem value="EFT">EFT</MenuItem>
                  <MenuItem value="CASH">CASH</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Expected Amount (R)</Typography>
              <TextField
                value={newRequest.paymentAmount}
                onChange={(e) => setNewRequest({ ...newRequest, paymentAmount: e.target.value })}
                fullWidth
                size="small"
                type="number"
                placeholder="0.00"
              />
            </Grid>
          </Grid>

          {/* What Happens Next Box */}
          <Box sx={{ 
            bgcolor: '#e8f5e9', 
            border: '1px solid #a5d6a7',
            borderRadius: 1, 
            p: 2, 
            mt: 3 
          }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>What Happens Next:</Typography>
            <Typography variant="body2" component="div">
              1. Request number auto-generated<br />
              2. {newRequest.workerId ? 'Worker assigned - status: ASSIGNED' : 'Status: REQUESTED (awaiting assignment)'}<br />
              3. After work complete, mark entry as COMPLETED<br />
              4. Process payment via Mark as Paid
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
          <Button 
            onClick={() => setRequestDialogOpen(false)}
            sx={{ bgcolor: '#424242', color: 'white', '&:hover': { bgcolor: '#616161' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRequest}
            disabled={processing}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            {processing ? 'Creating...' : 'Create Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================ */}
      {/* MARK AS PAID DIALOG - Matching App Style */}
      {/* ============================================================ */}
      <Dialog 
        open={payDialogOpen} 
        onClose={() => setPayDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {/* Green Header */}
        <Box sx={{ 
          bgcolor: '#2e7d32', 
          color: 'white', 
          px: 3, 
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={22} />
            <Typography variant="h6" fontWeight="bold">Mark as Paid</Typography>
          </Box>
          <IconButton size="small" onClick={() => setPayDialogOpen(false)} sx={{ color: 'white' }}>
            <X size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ 
            bgcolor: '#e8f5e9', 
            border: '1px solid #a5d6a7',
            borderRadius: 1, 
            p: 2, 
            mb: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {formatCurrency(
                entries
                  .filter(e => selectedEntries.includes(e.id))
                  .reduce((sum, e) => sum + (e.paymentAmount || 0), 0)
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedEntries.length} payment{selectedEntries.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>

          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>Payment Date *</Typography>
          <TextField
            type="date"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            fullWidth
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
          <Button 
            onClick={() => setPayDialogOpen(false)}
            sx={{ bgcolor: '#424242', color: 'white', '&:hover': { bgcolor: '#616161' } }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleMarkAsPaid}
            disabled={processing}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CasualLabor;