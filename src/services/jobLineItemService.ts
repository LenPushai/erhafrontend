const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface JobLineItem {
  id?: number;
  jobId?: number;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  source: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
}

export const jobLineItemService = {
  async getLineItemsByJobId(jobId: number): Promise<JobLineItem[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items`);
    if (!response.ok) throw new Error('Failed to fetch line items');
    return response.json();
  },

  async createLineItem(jobId: number, lineItem: JobLineItem): Promise<JobLineItem> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lineItem)
    });
    if (!response.ok) throw new Error('Failed to create line item');
    return response.json();
  },

  async createLineItemsBatch(jobId: number, lineItems: JobLineItem[]): Promise<JobLineItem[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lineItems)
    });
    if (!response.ok) throw new Error('Failed to create line items');
    return response.json();
  },

  async updateLineItem(jobId: number, lineItemId: number, lineItem: JobLineItem): Promise<JobLineItem> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items/${lineItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lineItem)
    });
    if (!response.ok) throw new Error('Failed to update line item');
    return response.json();
  },

  async deleteLineItem(jobId: number, lineItemId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items/${lineItemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete line item');
  },

  async deleteAllByJobId(jobId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/line-items`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete line items');
  }
};