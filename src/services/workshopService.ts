const API_BASE = "http://localhost:8080/api/v1";

export interface Worker {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: string;
    workerType: string;
    currentHourlyRate: number;
}

export interface KanbanJob {
    jobId: number;
    jobNumber: string;
    description: string;
    workshopStatus: string;
    priority: string;
    clientId: number;
    clientName: string;
    orderNumber: string | null;
    quoteNumber: string | null;
    expectedDeliveryDate: string | null;
    workerCount: number;
    qcProgress: number;
    totalHoursLogged: number;
}

export interface KanbanBoard {
    NEW: KanbanJob[];
    ASSIGNED: KanbanJob[];
    IN_PROGRESS: KanbanJob[];
    QC_IN_PROGRESS: KanbanJob[];
    READY_FOR_DELIVERY: KanbanJob[];
}

export interface TimeEntryRequest {
    jobId: number;
    workerId: number;
    workDate: string;
    normalHours: number;
    overtimeHours: number;
    description: string;
}

export async function getKanbanBoard(): Promise<KanbanBoard> {
    const res = await fetch(API_BASE + "/workshop/kanban");
    if (!res.ok) throw new Error("Failed to load kanban");
    return res.json();
}

export async function getWorkers(): Promise<Worker[]> {
    const res = await fetch(API_BASE + "/workers");
    if (!res.ok) throw new Error("Failed to load workers");
    return res.json();
}

export async function advanceJobStatus(jobId: number): Promise<void> {
    const res = await fetch(API_BASE + "/workshop/jobs/" + jobId + "/advance", {
        method: "POST"
    });
    if (!res.ok) throw new Error("Failed to advance job status");
}

export async function logTimeEntry(entry: TimeEntryRequest): Promise<void> {
    const res = await fetch(API_BASE + "/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error("Failed to log time");
}

export interface JobAssignment {
    id: number;
    jobId: number;
    workerId: number;
    workerName: string;
    role: string;
    status: string;
}

export async function getJobAssignments(jobId: number): Promise<JobAssignment[]> {
    const res = await fetch(API_BASE + "/assignments/jobs/" + jobId);
    if (!res.ok) throw new Error("Failed to load assignments");
    return res.json();
}

export async function assignWorker(jobId: number, workerId: number, role: string): Promise<void> {
    const res = await fetch(API_BASE + "/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, workerId, role, assignedById: null })
    });
    if (!res.ok) throw new Error("Failed to assign worker");
}

export async function removeAssignment(jobId: number, workerId: number): Promise<void> {
    const res = await fetch(API_BASE + "/assignments/jobs/" + jobId + "/workers/" + workerId, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to remove assignment");
}

// QC Checklist types and functions
export interface QcSignoff {
    id: number;
    jobId: number;
    holdingPointId: number;
    holdingPointName: string;
    sequenceNumber: number;
    status: 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';
    notes: string;
}

export interface QcProgress {
    jobId: number;
    total: number;
    passed: number;
    failed: number;
    pending: number;
    notApplicable: number;
    percentComplete: number;
    isComplete: boolean;
}

export async function getQcSignoffs(jobId: number): Promise<QcSignoff[]> {
    const res = await fetch(API_BASE + "/qc/jobs/" + jobId + "/signoffs");
    if (!res.ok) throw new Error("Failed to load QC signoffs");
    return res.json();
}

export async function getQcProgress(jobId: number): Promise<QcProgress> {
    const res = await fetch(API_BASE + "/qc/jobs/" + jobId + "/progress");
    if (!res.ok) throw new Error("Failed to load QC progress");
    return res.json();
}

export async function initializeQcSignoffs(jobId: number): Promise<QcProgress> {
    const res = await fetch(API_BASE + "/qc/jobs/" + jobId + "/initialize", { method: "POST" });
    if (!res.ok) throw new Error("Failed to initialize QC");
    const data = await res.json();
    return data.progress;
}

export async function passHoldingPoint(jobId: number, holdingPointId: number, notes: string = ""): Promise<QcProgress> {
    const res = await fetch(API_BASE + "/qc/jobs/" + jobId + "/holding-points/" + holdingPointId + "/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedById: null, notes })
    });
    if (!res.ok) throw new Error("Failed to pass holding point");
    const data = await res.json();
    return data.progress;
}

export async function failHoldingPoint(jobId: number, holdingPointId: number, notes: string = ""): Promise<QcProgress> {
    const res = await fetch(API_BASE + "/qc/jobs/" + jobId + "/holding-points/" + holdingPointId + "/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedById: null, notes })
    });
    if (!res.ok) throw new Error("Failed to fail holding point");
    const data = await res.json();
    return data.progress;
}

// Job Completion
export interface JobCompletionRequest {
    qcInspectorId: number;
    qcInspectorName: string;
    shopManagerId: number;
    shopManagerName: string;
    notes: string;
}

export async function completeJob(jobId: number, request: JobCompletionRequest): Promise<void> {
    const res = await fetch(API_BASE + "/workshop/jobs/" + jobId + "/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
    });
    if (!res.ok) throw new Error("Failed to complete job");
}
