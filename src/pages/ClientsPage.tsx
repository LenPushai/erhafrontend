import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Search, RefreshCw, Building2, Users, Phone, Mail, MapPin,
  Plus, Eye, Edit, Trash2, X
} from 'lucide-react'

interface Client {
  id: string
  client_code: string
  company_name: string
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  physical_address: string | null
  is_active: boolean
  created_at: string
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({ company_name: '', contact_person: '', contact_email: '', contact_phone: '' })

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('company_name')
    
    if (!error && data) {
      setClients(data)
      setFilteredClients(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    let filtered = [...clients]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.company_name.toLowerCase().includes(term) ||
        c.client_code.toLowerCase().includes(term) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(term))
      )
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(c => 
        statusFilter === 'ACTIVE' ? c.is_active : !c.is_active
      )
    }
    
    setFilteredClients(filtered)
  }, [clients, searchTerm, statusFilter])

  const handleDelete = async () => {
    if (!selectedClient) return
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', selectedClient.id)
    
    if (!error) {
      setShowDeleteModal(false)
      setSelectedClient(null)
      fetchClients()
    }
  }

  const handleAddClient = async () => {
    if (!newClient.company_name.trim()) return

    const clientCode = 'CLI-' + String(clients.length + 1).padStart(5, '0')
    
    const { error } = await supabase
      .from('clients')
      .insert({
        client_code: clientCode,
        company_name: newClient.company_name.trim().toUpperCase(),
        contact_person: newClient.contact_person || null,
        contact_email: newClient.contact_email || null,
        contact_phone: newClient.contact_phone || null,
        is_active: true
      })
    
    if (!error) {
      setShowAddModal(false)
      setNewClient({ company_name: '', contact_person: '', contact_email: '', contact_phone: '' })
      fetchClients()
    }
  }

  const activeCount = clients.filter(c => c.is_active).length
  const inactiveCount = clients.filter(c => !c.is_active).length

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">{filteredClients.length} of {clients.length} clients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={fetchClients}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No clients found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Client Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{client.company_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">{client.client_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    {client.contact_person ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Users size={14} className="text-gray-400" />
                          {client.contact_person}
                        </div>
                        {client.contact_phone && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone size={14} className="text-gray-400" />
                            {client.contact_phone}
                          </div>
                        )}
                        {client.contact_email && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Mail size={14} className="text-gray-400" />
                            {client.contact_email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No contact info</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={'px-2 py-1 text-xs font-medium rounded ' + (client.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {client.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded" 
                        title="Delete"
                        onClick={() => { setSelectedClient(client); setShowDeleteModal(true); }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
          <p className="text-sm text-gray-500">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{inactiveCount}</p>
          <p className="text-sm text-gray-500">Inactive</p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this client?</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-900">{selectedClient.company_name}</p>
              <p className="text-sm text-gray-600">Code: {selectedClient.client_code}</p>
            </div>
            <p className="text-red-600 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newClient.company_name}
                  onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newClient.contact_person}
                  onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.contact_email}
                  onChange={(e) => setNewClient({...newClient, contact_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newClient.contact_phone}
                  onChange={(e) => setNewClient({...newClient, contact_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddClient}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
