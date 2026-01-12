const API_BASE_URL = 'https://erha-ops-backend-ac4a0f925914.herokuapp.com/api/v1';

export interface RFQLineItem {
  id?: number;
  rfqId?: number;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPrice: number;
  estimatedLineTotal: number;
  drawingReference?: string;
  notes?: string;
}

export const rfqLineItemService = {
  async getLineItemsByRfqId(rfqId: number): Promise<RFQLineItem[]> {
    const response = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/line-items`);
    if (!response.ok) throw new Error('Failed to fetch line items');
    return response.json();
  },

  async getLineItems(rfqId: number): Promise<RFQLineItem[]> {
    return this.getLineItemsByRfqId(rfqId);
  },

  async createLineItemsBatch(rfqId: number, lineItems: RFQLineItem[]): Promise<RFQLineItem[]> {
    const response = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/line-items/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lineItems)
    });
    if (!response.ok) throw new Error('Failed to create line items');
    return response.json();
  },

  async deleteAllByRfqId(rfqId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/line-items`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete line items');
  },

  async deleteAllLineItems(rfqId: number): Promise<void> {
    return this.deleteAllByRfqId(rfqId);
  }
};