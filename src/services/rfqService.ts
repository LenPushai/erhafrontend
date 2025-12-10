// src/services/rfqService.ts
// ERHA OPS - RFQ Service
// CLEAN VERSION - With getRfqById function

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface RFQ {
  id: number;
  rfqNumber: string;
  clientName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  projectName: string;
  description: string;q
  receivedDate: string;
  requiredBy: string;
  priority: string;
  status: string;
  operatingEntity: string;
  workLocation: string;
  estimatedValue?: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const rfqService = {
  // Get all RFQs
  async getAllRfqs(): Promise<RFQ[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfqs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch RFQs: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      throw error;
    }
  },

  // Get RFQ by ID
  async getRfqById(id: number): Promise<RFQ> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfqs/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch RFQ: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching RFQ by ID:', error);
      throw error;
    }
  },

  // Create RFQ
  async createRfq(rfq: Omit<RFQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<RFQ> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rfq),
      });
      if (!response.ok) {
        throw new Error(`Failed to create RFQ: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  },

  // Update RFQ
  async updateRfq(id: number, rfq: Partial<RFQ>): Promise<RFQ> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rfq),
      });
      if (!response.ok) {
        throw new Error(`Failed to update RFQ: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating RFQ:', error);
      throw error;
    }
  },

  // Delete RFQ
  async deleteRfq(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfqs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete RFQ: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      throw error;
    }
  },
};

