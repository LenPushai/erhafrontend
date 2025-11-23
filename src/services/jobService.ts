import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Job {
  jobId: number;
  jobNumber: string;
  quoteId?: number;
  rfqId?: number;
  clientId?: number;
  clientName?: string;
  description?: string;
  orderValueExcl: number;
  orderValueIncl: number;
  status: string;
  priority?: string;
  progressPercentage?: number;
  shopOrSite?: string;
  orderNo?: string;
  orderReceivedDate?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  deliveryNo?: string;
  deliveryDate?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  createdBy?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface JobCreateRequest {
  jobNumber: string;
  quoteId?: number;
  rfqId?: number;
  clientId?: number;
  clientName?: string;
  description?: string;
  orderValueExcl: number;
  orderValueIncl: number;
  status: string;
  priority?: string;
  progressPercentage?: number;
  shopOrSite?: string;
  orderNo?: string;
  orderReceivedDate?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  startDate?: string;
  targetCompletionDate?: string;
  createdBy?: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export const jobService = {
  // Get all jobs
  async getAllJobs(): Promise<Job[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Get job by ID
  async getJobById(id: number | string): Promise<Job> {
    try {
      const jobId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(jobId)) {
        throw new Error(`Invalid job ID: ${id}`);
      }

      console.log(`Fetching job from: ${API_BASE_URL}/jobs/${jobId}`);
      const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Create new job
  async createJob(job: JobCreateRequest): Promise<Job> {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs`, job);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  // Update job
  async updateJob(id: number, job: Partial<JobCreateRequest>): Promise<Job> {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, job);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete job
  async deleteJob(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/jobs/${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Update job status
  async updateJobStatus(id: number, status: string): Promise<Job> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },

  // Update job progress
  async updateJobProgress(id: number, progress: number): Promise<Job> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${id}/progress`, { progressPercentage: progress });
      return response.data;
    } catch (error) {
      console.error('Error updating job progress:', error);
      throw error;
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

