import api from './api';

const settingsService = {
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data?.data || response.data;
  },

  updateProfile: async (payload) => {
    const response = await api.put('/settings/profile', payload);
    return response.data?.data || response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/settings/preferences');
    return response.data?.data || response.data;
  },

  updatePreferences: async (payload) => {
    const response = await api.put('/settings/preferences', payload);
    return response.data?.data || response.data;
  },

  changePassword: async (payload) => {
    const response = await api.put('/settings/security/password', payload);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.post('/settings/privacy/clear-history');
    return response.data;
  },

  deleteAccount: async (payload) => {
    const response = await api.delete('/settings/account', { data: payload });
    return response.data;
  },
};

export default settingsService;
