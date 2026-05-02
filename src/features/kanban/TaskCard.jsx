import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import useTaskStore from '../../store/taskStore';
import { cn } from '../../utils/cn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function TaskCard({ task, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const removeTask = useTaskStore(state => state.removeTask);
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    // Optimistic update
    removeTask(task.id);
    // API call
    deleteTaskMutation.mutate(task.id);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800",
        isDragging && "opacity-50",
        isOverlay && "rotate-2 scale-105 shadow-xl border-indigo-500/50 cursor-grabbing",
        !isOverlay && "cursor-grab hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 leading-relaxed break-words pr-6">
          {task.title}
        </p>
        <button
          onClick={handleDelete}
          disabled={deleteTaskMutation.isPending}
          className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center text-xs text-zinc-400">
          <GripVertical className="w-3 h-3 mr-1" />
          Drag to move
        </div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
          {task.title.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
