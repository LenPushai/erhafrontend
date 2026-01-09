import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const templateService = {
  getAllTemplates: async () => {
    const response = await axios.get(`/task-templates`);
    return response.data;
  },
  
  getTemplateById: async (id: number) => {
    const response = await axios.get(`/task-templates/`);
    return response.data;
  }
};
