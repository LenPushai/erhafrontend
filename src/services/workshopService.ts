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
}

export interface KanbanBoard {
  NEW: KanbanJob[];
  ASSIGNED: KanbanJob[];
  IN_PROGRESS: KanbanJob[];
  QC_IN_PROGRESS: KanbanJob[];
  READY_FOR_DELIVERY: KanbanJob[];
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