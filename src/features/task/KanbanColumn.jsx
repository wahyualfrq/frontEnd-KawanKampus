import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus, MoreVertical, LayoutList } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

export default function KanbanColumn({ id, title, tasks, onAddTask, onDeleteTask }) {
  const { t } = usePreferences();
  const { setNodeRef, isOver } = useDroppable({ id });

  const columnConfig = {
    TODO: { bg: 'bg-[#FFF1E9]/50', badge: 'bg-[#FD6825]/10 text-[#FD6825]' },
    IN_PROGRESS: { bg: 'bg-[#F3F0FF]/50', badge: 'bg-[#7C3AED]/10 text-[#7C3AED]' },
    DONE: { bg: 'bg-[#ECFDF5]/50', badge: 'bg-[#10B981]/10 text-[#10B981]' },
  };

  const config = columnConfig[id] || columnConfig.TODO;

  return (
    <div className="flex flex-col w-full md:min-w-[340px] flex-1 min-h-[calc(100vh-250px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            {title}
          </h3>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
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
             <Plus size={16} />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
             <MoreVertical size={16} />
           </button>
        </div>
      </div>

      {/* Drop Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-3 rounded-[24px] transition-all border border-transparent",
          config.bg,
          isOver && "ring-2 ring-primary ring-offset-4 ring-offset-white"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
               <LayoutList size={20} className="text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('no_tasks')}</p>
          </div>
        )}

        {/* Inline Add Button */}
        <button
          onClick={() => onAddTask(id)}
          className="group flex items-center justify-center gap-2 py-3 mt-auto rounded-xl border border-dashed border-gray-300/60 text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-white transition-all text-xs font-bold"
        >
          <Plus size={14} className="group-hover:scale-110 transition-transform" />
          {t('tambah_tugas')}
        </button>
      </div>
    </div>
  );
}
