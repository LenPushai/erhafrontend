import { useState, FormEvent, useEffect } from 'react';
import { X, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { jobService } from '../../services/jobService';
import { emailService } from '../../services/emailService';

interface EmergencyJobModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: (job: any) => void;
}

interface LineItem {
  item_type: string;
  description: string;
  specification: string;
  worker_type: string;
  quantity: number;
  uom: string;
  cost_price: number;
  sell_price: number;
  line_total: number;
}

const ITEM_TYPES = [
  { value: 'Material', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'Labour', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'Consumables', color: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'Transport', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 'Equipment', color: 'bg-pink-500 hover:bg-pink-600' },
  { value: 'Subcontract', color: 'bg-indigo-500 hover:bg-indigo-600' },
];

const WORKER_TYPES = ['Boilermaker', 'Welder', 'Coded Welder', 'Fitter', 'Rigger', 'General Worker', 'Supervisor'];
const UOM_OPTIONS = ['EA', 'HR', 'KG', 'M', 'M2', 'M3', 'L', 'TRIP', 'DAY', 'SET'];

const defaultLineItem = (): LineItem => ({
  item_type: 'Material',
  description: '',
  specification: '',
  worker_type: '',
  quantity: 1,
  uom: 'EA',
  cost_price: 0,
  sell_price: 0,
  line_total: 0,
});

