import axios from 'axios';
import type { Job } from '../types/job';

const API_BASE_URL = 'http://localhost:8080/api/v1';



// Get all jobs
export const getAllJobs = async (): Promise<Job[]> => {
  const response = await axios.get(`${API_BASE_URL}/jobs`);
  return response.data;
};

// Get job by ID
export const getJobById = async (id: number): Promise<Job> => {
  const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
  return response.data;
};

// Get child jobs
export const getChildJobs = async (parentId: number): Promise<Job[]> => {
  const response = await axios.get(`${API_BASE_URL}/jobs/${parentId}/children`);
  return response.data;
};

// Create a new job
export const createJob = async (job: Partial<Job>): Promise<Job> => {
  const response = await axios.post(`${API_BASE_URL}/jobs`, job);
  return response.data;
};

// Update a job
export const updateJob = async (id: number, job: Partial<Job>): Promise<Job> => {
  const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, job);
  return response.data;
};

// Delete a job
export const deleteJob = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/jobs/${id}`);
};

// Create child jobs
export const createChildJobs = async (parentId: number, children: Partial<Job>[]): Promise<Job[]> => {
  const response = await axios.post(`${API_BASE_URL}/jobs/${parentId}/children`, children);
  return response.data;
};

// Add tasks to job
export const addTasksToJob = async (jobId: number, tasks: any[]): Promise<void> => {
  await axios.post(`${API_BASE_URL}/jobs/${jobId}/tasks`, tasks);
};

export default {
  getAllJobs,
  getJobById,
  getChildJobs,
  createJob,
  updateJob,
  deleteJob,
  createChildJobs,
  addTasksToJob,
};