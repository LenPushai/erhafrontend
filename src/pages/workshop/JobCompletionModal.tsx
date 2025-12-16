import React, { useState, useEffect } from 'react';
import { getWorkers, completeJob, type Worker, type JobCompletionRequest } from '../../services/workshopService';
import './JobCompletionModal.css';

interface JobCompletionModalProps {
    jobId: number;
    jobNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

const JobCompletionModal: React.FC<JobCompletionModalProps> = ({ jobId, jobNumber, onClose, onSuccess }) => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [qcInspectorId, setQcInspectorId] = useState<number | ''>('');
    const [shopManagerId, setShopManagerId] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            const data = await getWorkers();
            setWorkers(data);
        } catch (err) {
            setError('Failed to load workers');
        }
    };

    const getWorkerName = (id: number): string => {
        const worker = workers.find(w => w.id === id);
        return worker ? `${worker.firstName} ${worker.lastName}` : '';
    };

    const handleComplete = async () => {
        if (!qcInspectorId || !shopManagerId) {
            setError('Both signatures are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: JobCompletionRequest = {
                qcInspectorId: Number(qcInspectorId),
                qcInspectorName: getWorkerName(Number(qcInspectorId)),
                shopManagerId: Number(shopManagerId),
                shopManagerName: getWorkerName(Number(shopManagerId)),
                notes: notes
            };
            await completeJob(jobId, request);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to complete job');
        } finally {
            setLoading(false);
        }
    };

    const supervisors = workers.filter(w => 
        w.department === 'ADMIN' || w.workerType === 'PERMANENT'
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content completion-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Job Completion Sign-Off</h2>
                    <span className="job-badge">{jobNumber}</span>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <div className="completion-info">
                    <p>Both signatures are required to mark this job as complete and ready for delivery.</p>
                </div>

                <div className="signature-section">
                    <div className="signature-box">
                        <div className="signature-icon">🔍</div>
                        <h3>QC Inspector / Shop Foreman</h3>
                        <p className="signature-desc">Final inspection verified</p>
                        <select 
                            value={qcInspectorId} 
                            onChange={e => setQcInspectorId(e.target.value ? Number(e.target.value) : '')}
                            className="signature-select"
                        >
                            <option value="">-- Select Inspector --</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.firstName} {w.lastName} ({w.department})
                                </option>
                            ))}
                        </select>
                        {qcInspectorId && (
                            <div className="signature-confirmed">
                                ✓ {getWorkerName(Number(qcInspectorId))}
                            </div>
                        )}
                    </div>

                    <div className="signature-box">
                        <div className="signature-icon">👔</div>
                        <h3>Shop Manager</h3>
                        <p className="signature-desc">Approval to release</p>
                        <select 
                            value={shopManagerId} 
                            onChange={e => setShopManagerId(e.target.value ? Number(e.target.value) : '')}
                            className="signature-select"
                        >
                            <option value="">-- Select Manager --</option>
                            {supervisors.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.firstName} {w.lastName} ({w.department})
                                </option>
                            ))}
                        </select>
                        {shopManagerId && (
                            <div className="signature-confirmed">
                                ✓ {getWorkerName(Number(shopManagerId))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="completion-notes">
                    <label>Completion Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any remarks or special instructions for delivery..."
                        rows={3}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-complete" 
                        onClick={handleComplete}
                        disabled={loading || !qcInspectorId || !shopManagerId}
                    >
                        {loading ? 'Processing...' : '✓ Complete & Ready for Delivery'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobCompletionModal;