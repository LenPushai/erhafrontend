import axios from 'axios';

const API_BASE_URL = 'https://erha-ops-backend-ac4a0f925914.herokuapp.com/api/v1';

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
