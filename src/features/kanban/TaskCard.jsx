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
        "group relative flex flex-col bg-white p-5 rounded-[16px] shadow-soft border border-gray-100 transition-all",
        isDragging && "opacity-50",
        isOverlay && "rotate-2 scale-105 shadow-medium border-primary cursor-grabbing",
        !isOverlay && "cursor-grab hover:border-primary/30 hover:shadow-medium"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-gray-900 mb-2 leading-relaxed break-words pr-6">
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
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <GripVertical className="w-3 h-3 mr-1" />
          Move Task
        </div>
        <div className="w-7 h-7 rounded-full orange-gradient flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-primary/20">
          {task.title.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
