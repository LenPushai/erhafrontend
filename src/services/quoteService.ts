import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Quote {
  quoteId: number;
  quoteNumber: string;
  rfqId?: number;
  jobId?: number;
  clientId?: number;
  clientName?: string;
  description?: string;
  quoteDate: string;
  validUntilDate: string;
  valueExclVat: number;
  valueInclVat: number;
  quoteStatus: string;
  shopOrSite?: string;
  orderNo?: string;
  orderReceivedDate?: string;
  remarks?: string;
  terms?: string;
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface QuoteCreateRequest {
  quoteNumber: string;
  rfqId?: number;
  clientId?: number;
  clientName?: string;
  description?: string;
  quoteDate: string;
  validUntilDate: string;
  valueExclVat: number;
  valueInclVat: number;
  quoteStatus: string;
  shopOrSite?: string;
  orderNo?: string;
  orderReceivedDate?: string;
  remarks?: string;
  terms?: string;
  createdBy?: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export const quoteService = {
  // Get all quotes
  async getAllQuotes(): Promise<Quote[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quotes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  },

  // Get quote by ID
  async getQuoteById(id: number | string): Promise<Quote> {
    try {
      const quoteId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(quoteId)) {
        throw new Error(`Invalid quote ID: ${id}`);
      }

      console.log(`Fetching quote from: ${API_BASE_URL}/quotes/${quoteId}`);
      const response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Create new quote
  async createQuote(quote: QuoteCreateRequest): Promise<Quote> {
    try {
      const response = await axios.post(`${API_BASE_URL}/quotes`, quote);
      return response.data;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  },

  // Update quote
  async updateQuote(id: number, quote: QuoteCreateRequest): Promise<Quote> {
    try {
      const response = await axios.put(`${API_BASE_URL}/quotes/${id}`, quote);
      return response.data;
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  },

  // Delete quote
  async deleteQuote(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/quotes/${id}`);
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  },

  // Accept quote (generates job)
  async acceptQuote(id: number): Promise<any> {
    try {
      console.log(`Accepting quote: ${API_BASE_URL}/quotes/${id}/accept`);
      const response = await axios.post(`${API_BASE_URL}/quotes/${id}/accept`);
      return response.data;
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // PIN Approval Methods
  async checkPinStatus(quoteId: number): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}/pin-status`);
    return response.data;
  },  // <-- ADD THIS COMMA!

  // DocuSign Integration Methods
  async sendForSignature(quoteId: number, data: { managerEmail: string; managerName: string }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/docusign/send-quote`, { quoteId, ...data });
      return response.data;
    } catch (error) {
      console.error('Error sending quote for signature:', error);
      throw error;
    }
  },

  async getSignatureStatus(quoteId: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/docusign/status/${quoteId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting signature status:', error);
      throw error;
    }
  },

  async downloadSignedDocument(quoteId: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}/signed-document`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading signed document:', error);
      throw error;
    }
  },

  async downloadCertificate(quoteId: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}/certificate`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }
};
// ============================================================================
// EXPORTS
// ============================================================================



