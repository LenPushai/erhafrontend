import { useState, FormEvent } from 'react';
import { X, Plus } from 'lucide-react';
import jobService from '../services/jobService';

interface AddChildJobModalProps {
  show: boolean;
  parentJobId: string;
  parentJobNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const JOB_PHASES = [
  { value: 'FABRICATION', label: 'Fabrication', description: 'Cutting, forming, welding in shop' },
  { value: 'ASSEMBLY', label: 'Assembly', description: 'Putting components together' },
  { value: 'WELDING', label: 'Welding', description: 'Dedicated welding operations' },
  { value: 'MACHINING', label: 'Machining', description: 'CNC, turning, milling operations' },
  { value: 'ELECTRICAL', label: 'Electrical', description: 'Electrical installation & wiring' },
  { value: 'INSTALLATION', label: 'Installation', description: 'On-site installation' },
  { value: 'SITE_WORK', label: 'Site Work', description: 'Work performed at client site' },
  { value: 'SUBCONTRACT', label: 'Subcontract', description: 'Work done by subcontractor' },
  { value: 'TESTING', label: 'Testing', description: 'Quality testing & inspection' },
  { value: 'FINISHING', label: 'Finishing', description: 'Painting, coating, cleanup' },
  { value: 'DELIVERY', label: 'Delivery', description: 'Transport & delivery' },
];

export function AddChildJobModal({ show, parentJobId, parentJobNumber, onClose, onSuccess }: AddChildJobModalProps) {
  const [jobPhase, setJobPhase] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedSupervisor, setAssignedSupervisor] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!jobPhase) {
      setError('Please select a job phase');
      return;
    }
    
    if (!description) {
      setError('Please enter a description');
      return;
    }
    
    setLoading(true);
    
    try {
      const childJob = await jobService.createChildJob(parentJobId, {
        job_phase: jobPhase,
        description,
        due_date: dueDate || undefined,
        assigned_supervisor: assignedSupervisor || undefined,
        estimated_hours: estimatedHours ? Number(estimatedHours) : undefined,
      });
      
      if (!childJob) {
        throw new Error('Failed to create child job');
      }
      
      alert(`Child Job Created: ${childJob.job_number}`);
      onSuccess();
      onClose();
      
      // Reset form
      setJobPhase('');
      setDescription('');
      setDueDate('');
      setAssignedSupervisor('');
      setEstimatedHours('');
      
    } catch (err: any) {
      setError(err.message || 'Failed to create child job');
    } finally {
      setLoading(false);
    }
  };
  
  if (!show) return null;
  
  const selectedPhase = JOB_PHASES.find(p => p.value === jobPhase);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Add Child Job</h2>
            <p className="text-green-100 text-sm">Parent: {parentJobNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Phase Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Phase *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {JOB_PHASES.map(phase => (
                <button
                  key={phase.value}
                  type="button"
                  onClick={() => setJobPhase(phase.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    jobPhase === phase.value
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{phase.label}</p>
                  <p className="text-xs text-gray-500">{phase.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={selectedPhase ? `${selectedPhase.label} for ${parentJobNumber}` : 'Enter description...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          {/* Schedule & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Supervisor</label>
              <input
                type="text"
                value={assignedSupervisor}
                onChange={(e) => setAssignedSupervisor(e.target.value)}
                placeholder="Who's responsible?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="Hours"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          {/* Preview */}
          {jobPhase && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This will create: <strong>{parentJobNumber}-{String.fromCharCode(65)}</strong> ({selectedPhase?.label})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Line items can be added after creation by editing the child job.
              </p>
            </div>
          )}
          
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
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} /> {loading ? 'Creating...' : 'Create Child Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddChildJobModal;


