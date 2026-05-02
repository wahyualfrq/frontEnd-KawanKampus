import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  Trash2, 
  GripVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TaskCard({ task, isOverlay, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusConfig = {
    TODO: { color: 'text-orange-500', bg: 'bg-[#FFF1E9]', icon: Clock },
    IN_PROGRESS: { color: 'text-purple-600', bg: 'bg-[#F3F0FF]', icon: Clock },
    DONE: { color: 'text-emerald-600', bg: 'bg-[#ECFDF5]', icon: CheckCircle2 },
  };

  const config = statusConfig[task.status] || statusConfig.TODO;

  const formatDate = (dateString) => {
    if (!dateString) return '25 Mei 2024';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '25 Mei 2024';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white p-5 rounded-[16px] border border-gray-100 shadow-soft transition-all duration-200",
        isDragging && "opacity-50",
        isOverlay && "rotate-2 scale-105 shadow-medium border-primary z-50 cursor-grabbing",
        !isOverlay && "cursor-grab hover:border-primary/20 hover:shadow-medium"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-4">
        {/* Category & Action */}
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider",
            config.bg,
            config.color
          )}>
            {task.category || 'Akademik'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 leading-relaxed pr-2">
          {task.title}
        </h4>

        {/* Progress (Optional) */}
        {task.status === 'IN_PROGRESS' && (
           <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                 <span>Progres</span>
                 <span>{task.progress || 60}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div 
                  className="h-full bg-ai-purple rounded-full" 
                  style={{ width: `${task.progress || 60}%` }}
                 ></div>
              </div>
           </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold">
              {formatDate(task.createdAt)}
            </span>
          </div>
          <div className="flex -space-x-2">
            <img className="w-6 h-6 rounded-full border-2 border-white" src={`https://ui-avatars.com/api/?name=${task.assignee || 'User'}&background=random`} alt="Avatar" />
            {task.status === 'DONE' && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white">
                <CheckCircle2 size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Drag Handle indicator */}
      <div className="absolute top-2 right-2 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>
    </div>
  );
}
