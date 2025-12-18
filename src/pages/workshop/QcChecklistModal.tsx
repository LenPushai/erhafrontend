import React, { useState, useEffect } from 'react';
import { getQcSignoffs, getQcProgress, initializeQcSignoffs, passHoldingPoint, failHoldingPoint, type QcSignoff, type QcProgress } from '../../services/workshopService';
import api from '../../services/api';
import './QcChecklistModal.css';

interface HoldingPoint {
    id: number;
    sequenceNumber: number;
    name: string;
    description: string;
    isActive: boolean;
}

interface QcChecklistModalProps {
    jobId: number;
    jobNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

const QcChecklistModal: React.FC<QcChecklistModalProps> = ({ jobId, jobNumber, onClose, onSuccess }) => {
    const [signoffs, setSignoffs] = useState<QcSignoff[]>([]);
    const [holdingPoints, setHoldingPoints] = useState<HoldingPoint[]>([]);
    const [progress, setProgress] = useState<QcProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const hpResponse = await api.get('/api/v1/qc/holding-points');
            setHoldingPoints(hpResponse.data);

            let signoffsData = await getQcSignoffs(jobId);
            if (signoffsData.length === 0) {
                await initializeQcSignoffs(jobId);
                signoffsData = await getQcSignoffs(jobId);
            }
            setSignoffs(signoffsData);

            const progressData = await getQcProgress(jobId);
            setProgress(progressData);
        } catch (err) {
            console.error('QC Load Error:', err);
            setError('Failed to load QC data');
        } finally {
            setLoading(false);
        }
    };

    const getDescription = (holdingPointId: number): string => {
        const hp = holdingPoints.find(h => h.id === holdingPointId);
        return hp?.description || `Step ${holdingPointId}`;
    };

    const handlePass = async (holdingPointId: number) => {
        setActionLoading(holdingPointId);
        setError(null);
        try {
            const newProgress = await passHoldingPoint(jobId, holdingPointId, notes[holdingPointId] || '');
            setProgress(newProgress);
            const signoffsData = await getQcSignoffs(jobId);
            setSignoffs(signoffsData);
            if (newProgress.isComplete) {
                onSuccess();
            }
        } catch (err) {
            setError('Failed to update');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFail = async (holdingPointId: number) => {
        if (!notes[holdingPointId]?.trim()) {
            setError('Notes required when failing a checkpoint');
            return;
        }
        setActionLoading(holdingPointId);
        setError(null);
        try {
            const newProgress = await failHoldingPoint(jobId, holdingPointId, notes[holdingPointId]);
            setProgress(newProgress);
            const signoffsData = await getQcSignoffs(jobId);
            setSignoffs(signoffsData);
        } catch (err) {
            setError('Failed to update');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASSED': return '✓';
            case 'FAILED': return '✗';
            case 'NOT_APPLICABLE': return '—';
            default: return '○';
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PASSED': return 'status-passed';
            case 'FAILED': return 'status-failed';
            case 'NOT_APPLICABLE': return 'status-na';
            default: return 'status-pending';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content qc-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>QC Checklist - 9 Point Inspection</h2>
                    <span className="job-badge">{jobNumber}</span>
                </div>

                {error && <div className="modal-error">{error}</div>}

                {progress && (
                    <div className="qc-progress-bar">
                        <div className="progress-stats">
                            <span className="stat-passed">✓ {progress.passed}</span>
                            <span className="stat-failed">✗ {progress.failed}</span>
                            <span className="stat-pending">○ {progress.pending}</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress.percentComplete}%` }}></div>
                        </div>
                        <div className="progress-percent">{progress.percentComplete}% Complete</div>
                    </div>
                )}

                {loading ? (
                    <div className="qc-loading">Loading checklist...</div>
                ) : (
                    <div className="qc-checklist">
                        {signoffs.map((s) => (
                            <div key={s.id} className={`qc-item ${getStatusClass(s.status)}`}>
                                <div className="qc-item-header">
                                    <span className={`qc-status-icon ${getStatusClass(s.status)}`}>
                                        {getStatusIcon(s.status)}
                                    </span>
                                    <span className="qc-step-num">{s.sequenceNumber}.</span>
                                    <span className="qc-step-name">{getDescription(s.holdingPointId)}</span>
                                </div>

                                {s.status === 'PENDING' && (
                                    <div className="qc-item-actions">
                                        <input
                                            type="text"
                                            placeholder="Notes (required for fail)"
                                            value={notes[s.holdingPointId] || ''}
                                            onChange={e => setNotes({ ...notes, [s.holdingPointId]: e.target.value })}
                                            className="qc-notes-input"
                                        />
                                        <div className="qc-buttons">
                                            <button
                                                className="btn-pass"
                                                onClick={() => handlePass(s.holdingPointId)}
                                                disabled={actionLoading === s.holdingPointId}
                                            >
                                                {actionLoading === s.holdingPointId ? '...' : 'PASS'}
                                            </button>
                                            <button
                                                className="btn-fail"
                                                onClick={() => handleFail(s.holdingPointId)}
                                                disabled={actionLoading === s.holdingPointId}
                                            >
                                                {actionLoading === s.holdingPointId ? '...' : 'FAIL'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {s.status !== 'PENDING' && s.notes && (
                                    <div className="qc-item-notes">Note: {s.notes}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-done" onClick={onClose}>
                        {progress?.isComplete ? 'Complete - Close' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QcChecklistModal;