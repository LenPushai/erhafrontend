import React, { useState, useEffect } from 'react';
import { getWorkers, logTimeEntry, type Worker } from '../../services/workshopService';
import './TimeEntryModal.css';

interface TimeEntryModalProps {
    jobId: number;
    jobNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ jobId, jobNumber, onClose, onSuccess }) => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<number | ''>('');
    const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
    const [normalHours, setNormalHours] = useState<number>(0);
    const [overtimeHours, setOvertimeHours] = useState<number>(0);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorker) {
            setError('Please select a worker');
            return;
        }
        if (normalHours === 0 && overtimeHours === 0) {
            setError('Please enter hours worked');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await logTimeEntry({
                jobId,
                workerId: Number(selectedWorker),
                workDate,
                normalHours,
                overtimeHours,
                notes
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to save time entry');
        } finally {
            setLoading(false);
        }
    };

    const quickHours = [2, 4, 6, 8, 10, 12];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Log Time</h2>
                    <span className="job-badge">{jobNumber}</span>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Worker</label>
                        <select
                            value={selectedWorker}
                            onChange={e => setSelectedWorker(e.target.value ? Number(e.target.value) : '')}
                            required
                        >
                            <option value="">-- Select Worker --</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.firstName} {w.lastName} ({w.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={workDate}
                            onChange={e => setWorkDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Normal Hours (NT)</label>
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={normalHours}
                                onChange={e => setNormalHours(Number(e.target.value))}
                            />
                            <div className="quick-buttons">
                                {quickHours.map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        className="quick-btn"
                                        onClick={() => setNormalHours(h)}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Overtime Hours (OT)</label>
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={overtimeHours}
                                onChange={e => setOvertimeHours(Number(e.target.value))}
                            />
                            <div className="quick-buttons">
                                {[1, 2, 3, 4, 5, 6].map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        className="quick-btn ot"
                                        onClick={() => setOvertimeHours(h)}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Work description..."
                            rows={2}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Time Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeEntryModal;