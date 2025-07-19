import axios from 'axios';

/**
 * 💰 Quote Service
 * API service for quote management operations
 */
class QuoteService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/quotes';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // 🎯 CORE OPERATIONS
  async createQuote(quoteData) {
    const response = await this.api.post('/', quoteData);
    return response.data;
  }

  async getQuoteById(id) {
    const response = await this.api.get(/);
    return response.data;
  }

  async updateQuote(id, quoteData) {
    const response = await this.api.put(/, quoteData);
    return response.data;
  }

  async deleteQuote(id) {
    await this.api.delete(/);
  }

  // 📋 LISTING & SEARCH
  async getAllQuotes(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc') {
    const response = await this.api.get('/', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async searchQuotes(filters, page = 0, size = 20) {
    const response = await this.api.get('/search', {
      params: { ...filters, page, size }
    });
    return response.data;
  }

  async getQuotesByStatus(status, page = 0, size = 20) {
    const response = await this.api.get(/status/, {
      params: { page, size }
    });
    return response.data;
  }

  // 💰 FINANCIAL OPERATIONS
  async getHighValueQuotes(threshold) {
    const response = await this.api.get('/high-value', {
      params: { threshold }
    });
    return response.data;
  }

  async getTotalApprovedValue() {
    const response = await this.api.get('/total-approved-value');
    return response.data;
  }

  // 🎯 WORKFLOW OPERATIONS
  async approveQuote(id, approver) {
    const response = await this.api.post(//approve, null, {
      params: { approver }
    });
    return response.data;
  }

  async rejectQuote(id, reviewer, reason) {
    const response = await this.api.post(//reject, null, {
      params: { reviewer, reason }
    });
    return response.data;
  }

  async sendToClient(id) {
    const response = await this.api.post(//send-to-client);
    return response.data;
  }

  // 📊 ANALYTICS
  async getAnalytics() {
    const response = await this.api.get('/analytics');
    return response.data;
  }

  async getStatusCounts() {
    const response = await this.api.get('/analytics/status-counts');
    return response.data;
  }

  async getDailyCreationStats(days = 30) {
    const response = await this.api.get('/analytics/daily-creation', {
      params: { days }
    });
    return response.data;
  }

  // 📅 TIME-BASED
  async getRecentQuotes(limit = 10) {
    const response = await this.api.get('/recent', {
      params: { limit }
    });
    return response.data;
  }

  async getExpiredQuotes() {
    const response = await this.api.get('/expired');
    return response.data;
  }

  // 🏥 HEALTH CHECK
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getCount() {
    const response = await this.api.get('/count');
    return response.data;
  }
}

export const quoteService = new QuoteService();
