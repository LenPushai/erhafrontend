import React, { useState, useEffect } from "react";
import { getKanbanBoard, type KanbanBoard, type KanbanJob } from "../../services/workshopService";
import "./WorkshopPortal.css";

const COLUMNS = [
    { key: "NEW", label: "NEW JOBS", color: "#3b82f6" },
    { key: "ASSIGNED", label: "ASSIGNED", color: "#8b5cf6" },
    { key: "IN_PROGRESS", label: "IN PROGRESS", color: "#f59e0b" },
    { key: "QC_IN_PROGRESS", label: "QC CHECK", color: "#ef4444" },
    { key: "READY_FOR_DELIVERY", label: "READY", color: "#10b981" },
];

const WorkshopPortal: React.FC = () => {
    const [kanban, setKanban] = useState<KanbanBoard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const getJobs = (key: string): KanbanJob[] => {
        if (!kanban) return [];
        return (kanban as any)[key] || [];
    };

    if (loading) {
        return <div className="workshop-loading">Loading Workshop...</div>;
    }

    return (
        <div className="workshop-portal">
            <header className="workshop-header">
                <h1>🔧 ERHA WORKSHOP</h1>
                <button onClick={loadData} disabled={loading}>Refresh</button>
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
                                    <strong>{job.jobNumber}</strong>
                                    <p>{job.description}</p>
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