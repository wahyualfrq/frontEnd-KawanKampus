import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { cn } from '../../utils/cn';

export default function KanbanColumn({ id, title, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
          {title.toLowerCase()}
        </h3>
        <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-0.5 px-2.5 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-3 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/20 border border-zinc-200/50 dark:border-zinc-800/50 min-h-[200px] transition-colors",
          isOver && "bg-zinc-200/50 dark:bg-zinc-800/50 border-indigo-300 dark:border-indigo-500/30"
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
