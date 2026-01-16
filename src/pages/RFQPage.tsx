import React, { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Button, TextField, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Chip,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox, Alert, Snackbar, InputAdornment, 
  Tooltip, CircularProgress
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, ArrowBack as BackIcon, Save as SaveIcon,
  Cancel as CancelIcon, Search as SearchIcon,
  PictureAsPdf as PdfIcon, Work as WorkIcon, CheckCircle as CheckIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'

interface RFQ {
  id: string
  rfq_no: string
  client_id: string
  description: string
  status: string
  priority: string
  operating_entity: string
  request_date: string
  required_date: string
  created_at: string
}

interface Client {
  id: string
  company_name: string
  contact_person: string
}

interface Worker {
  id: string
  full_name: string
  role: string
}

const statusOptions = ['NEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'ON_HOLD']
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const RFQPage: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Simple fetch without joins
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      
      try {
        // Fetch RFQs
        const { data: rfqData, error: rfqError } = await supabase
          .from('rfqs')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (rfqError) {
          console.error('RFQ Error:', rfqError)
        } else if (!cancelled) {
          console.log('RFQs loaded:', rfqData?.length)
          setRfqs(rfqData || [])
        }

        // Fetch Clients
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, company_name, contact_person')
          .order('company_name')
        
        if (clientError) {
          console.error('Client Error:', clientError)
        } else if (!cancelled) {
          console.log('Clients loaded:', clientData?.length)
          setClients(clientData || [])
        }

        // Fetch Workers
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('id, full_name, role')
          .order('full_name')
        
        if (workerError) {
          console.error('Worker Error:', workerError)
        } else if (!cancelled) {
          console.log('Workers loaded:', workerData?.length)
          setWorkers(workerData || [])
        }

      } catch (err) {
        console.error('Load error:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  // Helper to get client name
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.company_name || '-'
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'NEW': 'info', 'QUOTED': 'primary', 'ACCEPTED': 'success',
      'REJECTED': 'error', 'CANCELLED': 'default', 'ON_HOLD': 'warning'
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'LOW': 'default', 'MEDIUM': 'info', 'HIGH': 'warning', 'URGENT': 'error'
    }
    return colors[priority] || 'default'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-ZA')
  }

  // Filter RFQs
  const filteredRFQs = rfqs.filter(rfq => {
    const clientName = getClientName(rfq.client_id)
    const matchesSearch = 
      rfq.rfq_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          RFQs <Chip label={`${filteredRFQs.length} requests`} size="small" sx={{ ml: 2 }} />
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          NEW RFQ
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Search RFQs..."
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> 
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status Filter" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>RFQ No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredRFQs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No RFQs found
                </TableCell>
              </TableRow>
            ) : (
              filteredRFQs.map((rfq) => (
                <TableRow key={rfq.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 500 }}>{rfq.rfq_no}</TableCell>
                  <TableCell>{getClientName(rfq.client_id)}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rfq.description}
                  </TableCell>
                  <TableCell>
                    <Chip label={rfq.status} color={getStatusColor(rfq.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={rfq.priority} color={getPriorityColor(rfq.priority)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatDate(rfq.request_date)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton size="small"><ViewIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small"><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RFQPage