import React, { useState, useEffect } from 'react';
import { getWorkers, getJobAssignments, assignWorker, removeAssignment, type Worker, type JobAssignment } from '../../services/workshopService';
import './AssignWorkerModal.css';

interface AssignWorkerModalProps {
    jobId: number;
    jobNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({ jobId, jobNumber, onClose, onSuccess }) => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [assignments, setAssignments] = useState<JobAssignment[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<number | ''>('');
    const [selectedRole, setSelectedRole] = useState<string>('ARTISAN');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [workersData, assignmentsData] = await Promise.all([
                getWorkers(),
                getJobAssignments(jobId)
            ]);
            setWorkers(workersData);
            setAssignments(assignmentsData);
        } catch (err) {
            setError('Failed to load data');
        }
    };

    const handleAssign = async () => {
        if (!selectedWorker) {
            setError('Please select a worker');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await assignWorker(jobId, Number(selectedWorker), selectedRole);
            setSelectedWorker('');
            await loadData();
            onSuccess();
        } catch (err) {
            setError('Failed to assign worker');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (jId: number, wId: number) => {
        try {
            await removeAssignment(jId, wId);
            await loadData();
            onSuccess();
        } catch (err) {
            setError('Failed to remove assignment');
        }
    };

    const assignedWorkerIds = assignments.map(a => a.workerId);
    const availableWorkers = workers.filter(w => !assignedWorkerIds.includes(w.id));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content assign-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Assign Workers</h2>
                    <span className="job-badge">{jobNumber}</span>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <div className="current-assignments">
                    <h3>Currently Assigned ({assignments.length})</h3>
                    {assignments.length === 0 ? (
                        <p className="no-assignments">No workers assigned yet</p>
                    ) : (
                        <ul className="assignment-list">
                            {assignments.map(a => (
                                <li key={a.id} className="assignment-item">
                                    <span className="worker-name">{a.workerName}</span>
                                    <span className="worker-role">{a.role}</span>
                                    <button className="btn-remove" onClick={() => handleRemove(a.jobId, a.workerId)} title="Remove">✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="add-assignment">
                    <h3>Add Worker</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Worker</label>
                            <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value ? Number(e.target.value) : '')}>
                                <option value="">-- Select Worker --</option>
                                {availableWorkers.map(w => (
                                    <option key={w.id} value={w.id}>{w.firstName} {w.lastName} ({w.department})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                <option value="LEAD">Lead</option>
                                <option value="ARTISAN">Artisan</option>
                                <option value="HELPER">Helper</option>
                                <option value="APPRENTICE">Apprentice</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-assign" onClick={handleAssign} disabled={loading || !selectedWorker}>
                        {loading ? 'Assigning...' : '+ Add Worker'}
                    </button>
                </div>

                <div className="modal-actions">
                    <button className="btn-done" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default AssignWorkerModal;


