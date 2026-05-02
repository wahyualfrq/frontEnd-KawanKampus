import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { cn } from '../../utils/cn';

export default function KanbanColumn({ id, title, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-900 capitalize">
          {title.toLowerCase()}
        </h3>
        <span className="bg-white text-gray-500 py-1 px-3 rounded-lg text-xs font-bold shadow-soft border border-gray-100">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-4 p-4 rounded-[20px] bg-gray-50/50 border border-gray-100 min-h-[400px] transition-all",
          isOver && "bg-primary-soft border-primary/30"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
