// ============================================================
// ERHA OPS - Pastel Export Service
// Handles CSV exports for Sage Pastel integration
// ============================================================

import api from './api';

const API_BASE = '/api/export/pastel';

export const pastelExportService = {
  // Health check
  checkHealth: async (): Promise<{ status: string; service: string; version: string }> => {
    const response = await api.get(`${API_BASE}/health`);
    return response.data;
  },

  // === CLIENT EXPORTS ===
  
  // Export all clients as CSV
  exportAllClients: async (): Promise<void> => {
    const response = await api.get(`${API_BASE}/clients`, {
      responseType: 'blob'
    });
    downloadFile(response.data, `ERHA_Clients_Pastel_${getTimestamp()}.csv`);
  },

  // Export single client as CSV
  exportClient: async (clientId: number): Promise<void> => {
    const response = await api.get(`${API_BASE}/clients/${clientId}`, {
      responseType: 'blob'
    });
    downloadFile(response.data, `ERHA_Client_${clientId}_Pastel_${getTimestamp()}.csv`);
  },

  // === QUOTE EXPORTS ===
  
  // Export single quote as CSV
  exportQuote: async (quoteId: number): Promise<void> => {
    const response = await api.get(`${API_BASE}/quotes/${quoteId}`, {
      responseType: 'blob'
    });
    downloadFile(response.data, `ERHA_Quote_${quoteId}_Pastel_${getTimestamp()}.csv`);
  },

  // Export multiple quotes as CSV
  exportQuotesBulk: async (quoteIds: number[]): Promise<void> => {
    const response = await api.post(`${API_BASE}/quotes/bulk`, quoteIds, {
      responseType: 'blob'
    });
    downloadFile(response.data, `ERHA_Quotes_Bulk_Pastel_${getTimestamp()}.csv`);
  },

  // Export all approved quotes as CSV
  exportApprovedQuotes: async (): Promise<void> => {
    const response = await api.get(`${API_BASE}/quotes/approved`, {
      responseType: 'blob'
    });
    downloadFile(response.data, `ERHA_Quotes_Approved_Pastel_${getTimestamp()}.csv`);
  }
};

// Helper function to trigger file download
function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Helper function for timestamp in filename
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '');
}

export default pastelExportService;