import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

export default function KanbanColumn({ id, title, tasks, onAddTask, onDeleteTask }) {
  const { t } = usePreferences();
  const { setNodeRef, isOver } = useDroppable({ id });

  const columnConfig = {
    TODO: { bg: 'bg-[#FFF1E9]/50', badge: 'bg-[#FD6825]', dot: 'bg-[#FD6825]' },
    IN_PROGRESS: { bg: 'bg-[#F3F0FF]/50', badge: 'bg-[#7C3AED]', dot: 'bg-[#7C3AED]' },
    DONE: { bg: 'bg-[#ECFDF5]/50', badge: 'bg-[#10B981]', dot: 'bg-[#10B981]' },
  };

  const config = columnConfig[id] || columnConfig.TODO;

  return (
    <div className="flex flex-col w-full md:min-w-[340px] flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            {title}
          </h3>
          <span className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-lg text-white shadow-sm",
            config.badge
          )}>
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
           <button 
            onClick={() => onAddTask(id)}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
           >
             <Plus size={18} />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
             <MoreVertical size={18} />
           </button>
        </div>
      </div>

      {/* Drop Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-4 p-4 rounded-[20px] transition-all min-h-[500px] border border-transparent",
          config.bg,
          isOver && "ring-2 ring-primary ring-offset-4 ring-offset-bg-neutral"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-gray-300 rounded-2xl p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('no_tasks')}</p>
          </div>
        )}

        {/* Inline Add Button */}
        <button
          onClick={() => onAddTask(id)}
          className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-white/50 transition-all text-xs font-bold"
        >
          <Plus size={14} />
          {t('tambah_tugas')}
        </button>
      </div>
    </div>
  );
}
