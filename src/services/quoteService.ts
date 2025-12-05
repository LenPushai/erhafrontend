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

export interface ApprovalPinResponse {
  pin: string;
  expiresAt: string;
  quoteNumber: string;
  quoteId: number;
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

  // ============================================================================
  // PIN APPROVAL METHODS
  // ============================================================================

  async generateApprovalPin(quoteId: number): Promise<ApprovalPinResponse> {
    try {
      console.log(`Generating approval PIN for quote: ${quoteId}`);
      const response = await axios.post(`${API_BASE_URL}/quotes/${quoteId}/generate-approval-pin`);
      return response.data;
    } catch (error: any) {
      console.error('Error generating approval PIN:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  async approveWithPin(quoteNumber: string, pin: string): Promise<Quote> {
    try {
      console.log(`Approving quote ${quoteNumber} with PIN`);
      const response = await axios.post(`${API_BASE_URL}/quotes/approve-with-pin`, { quoteNumber, pin });
      return response.data;
    } catch (error: any) {
      console.error('Error approving with PIN:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  async checkPinStatus(quoteId: number): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quotes/${quoteId}/pin-status`);
      return response.data;
    } catch (error) {
      console.error('Error checking PIN status:', error);
      throw error;
    }
  },

  // ============================================================================
  // DOCUSIGN INTEGRATION METHODS
  // ============================================================================

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

  async downloadSignedDocument(qunoteId: number): Promise<Blob> {
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