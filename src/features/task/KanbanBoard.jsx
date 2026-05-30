import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useTaskStore from '../../store/taskStore';
import taskService from '../../services/task.service';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskSummary from './TaskSummary';
import { Plus, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';
import historyService from '../../services/history.service';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function KanbanBoard() {
  const { t } = usePreferences();
  const { tasks, groupedTasks, setTasks, addTask, updateTask, deleteTask, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState('TODO');
  
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await taskService.getAllTasks();
      const taskArray = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskArray);
      return taskArray;
    }
  });

  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (newTask) => {
      addTask(newTask);
      queryClient.invalidateQueries(['tasks']);
      try {
        historyService.createHistory('CREATED_TASK', { taskId: newTask.id, title: newTask.title });
      } catch (e) {
        console.warn('[KanbanBoard] Failed to log task creation history:', e);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks']);
      try {
        const task = tasks.find(t => t.id === variables.id);
        const title = task ? task.title : '';
        const isCompleted = variables.data.status === 'DONE';
        const action = isCompleted ? 'COMPLETED_TASK' : 'UPDATED_TASK';
        historyService.createHistory(action, { taskId: variables.id, title });
      } catch (e) {
        console.warn('[KanbanBoard] Failed to log task update history:', e);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (_, id) => {
      deleteTask(id);
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let newStatus = null;
    if (COLUMNS.map(c => c.id).includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus && activeTask && activeTask.status !== newStatus) {
      moveTask(activeId, newStatus);
      updateMutation.mutate({ id: activeId, data: { status: newStatus } });
    }
    
    setActiveTask(null);
  };

  const openForm = (status = 'TODO') => {
    setInitialStatus(status);
    setIsFormOpen(true);
  };

  const handleCreateTask = (data) => {
    createMutation.mutate(data);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm(t('hapus_tugas_confirm') || 'Hapus tugas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('kanban_tugas')}</h1>
          <p className="text-sm text-gray-500 font-medium">{t('kelola_pantau')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-soft hover:bg-gray-50 transition-all">
            <Filter size={16} />
            {t('filter')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-soft hover:bg-gray-50 transition-all">
            {t('semua_kategori')} <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button 
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all"
          >
            <Plus size={18} />
            {t('tambah_tugas')}
          </button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.id === 'TODO' ? t('todo') : col.id === 'IN_PROGRESS' ? t('in_progress') : col.id === 'DONE' ? t('done') : col.title}
              tasks={groupedTasks[col.id] || []}
              onAddTask={openForm}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Summary */}
      <TaskSummary tasks={tasks} />

      {/* Modal Form */}
      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateTask}
        initialStatus={initialStatus}
      />
    </div>
  );
}
