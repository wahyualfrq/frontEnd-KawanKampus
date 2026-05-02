import { create } from 'zustand';

const useTaskStore = create((set, get) => ({
  tasks: [],
  groupedTasks: {
    TODO: [],
    IN_PROGRESS: [],
    DONE: []
  },

  setTasks: (tasks) => {
    set({ tasks });
    get().groupTasks();
  },

  groupTasks: () => {
    const { tasks } = get();
    set({
      groupedTasks: {
        TODO: tasks.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
        DONE: tasks.filter((t) => t.status === 'DONE'),
      }
    });
  },

  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    get().groupTasks();
  },

  updateTask: (id, updatedData) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedData } : task
      ),
    }));
    get().groupTasks();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    get().groupTasks();
  },

  moveTask: (id, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      ),
    }));
    get().groupTasks();
  },
}));

export default useTaskStore;
