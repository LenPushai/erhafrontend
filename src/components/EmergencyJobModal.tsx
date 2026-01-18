import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Save, User, Phone, MapPin, FileText, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmergencyJobModalProps {
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

export function EmergencyJobModal({ show, onClose, onSuccess }: EmergencyJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    contact_person: '',
    contact_phone: '',
    site_location: '',
    description: '',
    notes: '',
    estimated_hours: '',
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
    setFormData({
      client_id: '',
      client_name: '',
      contact_person: '',
      contact_phone: '',
      site_location: '',
      description: '',
      notes: '',
      estimated_hours: '',
    });
    setIsWalkIn(false);
  };

  const handleClientChange = (clientId: string) => {
    if (clientId === 'walk-in') {
      setIsWalkIn(true);
      setFormData(prev => ({
        ...prev,
        client_id: '',
        client_name: '',
        contact_person: '',
        contact_phone: '',
      }));
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

  const generateEmergencyNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    
    // Get or create emergency sequence
    const { data: seqData } = await supabase
      .from('job_sequences')
      .select('current_number')
      .eq('job_type', 'EMG')
      .eq('year', year)
      .single();
    
    let nextNumber = 1;
    if (seqData) {
      nextNumber = seqData.current_number + 1;
      await supabase
        .from('job_sequences')
        .update({ current_number: nextNumber })
        .eq('job_type', 'EMG')
        .eq('year', year);
    } else {
      await supabase
        .from('job_sequences')
        .insert({ job_type: 'EMG', year, current_number: 1 });
    }
    
    return `EMG-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description) {
      alert('Please enter a job description');
      return;
    }
    
    if (!isWalkIn && !formData.client_id) {
      alert('Please select a client or choose Walk-in');
      return;
    }

    setLoading(true);

    try {
      const jobNumber = await generateEmergencyNumber();
      
      const { error } = await supabase.from('jobs').insert({
        job_number: jobNumber,
        job_type: 'EMG',
        client_id: formData.client_id || null,
        client_name: isWalkIn ? formData.client_name : formData.client_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        site_location: formData.site_location,
        description: formData.description,
        notes: formData.notes,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        is_emergency: true,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_log').insert({
        user_name: 'admin',
        action_type: 'CREATED',
        entity_type: 'JOB',
        entity_reference: jobNumber,
        description: `Created emergency job ${jobNumber}`,
      });

      alert(`Emergency Job Created: ${jobNumber}`);
      onSuccess();
    } catch (error) {
      console.error('Error creating emergency job:', error);
      alert('Failed to create emergency job');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <h2 className="text-xl font-bold">Emergency Job</h2>
              <p className="text-red-100 text-sm">Bypass normal workflow - immediate action required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              value={isWalkIn ? 'walk-in' : formData.client_id}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Client...</option>
              <option value="walk-in">-- Walk-in / New Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>

          {/* Walk-in Client Name */}
          {isWalkIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Enter client/company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          {/* Contact Info Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={14} className="inline mr-1" /> Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Who called?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                placeholder="Callback number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Site Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={14} className="inline mr-1" /> Site Location
            </label>
            <input
              type="text"
              value={formData.site_location}
              onChange={(e) => setFormData(prev => ({ ...prev, site_location: e.target.value }))}
              placeholder="Where is the breakdown?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText size={14} className="inline mr-1" /> Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's the emergency? Describe the work needed..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Estimated Hours & Notes Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock size={14} className="inline mr-1" /> Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                placeholder="Rough estimate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Special instructions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Emergency Job Workflow</p>
                <ul className="text-yellow-700 mt-1 space-y-0.5">
                  <li>- Job will be created with CRITICAL priority</li>
                  <li>- Status will be set to IN_PROGRESS immediately</li>
                  <li>- Normal RFQ/Quote workflow is bypassed</li>
                  <li>- Remember to update paperwork later!</li>
                </ul>
              </div>
            </div>
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
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Creating...' : 'Create Emergency Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyJobModal;