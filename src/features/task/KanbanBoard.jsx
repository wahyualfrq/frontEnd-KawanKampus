import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useTaskStore from '../../store/taskStore';
import taskService from '../../services/task.service';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskSummary from './TaskSummary';
import { Plus, Filter, ChevronDown, Search, X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';
import historyService from '../../services/history.service';
import { cn } from '../../utils/cn';

const COLUMNS = [
  { id: 'TODO',        title: 'To Do'       },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE',        title: 'Done'        },
];

const CATEGORIES = ['Semua', 'Akademik', 'Proyek', 'Organisasi', 'Pengembangan Diri', 'Lainnya'];
const PRIORITIES  = ['Semua', 'Low', 'Medium', 'High'];
const STATUSES    = ['Semua', 'TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export default function KanbanBoard() {
  const { t } = usePreferences();
  const { tasks, setTasks, addTask, updateTask, deleteTask, moveTask } = useTaskStore();
  const queryClient = useQueryClient();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTask,      setActiveTask]      = useState(null);
  const [isFormOpen,      setIsFormOpen]      = useState(false);
  const [initialStatus,   setInitialStatus]   = useState('TODO');
  const [editTask,        setEditTask]        = useState(null);

  // Filters
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeCategory,  setActiveCategory]  = useState('Semua');
  const [filterOpen,      setFilterOpen]      = useState(false);
  const [filterStatus,    setFilterStatus]    = useState('Semua');
  const [filterPriority,  setFilterPriority]  = useState('Semua');
  const [filterDeadline,  setFilterDeadline]  = useState('Semua');

  // Pending filter state (applied only when "Terapkan" is clicked)
  const [pendingStatus,   setPendingStatus]   = useState('Semua');
  const [pendingPriority, setPendingPriority] = useState('Semua');
  const [pendingDeadline, setPendingDeadline] = useState('Semua');

  const filterRef    = useRef(null);
  const categoryRef  = useRef(null);
  const [catDropOpen, setCatDropOpen] = useState(false);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current   && !filterRef.current.contains(e.target))   setFilterOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCatDropOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') { setFilterOpen(false); setCatDropOpen(false); } };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, []);

  // ── Sync pending filter when popover opens ────────────────────────────────
  useEffect(() => {
    if (filterOpen) {
      setPendingStatus(filterStatus);
      setPendingPriority(filterPriority);
      setPendingDeadline(filterDeadline);
    }
  }, [filterOpen]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await taskService.getAllTasks();
      const arr  = Array.isArray(data) ? data : (data?.tasks || []);
      setTasks(arr);
      return arr;
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (newTask) => {
      addTask(newTask);
      queryClient.invalidateQueries(['tasks']);
      try { historyService.createHistory('CREATED_TASK', { taskId: newTask.id, title: newTask.title }); } catch {}
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: (updatedTask, variables) => {
      // updatedTask is now the full object returned by the fixed backend
      if (updatedTask && updatedTask.id) {
        updateTask(updatedTask.id, updatedTask);
      } else {
        // Fallback: merge variables
        updateTask(variables.id, variables.data);
      }
      queryClient.invalidateQueries(['tasks']);
      try {
        const isCompleted = variables.data.status === 'DONE';
        const action = isCompleted ? 'COMPLETED_TASK' : 'UPDATED_TASK';
        const task = tasks.find((t) => t.id === variables.id);
        historyService.createHistory(action, { taskId: variables.id, title: task?.title || '' });
      } catch {}
    },
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (_, id) => {
      deleteTask(id);
      queryClient.invalidateQueries(['tasks']);
    },
  });

  // ── DnD ──────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || !activeTask) { setActiveTask(null); return; }

    const colIds = COLUMNS.map((c) => c.id);
    let newStatus = colIds.includes(over.id)
      ? over.id
      : tasks.find((t) => t.id === over.id)?.status;

    if (newStatus && newStatus !== activeTask.status) {
      moveTask(active.id, newStatus);
      updateMutation.mutate({ id: active.id, data: { status: newStatus } });
    }
    setActiveTask(null);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openForm = (status = 'TODO') => {
    setEditTask(null);
    setInitialStatus(status);
    setIsFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data, taskId) => {
    if (taskId) {
      // Edit mode
      updateMutation.mutate({ id: taskId, data });
    } else {
      // Create mode
      createMutation.mutate(data);
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm(t('hapus_tugas_confirm') || 'Hapus tugas ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    moveTask(taskId, newStatus);
    updateMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const applyFilter = () => {
    setFilterStatus(pendingStatus);
    setFilterPriority(pendingPriority);
    setFilterDeadline(pendingDeadline);
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setPendingStatus('Semua');
    setPendingPriority('Semua');
    setPendingDeadline('Semua');
    setFilterStatus('Semua');
    setFilterPriority('Semua');
    setFilterDeadline('Semua');
    setFilterOpen(false);
  };

  const isFilterActive = filterStatus !== 'Semua' || filterPriority !== 'Semua' || filterDeadline !== 'Semua';

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

    return tasks.filter((task) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (task.title || '').toLowerCase().includes(q)
          || (task.description || '').toLowerCase().includes(q)
          || (task.category || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      // Category chip
      if (activeCategory !== 'Semua') {
        const known = ['Akademik', 'Proyek', 'Organisasi', 'Pengembangan Diri'];
        if (activeCategory === 'Lainnya') {
          if (known.includes(task.category)) return false;
        } else {
          if (task.category !== activeCategory) return false;
        }
      }
      // Status filter
      if (filterStatus !== 'Semua' && task.status !== filterStatus) return false;
      // Priority filter
      if (filterPriority !== 'Semua' && task.priority !== filterPriority) return false;
      // Deadline filter
      if (filterDeadline !== 'Semua') {
        if (!task.dueDate) return false;
        const dd = new Date(task.dueDate);
        if (filterDeadline === 'Hari ini' && !(dd >= today && dd < new Date(today.getTime() + 86400000))) return false;
        if (filterDeadline === 'Minggu ini' && !(dd >= today && dd < weekEnd)) return false;
        if (filterDeadline === 'Terlewat' && !(dd < now && task.status !== 'DONE')) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, activeCategory, filterStatus, filterPriority, filterDeadline]);

  // Grouped filtered tasks for columns
  const groupedFiltered = useMemo(() => ({
    TODO:        filteredTasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE:        filteredTasks.filter((t) => t.status === 'DONE'),
  }), [filteredTasks]);

  const hasActiveFilter = isFilterActive || activeCategory !== 'Semua' || searchQuery.trim() !== '';

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#FD6825]/20 border-t-[#FD6825] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Memuat tugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('kanban_tugas') || 'Kanban Tugas'}</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{t('kelola_pantau') || 'Kelola dan pantau semua tugasmu'}</p>
          </div>
          <div className="flex items-center gap-2.5">

            {/* Filter button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-all',
                  isFilterActive
                    ? 'bg-[#FD6825] text-white border-[#FD6825] shadow-[#FD6825]/25'
                    : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                <SlidersHorizontal size={14} />
                {t('filter') || 'Filter'}
                {isFilterActive && (
                  <span className="ml-1 bg-white/30 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    aktif
                  </span>
                )}
              </button>

              {/* Filter popover */}
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-[20px] shadow-xl border border-gray-100 p-5 z-50 w-72"
                >
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">Filter Tugas</p>

                  {/* Status */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button key={s} onClick={() => setPendingStatus(s)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all',
                            pendingStatus === s
                              ? 'bg-[#FD6825] text-white border-[#FD6825]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          )}>
                          {s === 'Semua' ? 'Semua' : STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Prioritas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRIORITIES.map((p) => (
                        <button key={p} onClick={() => setPendingPriority(p)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all',
                            pendingPriority === p
                              ? 'bg-[#FD6825] text-white border-[#FD6825]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          )}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="mb-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Deadline</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Semua', 'Hari ini', 'Minggu ini', 'Terlewat'].map((d) => (
                        <button key={d} onClick={() => setPendingDeadline(d)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all',
                            pendingDeadline === d
                              ? 'bg-[#FD6825] text-white border-[#FD6825]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          )}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={resetFilter}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                      Reset
                    </button>
                    <button onClick={applyFilter}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FD6825] hover:bg-[#E85A1D] shadow-sm transition-all">
                      Terapkan
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category dropdown */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCatDropOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-all',
                  activeCategory !== 'Semua'
                    ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                    : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                {activeCategory === 'Semua' ? (t('semua_kategori') || 'Semua Kategori') : activeCategory}
                <ChevronDown size={13} className={cn('transition-transform', catDropOpen && 'rotate-180')} />
              </button>

              {catDropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-[16px] shadow-xl border border-gray-100 py-1.5 z-50 min-w-[180px]"
                >
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setCatDropOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs font-bold transition-colors',
                        activeCategory === cat
                          ? 'text-[#FD6825] bg-[#FFF1E9]'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}>
                      {cat === 'Semua' ? '📌 Semua Kategori' : cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Add task */}
            <button
              onClick={() => openForm()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FD6825] hover:bg-[#E85A1D] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FD6825]/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              {t('tambah_tugas') || 'Tambah Tugas'}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas berdasarkan judul atau kategori..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825] transition-all shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Active filter indicator */}
        {hasActiveFilter && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-bold text-[#FD6825] uppercase tracking-wider">Filter aktif</span>
            <span className="text-[10px] text-gray-500 font-medium">
              — Menampilkan {filteredTasks.length} dari {tasks.length} tugas
            </span>
            <button
              onClick={() => { resetFilter(); setActiveCategory('Semua'); setSearchQuery(''); }}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600 underline ml-1"
            >
              Reset semua
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4">
          <TaskSummary tasks={tasks} filteredCount={hasActiveFilter ? filteredTasks.length : null} />
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-5 overflow-x-auto pb-8 scrollbar-hide">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.id === 'TODO' ? (t('todo') || 'To Do') : col.id === 'IN_PROGRESS' ? (t('in_progress') || 'In Progress') : (t('done') || 'Done')}
              tasks={groupedFiltered[col.id] || []}
              onAddTask={openForm}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isOverlay
              onDelete={() => {}}
              onEdit={() => {}}
              onStatusChange={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Task Form Modal ── */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditTask(null); }}
        onSubmit={handleFormSubmit}
        initialStatus={initialStatus}
        editTask={editTask}
      />
    </div>
  );
}
