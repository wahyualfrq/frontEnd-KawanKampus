import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, LayoutList } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

const COLUMN_CONFIG = {
  TODO: {
    bg:    'bg-[#FFF6F0]',
    ring:  'ring-[#FD6825]',
    badge: 'bg-[#FD6825]/10 text-[#FD6825]',
    dot:   'bg-[#FD6825]',
    emptyIcon: '📋',
    emptyText: 'Belum ada tugas',
  },
  IN_PROGRESS: {
    bg:    'bg-[#F5F3FF]',
    ring:  'ring-[#7C3AED]',
    badge: 'bg-[#7C3AED]/10 text-[#7C3AED]',
    dot:   'bg-[#7C3AED]',
    emptyIcon: '⚡',
    emptyText: 'Belum ada tugas yang dikerjakan',
  },
  DONE: {
    bg:    'bg-[#ECFDF5]',
    ring:  'ring-[#10B981]',
    badge: 'bg-[#10B981]/10 text-[#10B981]',
    dot:   'bg-[#10B981]',
    emptyIcon: '✅',
    emptyText: 'Belum ada tugas yang selesai',
  },
};

export default function KanbanColumn({ id, title, tasks, onAddTask, onDeleteTask, onEditTask, onStatusChange }) {
  const { t } = usePreferences();
  const { setNodeRef, isOver } = useDroppable({ id });

  const cfg = COLUMN_CONFIG[id] || COLUMN_CONFIG.TODO;

  return (
    <div className="flex flex-col w-full md:min-w-[320px] md:max-w-[380px] flex-1">

      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />
          <h3 className="text-sm font-black text-gray-900 tracking-tight">{title}</h3>
          <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full', cfg.badge)}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-1.5 text-gray-400 hover:text-[#FD6825] hover:bg-[#FFF1E9] rounded-xl transition-all"
          title="Tambah tugas"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-3 p-3 rounded-[20px] transition-all border-2 border-transparent min-h-[200px]',
          cfg.bg,
          isOver && `ring-2 ${cfg.ring} ring-offset-2 border-dashed border-current`
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center text-xl shadow-sm border border-white">
              {cfg.emptyIcon}
            </div>
            <p className="text-[11px] font-bold text-gray-400 text-center leading-relaxed">
              {cfg.emptyText}
            </p>
            {id === 'TODO' && (
              <button
                onClick={() => onAddTask(id)}
                className="text-[10px] font-black text-[#FD6825] hover:underline"
              >
                + Tambah tugas pertama
              </button>
            )}
          </div>
        )}

        {/* Bottom add button */}
        <button
          onClick={() => onAddTask(id)}
          className="group flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200/80 text-gray-400 hover:text-[#FD6825] hover:border-[#FD6825]/40 hover:bg-white/60 transition-all text-[11px] font-bold mt-1"
        >
          <Plus size={13} className="group-hover:scale-110 transition-transform" />
          {t('tambah_tugas') || 'Tambah Tugas'}
        </button>
      </div>
    </div>
  );
}
