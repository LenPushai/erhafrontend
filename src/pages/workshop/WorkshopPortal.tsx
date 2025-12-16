import React, { useState, useEffect } from "react";
import { getKanbanBoard, advanceJobStatus, type KanbanBoard, type KanbanJob } from "../../services/workshopService";
import TimeEntryModal from "./TimeEntryModal";
import AssignWorkerModal from "./AssignWorkerModal";
import QcChecklistModal from "./QcChecklistModal";
import JobCompletionModal from "./JobCompletionModal";
import DeliveryModal from './DeliveryModal';
import "./WorkshopPortal.css";

const COLUMNS = [
    { key: "NEW", label: "NEW JOBS", color: "#3b82f6", action: "ASSIGN" },
    { key: "ASSIGNED", label: "ASSIGNED", color: "#8b5cf6", action: "START" },
    { key: "IN_PROGRESS", label: "IN PROGRESS", color: "#f59e0b", action: "QC CHECK" },
    { key: "QC_IN_PROGRESS", label: "QC CHECK", color: "#ef4444", action: "COMPLETE" },
    { key: "READY_FOR_DELIVERY", label: "READY", color: "#10b981", action: "DELIVER" },
    { key: "DELIVERED", label: "DELIVERED", color: "#6b7280", action: null },
];

const WorkshopPortal: React.FC = () => {
    const [kanban, setKanban] = useState<KanbanBoard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [timeEntryJob, setTimeEntryJob] = useState<KanbanJob | null>(null);
    const [assignJob, setAssignJob] = useState<KanbanJob | null>(null);
    const [qcJob, setQcJob] = useState<KanbanJob | null>(null);
    const [completionJob, setCompletionJob] = useState<KanbanJob | null>(null);
    const [deliveryJob, setDeliveryJob] = useState<KanbanJob | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getKanbanBoard();
            setKanban(data);
            setError(null);
        } catch (err) {
            setError("Failed to load workshop data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (job: KanbanJob, columnKey: string) => {
        if (columnKey === "NEW") {
            setAssignJob(job);
        } else if (columnKey === "QC_IN_PROGRESS") {
            setCompletionJob(job);
        } else if (columnKey === "READY_FOR_DELIVERY") {
            setDeliveryJob(job);
        } else {
            try {
                setActionLoading(job.jobId);
                await advanceJobStatus(job.jobId);
                await loadData();
            } catch (err) {
                setError("Failed to update job");
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleLogTime = (job: KanbanJob) => {
        setTimeEntryJob(job);
    };

    const getJobs = (key: string): KanbanJob[] => {
        if (!kanban) return [];
        return (kanban as any)[key] || [];
    };

    const getButtonColor = (columnKey: string): string => {
        switch (columnKey) {
            case "NEW": return "#3b82f6";
            case "ASSIGNED": return "#8b5cf6";
            case "IN_PROGRESS": return "#f59e0b";
            case "QC_IN_PROGRESS": return "#10b981";
            case "READY_FOR_DELIVERY": return "#06b6d4";
            default: return "#6b7280";
        }
    };

    if (loading && !kanban) {
        return <div className="workshop-loading">Loading Workshop...</div>;
    }

    return (
        <div className="workshop-portal">
            <header className="workshop-header">
                <h1>ERHA WORKSHOP</h1>
                <button onClick={loadData} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </header>

            {error && <div className="workshop-error">{error}</div>}

            <div className="kanban-board">
                {COLUMNS.map((col) => (
                    <div key={col.key} className="kanban-column">
                        <div className="column-header" style={{ borderColor: col.color }}>
                            {col.label} ({getJobs(col.key).length})
                        </div>
                        <div className="column-jobs">
                            {getJobs(col.key).map((job) => (
                                <div key={job.jobId} className="job-card">
                                    <div className="job-card-header">
                                        <span className={`priority-badge priority-${(job.priority || 'medium').toLowerCase()}`}>
                                            {job.priority || 'MEDIUM'}
                                        </span>
                                    </div>
                                    <div className="job-card-title">
                                        <strong>{job.jobNumber}</strong>
                                        <span className="client-name">{job.clientName || 'Unknown'}</span>
                                    </div>
                                    <p className="job-description">{job.description}</p>
                                    <div className="job-stats">
                                        <span><i className="bi bi-people-fill"></i> {job.workerCount || 0}</span>
                                        <span><i className="bi bi-clock"></i> {job.totalHoursLogged || 0}h</span>
                                    </div>
                                    <div className="job-actions">
                                        {(col.key === "ASSIGNED" || col.key === "IN_PROGRESS") && (
                                            <button
                                                className="action-btn log-time-btn"
                                                onClick={() => handleLogTime(job)}
                                            >
                                                LOG TIME
                                            </button>
                                        )}
                                        {col.action && (
                                            <button
                                                className="action-btn"
                                                style={{ backgroundColor: getButtonColor(col.key) }}
                                                onClick={() => handleAction(job, col.key)}
                                                disabled={actionLoading === job.jobId}
                                            >
                                                {actionLoading === job.jobId ? "..." : col.action}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {timeEntryJob && (
                <TimeEntryModal
                    jobId={timeEntryJob.jobId}
                    jobNumber={timeEntryJob.jobNumber}
                    onClose={() => setTimeEntryJob(null)}
                    onSuccess={loadData}
                />
            )}

            {assignJob && (
                <AssignWorkerModal
                    jobId={assignJob.jobId}
                    jobNumber={assignJob.jobNumber}
                    onClose={() => setAssignJob(null)}
                    onSuccess={loadData}
                />
            )}

            {qcJob && (
                <QcChecklistModal
                    jobId={qcJob.jobId}
                    jobNumber={qcJob.jobNumber}
                    onClose={() => setQcJob(null)}
                    onSuccess={loadData}
                />
            )}

            {completionJob && (
                <JobCompletionModal
                    jobId={completionJob.jobId}
                    jobNumber={completionJob.jobNumber}
                    onClose={() => setCompletionJob(null)}
                    onSuccess={loadData}
                />
            )}

            {deliveryJob && (
                <DeliveryModal
                    job={{
                        jobId: deliveryJob.jobId,
                        jobNumber: deliveryJob.jobNumber,
                        clientName: deliveryJob.clientName || 'N/A',
                        description: deliveryJob.description || ''
                    }}
                    onClose={() => setDeliveryJob(null)}
                    onDeliveryConfirmed={() => {
                        setDeliveryJob(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default WorkshopPortal;