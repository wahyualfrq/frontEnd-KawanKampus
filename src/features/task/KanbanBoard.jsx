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
  const [activeTab,       setActiveTab]       = useState('TODO');

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
      <div className="w-full flex flex-col space-y-6 md:space-y-8 animate-pulse">
        {/* Shimmering Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-xl" />
            <div className="h-4 w-72 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-24 bg-gray-200 rounded-2xl" />
            <div className="h-11 w-32 bg-gray-200 rounded-2xl" />
            <div className="h-11 w-28 bg-gray-200 rounded-2xl" />
          </div>
        </div>

        {/* Shimmering Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-8">
          {['To Do', 'In Progress', 'Done'].map((colTitle, i) => (
            <div key={i} className="bg-white/40 border border-gray-100 rounded-[28px] p-5 flex flex-col h-full min-h-[500px] space-y-4">
              {/* Column Title */}
              <div className="flex justify-between items-center pb-2">
                <div className="h-5 w-24 bg-gray-200 rounded-lg" />
                <div className="h-6 w-8 bg-gray-200 rounded-full" />
              </div>
              
              {/* Column Cards */}
              <div className="space-y-3 flex-1">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="bg-white border border-gray-100 p-4.5 rounded-[20px] shadow-soft space-y-3.5">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-4 bg-gray-200 rounded" />
                    </div>
                    <div className="h-5 w-5/6 bg-gray-200 rounded-lg" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded-lg" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 w-20 bg-gray-200 rounded-lg" />
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{t('kanban_tugas') || 'Kanban Tugas'}</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium mt-1">{t('kelola_pantau') || 'Kelola dan pantau semua tugasmu'}</p>
          </div>
          <div className="flex items-center flex-wrap gap-3">

            {/* Filter button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 px-4.5 py-3 border rounded-2xl text-xs md:text-sm font-bold shadow-sm hover:bg-gray-50 transition-all',
                  isFilterActive
                    ? 'bg-[#FD6825] text-white border-[#FD6825] shadow-[#FD6825]/25'
                    : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                <SlidersHorizontal size={15} />
                {t('filter') || 'Filter'}
                {isFilterActive && (
                  <span className="ml-1 bg-white/30 text-white text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full">
                    aktif
                  </span>
                )}
              </button>

              {/* Filter popover */}
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-[24px] shadow-xl border border-gray-100 p-6 z-50 w-80"
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
                  'flex items-center gap-2 px-4.5 py-3 border rounded-2xl text-xs md:text-sm font-bold shadow-sm hover:bg-gray-50 transition-all',
                  activeCategory !== 'Semua'
                    ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                    : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                {activeCategory === 'Semua' ? (t('semua_kategori') || 'Semua Kategori') : activeCategory}
                <ChevronDown size={14} className={cn('transition-transform', catDropOpen && 'rotate-180')} />
              </button>

              {catDropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-[16px] shadow-xl border border-gray-100 py-1.5 z-50 min-w-[190px]"
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
              className="flex items-center gap-2 px-5 py-3 bg-[#FD6825] hover:bg-[#E85A1D] text-white rounded-2xl text-xs md:text-sm font-bold shadow-md shadow-[#FD6825]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} />
              {t('tambah_tugas') || 'Tambah Tugas'}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas berdasarkan judul atau kategori..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825] transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Active filter indicator */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span className="font-bold text-[#FD6825] uppercase tracking-wider">Filter aktif</span>
              <span className="text-gray-500 font-medium">
                — Menampilkan {filteredTasks.length} dari {tasks.length} tugas
              </span>
              <button
                onClick={() => { resetFilter(); setActiveCategory('Semua'); setSearchQuery(''); }}
                className="font-bold text-gray-400 hover:text-[#FD6825] transition-colors underline ml-1"
              >
                Reset semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="w-full">
        <TaskSummary tasks={tasks} filteredCount={hasActiveFilter ? filteredTasks.length : null} />
      </div>

      {/* Column selector tabs for mobile/tablet */}
      <div className="lg:hidden flex border border-gray-150 p-1.5 rounded-2xl bg-white shadow-soft mb-6">
        {COLUMNS.map((col) => {
          const isActive = activeTab === col.id;
          const count = (groupedFiltered[col.id] || []).length;
          const title = col.id === 'TODO' 
            ? (t('todo') || 'To Do') 
            : col.id === 'IN_PROGRESS' 
              ? (t('in_progress') || 'In Progress') 
              : (t('done') || 'Done');
          return (
            <button
              key={col.id}
              onClick={() => setActiveTab(col.id)}
              className={cn(
                "flex-1 py-3 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                isActive 
                  ? "bg-[#FFF1E9] text-[#FD6825] shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <span>{title}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                isActive ? "bg-[#FD6825]/15 text-[#FD6825]" : "bg-gray-100 text-gray-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Kanban Board ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-8">
          {COLUMNS.map((col) => {
            const isVisible = activeTab === col.id;
            return (
              <div key={col.id} className={cn("w-full flex flex-col h-full", !isVisible && "hidden lg:flex")}>
                <KanbanColumn
                  id={col.id}
                  title={col.id === 'TODO' ? (t('todo') || 'To Do') : col.id === 'IN_PROGRESS' ? (t('in_progress') || 'In Progress') : (t('done') || 'Done')}
                  tasks={groupedFiltered[col.id] || []}
                  onAddTask={openForm}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onStatusChange={handleStatusChange}
                />
              </div>
            );
          })}
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
