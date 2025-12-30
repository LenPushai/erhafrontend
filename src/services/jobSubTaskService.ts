const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface JobSubTask {
  id?: number;
  jobId?: number;
  taskNumber: number;
  operationType: string;
  description: string;
  assignedTo: string;
  estimatedHours: number;
  actualHours?: number;
  status: string;
  dueDate?: string;
  notes?: string;
}

export const jobSubTaskService = {
  async getSubTasks(jobId: number): Promise<JobSubTask[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/sub-tasks`);
    if (!response.ok) throw new Error('Failed to fetch sub tasks');
    return response.json();
  },

  async createSubTasksBatch(jobId: number, subTasks: JobSubTask[]): Promise<JobSubTask[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/sub-tasks/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subTasks)
    });
    if (!response.ok) throw new Error('Failed to create sub tasks');
    return response.json();
  },

  async updateSubTask(jobId: number, subTaskId: number, subTask: Partial<JobSubTask>): Promise<JobSubTask> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/sub-tasks/${subTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subTask)
    });
    if (!response.ok) throw new Error('Failed to update sub task');
    return response.json();
  },

  async deleteSubTask(jobId: number, subTaskId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/sub-tasks/${subTaskId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete sub task');
  }
};