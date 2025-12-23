import axios from 'axios';

const API_URL = 'https://erhauatdev7000.onrender.com/api/v1';

export const templateService = {
  getTemplates: async () => {
    const response = await axios.get(API_URL + '/task-templates');
    return response.data;
  },

  getTemplate: async (id: number) => {
    const response = await axios.get(API_URL + '/task-templates/' + id);
    return response.data;
  }
};

export default templateService;
