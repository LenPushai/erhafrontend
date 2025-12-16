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
    notes: string;
}

export interface JobAssignment {
    id: number;
    jobId: number;
    workerId: number;
    workerName: string;
    role: string;
    status: string;
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