import api from './api';

const historyService = {
  getHistories: async () => {
    const response = await api.get('/histories');
    return response.data?.data || response.data || [];
  },

  createHistory: async (action, metadata = {}) => {
    try {
      const response = await api.post('/histories', { action, metadata });
      return response.data?.data || response.data;
    } catch (e) {
      console.warn('[HistoryService] Failed to record history activity:', e.message);
      return null;
    }
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/histories/${id}`);
    return response.data;
  },

  clearHistories: async () => {
    const response = await api.delete('/histories');
    return response.data;
  }
};

export default historyService;