export function EmergencyJobModal({ show, onClose, onSuccess }: EmergencyJobModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [description, setDescription] = useState('');
  const [productionStopped, setProductionStopped] = useState(false);
  const [safetyRisk, setSafetyRisk] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [specialEquipment, setSpecialEquipment] = useState('');
  const [assignedSupervisor, setAssignedSupervisor] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()]);
  
  // Load clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('*').order('name');
      setClients(data || []);
    };
    if (show) fetchClients();
  }, [show]);
  
  // Handle client selection
  const handleClientChange = (id: string) => {
    setClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setClientName(client.name);
      setContactPerson(client.contact_person || '');
      setContactPhone(client.phone || '');
    }
  };
  
  // Line item functions
  const addLineItem = (type: string) => {
    const newItem = defaultLineItem();
    newItem.item_type = type;
    if (type === 'Labour') newItem.uom = 'HR';
    if (type === 'Transport') newItem.uom = 'TRIP';
    setLineItems([...lineItems, newItem]);
  };
  
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    
    // Auto-calculate line total
    if (field === 'quantity' || field === 'sell_price') {
      updated[index].line_total = updated[index].quantity * updated[index].sell_price;
    }
    // Auto-copy cost to price if price is 0
    if (field === 'cost_price' && updated[index].sell_price === 0) {
      updated[index].sell_price = value;
      updated[index].line_total = updated[index].quantity * value;
    }
    
    setLineItems(updated);
  };
  
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  
  // Calculate totals
  const totalCost = lineItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0);
  const totalPrice = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const margin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice * 100).toFixed(1) : '0';
  
  // Determine severity
  const getSeverity = () => {
    if (safetyRisk) return { level: 'CRITICAL', color: 'bg-red-600', text: 'ðŸš¨ CRITICAL - SAFETY RISK' };
    if (productionStopped) return { level: 'HIGH', color: 'bg-orange-500', text: 'âš ï¸ HIGH - PRODUCTION STOPPED' };
    return null;
  };
  const severity = getSeverity();
  
  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!contactPerson || !contactPhone) {
      setError('Contact person and phone are required');
      return;
    }
    
    if (lineItems.filter(i => i.description).length === 0) {
      setError('At least one line item with description is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the emergency job
      const job = await jobService.createEmergencyJob({
        clientId: clientId || undefined,
        clientName: clientName || 'Walk-in Client',
        contactPerson,
        contactPhone,
        siteLocation,
        description,
        productionStopped,
        safetyRisk,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        specialEquipment,
        assignedSupervisor,
        lineItems: lineItems.filter(i => i.description),
      });
      
      if (!job) {
        throw new Error('Failed to create job');
      }
      
      // Send emergency email alerts
      await emailService.sendEmergencyAlert(job);
      
      // Success!
      if (onSuccess) onSuccess(job);
      onClose();
      
      // Reset form
      setClientId('');
      setClientName('');
      setContactPerson('');
      setContactPhone('');
      setSiteLocation('');
      setDescription('');
      setProductionStopped(false);
      setSafetyRisk(false);
      setEstimatedHours('');
      setSpecialEquipment('');
      setAssignedSupervisor('');
      setLineItems([defaultLineItem()]);
      
      alert(`Emergency Job Created: ${job.job_number}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create emergency job');
    } finally {
      setLoading(false);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 my-4">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <h2 className="text-xl font-bold">Create Emergency Job</h2>
              <p className="text-red-100 text-sm">Bypass RFQ/Quote process for urgent work</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        {/* Severity Banner */}
        {severity && (
          <div className={`${severity.color} text-white px-6 py-3 font-bold text-center`}>
            {severity.text}
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">-- Select or leave blank for walk-in --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site/Location</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="Where is the breakdown?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Who called?"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Callback number"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          {/* Severity Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productionStopped}
                onChange={(e) => setProductionStopped(e.target.checked)}
                className="w-5 h-5 text-orange-500"
              />
              <span className="font-medium">Production Stopped?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyRisk}
                onChange={(e) => setSafetyRisk(e.target.checked)}
                className="w-5 h-5 text-red-600"
              />
              <span className="font-medium">Safety Risk?</span>
            </label>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe the emergency..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          {/* Line Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Line Items</h3>
              <div className="flex gap-2">
                {ITEM_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => addLineItem(type.value)}
                    className={`${type.color} text-white text-xs px-3 py-1.5 rounded-full font-medium`}
                  >
                    + {type.value}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left w-8">#</th>
                    <th className="px-2 py-2 text-left w-28">Type</th>
                    <th className="px-2 py-2 text-left">Description</th>
                    <th className="px-2 py-2 text-left w-20">Qty</th>
                    <th className="px-2 py-2 text-left w-20">UOM</th>
                    <th className="px-2 py-2 text-left w-28">Cost</th>
                    <th className="px-2 py-2 text-left w-28">Price</th>
                    <th className="px-2 py-2 text-right w-28">Total</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-2 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-2 py-2">
                        <select
                          value={item.item_type}
                          onChange={(e) => updateLineItem(index, 'item_type', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {ITEM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.value}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Description..."
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        {item.item_type === 'Labour' && (
                          <select
                            value={item.worker_type}
                            onChange={(e) => updateLineItem(index, 'worker_type', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                          >
                            <option value="">Select worker type...</option>
                            {WORKER_TYPES.map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.uom}
                          onChange={(e) => updateLineItem(index, 'uom', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {UOM_OPTIONS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.cost_price}
                          onChange={(e) => updateLineItem(index, 'cost_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-yellow-50"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.sell_price}
                          onChange={(e) => updateLineItem(index, 'sell_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-2 py-2 text-right font-medium">
                        R {item.line_total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Cost: R {totalCost.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} | 
                Margin: <span className={parseFloat(margin) > 0 ? 'text-green-600' : 'text-orange-500'}>{margin}%</span>
              </div>
              <div className="text-lg font-bold">
                Total: <span className="text-green-600">R {totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Supervisor</label>
              <input
                type="text"
                value={assignedSupervisor}
                onChange={(e) => setAssignedSupervisor(e.target.value)}
                placeholder="Who's in charge?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : '')}
                min="0"
                step="0.5"
                placeholder="Hours"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Equipment</label>
              <input
                type="text"
                value={specialEquipment}
                onChange={(e) => setSpecialEquipment(e.target.value)}
                placeholder="What to bring?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'ðŸš¨ Create Emergency Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyJobModal;


