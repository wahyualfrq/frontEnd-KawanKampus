import api from './api';

const taskService = {
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data.data || response.data.tasks || response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data.data || response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}`, taskData);
    return response.data.data || response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default taskService;
