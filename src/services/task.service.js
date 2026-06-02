import api from './api';

const taskService = {
  /** Fetch all tasks for the current user (high limit — client does filtering) */
  getAllTasks: async () => {
    const response = await api.get('/tasks?limit=200');
    const data = response.data.data || response.data;
    // Backend returns { tasks, meta } or direct array
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.tasks)) return data.tasks;
    return [];
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
  },
};

export default taskService;
