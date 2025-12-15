import React, { useState, useEffect } from "react";
import { getKanbanBoard, advanceJobStatus, type KanbanBoard, type KanbanJob } from "../../services/workshopService";
import "./WorkshopPortal.css";

const COLUMNS = [
    { key: "NEW", label: "NEW JOBS", color: "#3b82f6", action: "ASSIGN" },
    { key: "ASSIGNED", label: "ASSIGNED", color: "#8b5cf6", action: "START" },
    { key: "IN_PROGRESS", label: "IN PROGRESS", color: "#f59e0b", action: "QC CHECK" },
    { key: "QC_IN_PROGRESS", label: "QC CHECK", color: "#ef4444", action: "COMPLETE" },
    { key: "READY_FOR_DELIVERY", label: "READY", color: "#10b981", action: null },
];

const WorkshopPortal: React.FC = () => {
    const [kanban, setKanban] = useState<KanbanBoard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

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

    const handleAdvance = async (jobId: number) => {
        try {
            setActionLoading(jobId);
            await advanceJobStatus(jobId);
            await loadData();
        } catch (err) {
            setError("Failed to update job");
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogTime = (jobId: number, jobNumber: string) => {
        // TODO: Open time entry modal
        console.log('Log time for job:', jobId, jobNumber);
        alert(`Log Time for ${jobNumber} - Coming soon!`);
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
            default: return "#6b7280";
        }
    };

    if (loading && !kanban) {
        return <div className="workshop-loading">Loading Workshop...</div>;
    }

    return (
        <div className="workshop-portal">
            <header className="workshop-header">
                <h1>🔧 ERHA WORKSHOP</h1>
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
                                        <span>👷 {job.workerCount || 0}</span>
                                        <span>⏱️ {job.totalHoursLogged || 0}h</span>
                                    </div>
                                    <div className="job-actions">
                                        {col.key !== "NEW" && col.key !== "READY_FOR_DELIVERY" && (
                                            <button
                                                className="action-btn log-time-btn"
                                                onClick={() => handleLogTime(job.jobId, job.jobNumber)}
                                            >
                                                LOG TIME
                                            </button>
                                        )}
                                        {col.action && (
                                            <button
                                                className="action-btn"
                                                style={{ backgroundColor: getButtonColor(col.key) }}
                                                onClick={() => handleAdvance(job.jobId)}
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
        </div>
    );
};

export default WorkshopPortal;