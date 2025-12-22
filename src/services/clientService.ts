import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Client {
  id: number;
  clientName: string;
  clientCode: string;
  clientType: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  physicalAddress?: string;
  postalAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  vatNumber?: string;
  registrationNumber?: string;
  industry?: string;
  paymentTermsDays: number;
  paymentTerms?: string;
  creditLimit?: number;
  status: string;
  notes?: string;
  companyName?: string;
  createdAt: string;
  updatedAt?: string;
}

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients`);
      
      let clients: any[] = [];
      
      if (response.data.content && Array.isArray(response.data.content)) {
        clients = response.data.content;
      } else if (Array.isArray(response.data)) {
        clients = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        return [];
      }

      return clients.map((client: any) => ({
        id: client.id,
        clientName: client.clientName || client.client_name,
        clientCode: client.clientCode || client.client_code,
        clientType: client.clientType || client.client_type,
        contactPerson: client.contactPerson || client.contact_person,
        email: client.email,
        phone: client.phone,
        mobile: client.mobile,
        physicalAddress: client.physicalAddress || client.physical_address,
        postalAddress: client.postalAddress || client.postal_address,
        city: client.city,
        province: client.province,
        postalCode: client.postalCode || client.postal_code,
        country: client.country,
        vatNumber: client.vatNumber || client.vat_number,
        registrationNumber: client.registrationNumber || client.registration_number,
        industry: client.industry,
        paymentTermsDays: client.paymentTermsDays || client.payment_terms_days || 30,
        paymentTerms: client.paymentTerms || client.payment_terms,
        creditLimit: client.creditLimit || client.credit_limit,
        status: client.status || 'ACTIVE',
        notes: client.notes,
        companyName: client.companyName || client.company_name,
        createdAt: client.createdAt || client.created_at,
        updatedAt: client.updatedAt || client.updated_at
      }));
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getClientById(id: number): Promise<Client> {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${id}`);
      const client = response.data;
      
      return {
        id: client.id,
        clientName: client.clientName || client.client_name,
        clientCode: client.clientCode || client.client_code,
        clientType: client.clientType || client.client_type,
        contactPerson: client.contactPerson || client.contact_person,
        email: client.email,
        phone: client.phone,
        mobile: client.mobile,
        physicalAddress: client.physicalAddress || client.physical_address,
        postalAddress: client.postalAddress || client.postal_address,
        city: client.city,
        province: client.province,
        postalCode: client.postalCode || client.postal_code,
        country: client.country,
        vatNumber: client.vatNumber || client.vat_number,
        registrationNumber: client.registrationNumber || client.registration_number,
        industry: client.industry,
        paymentTermsDays: client.paymentTermsDays || client.payment_terms_days || 30,
        paymentTerms: client.paymentTerms || client.payment_terms,
        creditLimit: client.creditLimit || client.credit_limit,
        status: client.status || 'ACTIVE',
        notes: client.notes,
        companyName: client.companyName || client.company_name,
        createdAt: client.createdAt || client.created_at,
        updatedAt: client.updatedAt || client.updated_at
      };
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients`, client);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async updateClient(id: number, client: Partial<Client>): Promise<Client> {
    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}`, client);
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  async deleteClient(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/clients/${id}`);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};


