const API_BASE_URL = 'http://localhost:8080/api/v1';

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
  async getLineItems(rfqId: number): Promise<RFQLineItem[]> {
    const response = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/line-items`);
    if (!response.ok) throw new Error('Failed to fetch line items');
    return response.json();
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

  async deleteAllLineItems(rfqId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/line-items`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete line items');
  }
};