import React, { useState, useEffect } from 'react';
import { X, Save, Wrench, Truck, Settings, HardHat, Building, Clock, User, Phone, FileText, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateJobModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  contact_phone: string;
}

interface LineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

type JobType = 'RPR' | 'SVC' | 'MNT' | 'OVH' | 'INT' | 'ADH';

const JOB_TYPES: { type: JobType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { type: 'RPR', label: 'Repair', description: 'Fix client equipment', icon: <Wrench size={24} />, color: 'bg-blue-500' },
  { type: 'SVC', label: 'Service Call', description: 'On-site troubleshooting', icon: <Truck size={24} />, color: 'bg-green-500' },
  { type: 'MNT', label: 'Maintenance', description: 'Scheduled service work', icon: <Settings size={24} />, color: 'bg-purple-500' },
  { type: 'OVH', label: 'Overhaul', description: 'Major rebuild/refurbishment', icon: <HardHat size={24} />, color: 'bg-orange-500' },
  { type: 'INT', label: 'Internal', description: 'Workshop internal needs', icon: <Building size={24} />, color: 'bg-gray-500' },
  { type: 'ADH', label: 'Ad-Hoc', description: 'Walk-in / Quick jobs', icon: <Clock size={24} />, color: 'bg-teal-500' },
];

const LINE_ITEM_CATEGORIES = ['MATERIAL', 'LABOUR', 'CONSUMABLES', 'TRANSPORT', 'EQUIPMENT', 'SUBCONTRACTOR', 'OTHER'];

export function CreateJobModal({ show, onClose, onSuccess }: CreateJobModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    contact_person: '',
    contact_phone: '',
    site_location: '',
    description: '',
    notes: '',
    priority: 'NORMAL',
  });

  useEffect(() => {
    if (show) {
      fetchClients();
      resetForm();
    }
  }, [show]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, company_name, contact_person, contact_phone')
      .order('company_name');
    setClients(data || []);
  };

  const resetForm = () => {
    setStep('type');
    setSelectedType(null);
    setIsWalkIn(false);
    setLineItems([]);
    setFormData({
      client_id: '',
      client_name: '',
      contact_person: '',
      contact_phone: '',
      site_location: '',
      description: '',
      notes: '',
      priority: 'NORMAL',
    });
  };

  const handleClientChange = (clientId: string) => {
    if (clientId === 'walk-in') {
      setIsWalkIn(true);
      setFormData(prev => ({ ...prev, client_id: '', client_name: '', contact_person: '', contact_phone: '' }));
    } else {
      setIsWalkIn(false);
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          client_id: client.id,
          client_name: client.company_name,
          contact_person: client.contact_person || '',
          contact_phone: client.contact_phone || '',
        }));
      }
    }
  };

  const generateJobNumber = async (jobType: JobType): Promise<string> => {
    const year = new Date().getFullYear();
    
    const { data: seqData } = await supabase
      .from('job_sequences')
      .select('current_number')
      .eq('job_type', jobType)
      .eq('year', year)
      .single();
    
    let nextNumber = 1;
    if (seqData) {
      nextNumber = seqData.current_number + 1;
      await supabase
        .from('job_sequences')
        .update({ current_number: nextNumber })
        .eq('job_type', jobType)
        .eq('year', year);
    } else {
      await supabase
        .from('job_sequences')
        .insert({ job_type: jobType, year, current_number: 1 });
    }
    
    return `${jobType}-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      id: crypto.randomUUID(),
      category: 'MATERIAL',
      description: '',
      quantity: 1,
      unit: 'EA',
      unit_price: 0,
    }]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    if (!formData.description) {
      alert('Please enter a job description');
      return;
    }

    setLoading(true);

    try {
      const jobNumber = await generateJobNumber(selectedType);
      
      const { data: jobData, error: jobError } = await supabase.from('jobs').insert({
        job_number: jobNumber,
        job_type: selectedType,
        client_id: formData.client_id || null,
        client_name: formData.client_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        site_location: formData.site_location,
        description: formData.description,
        notes: formData.notes,
        status: 'PENDING',
        priority: formData.priority,
        is_emergency: false,
        created_at: new Date().toISOString(),
      }).select().single();

      if (jobError) throw jobError;

      // Insert line items
      if (lineItems.length > 0 && jobData) {
        const itemsToInsert = lineItems.map((item, index) => ({
          job_id: jobData.id,
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          sort_order: index + 1,
        }));
        
        await supabase.from('job_line_items').insert(itemsToInsert);
      }

      // Log activity
      await supabase.from('activity_log').insert({
        user_name: 'admin',
        action_type: 'CREATED',
        entity_type: 'JOB',
        entity_id: jobData.id,
        entity_reference: jobNumber,
        description: `Created ${selectedType} job ${jobNumber}`,
      });

      alert(`Job Created: ${jobNumber}`);
      onSuccess();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {step === 'type' ? 'Create New Job' : `New ${JOB_TYPES.find(t => t.type === selectedType)?.label} Job`}
            </h2>
            <p className="text-blue-100 text-sm">
              {step === 'type' ? 'Select the type of job to create' : 'Enter job details'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Job Type Selection */}
        {step === 'type' && (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {JOB_TYPES.map(jobType => (
                <button
                  key={jobType.type}
                  onClick={() => { setSelectedType(jobType.type); setStep('details'); }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className={`w-12 h-12 ${jobType.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                    {jobType.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{jobType.label}</h3>
                  <p className="text-sm text-gray-500">{jobType.type}-YYYY-XXX</p>
                  <p className="text-sm text-gray-600 mt-1">{jobType.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Job Details Form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('type')}
              className="text-sm text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to job type selection
            </button>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={isWalkIn ? 'walk-in' : formData.client_id}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Client...</option>
                <option value="walk-in">-- Walk-in / New Client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.company_name}</option>
                ))}
              </select>
            </div>

            {isWalkIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={14} className="inline mr-1" /> Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={14} className="inline mr-1" /> Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Site & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
                <input
                  type="text"
                  value={formData.site_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={14} className="inline mr-1" /> Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Line Items */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Line Items</h4>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              {lineItems.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No line items added yet</p>
              ) : (
                <div className="space-y-2">
                  {lineItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={item.category}
                        onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                        className="col-span-2 px-2 py-1.5 border rounded text-sm"
                      >
                        {LINE_ITEM_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="col-span-4 px-2 py-1.5 border rounded text-sm"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-2 py-1.5 border rounded text-sm text-center"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        className="col-span-1 px-2 py-1.5 border rounded text-sm text-center"
                      />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1.5 border rounded text-sm"
                        placeholder="Price"
                      />
                      <div className="col-span-1 text-right text-sm font-medium">
                        R{(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="col-span-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 border-t">
                    <span className="font-medium">
                      Total: R{lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateJobModal;