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