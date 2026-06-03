import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Trash2,
  GripVertical,
  CheckCircle2,
  Clock,
  Pencil,
  MoreVertical,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

// ── Static config maps ────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'Akademik':          { bg: 'bg-blue-50',    text: 'text-blue-700'   },
  'Proyek':            { bg: 'bg-violet-50',  text: 'text-violet-700' },
  'Organisasi':        { bg: 'bg-amber-50',   text: 'text-amber-700'  },
  'Pengembangan Diri': { bg: 'bg-teal-50',    text: 'text-teal-700'   },
  'Lainnya':           { bg: 'bg-gray-100',   text: 'text-gray-600'   },
};

const PRIORITY_CONFIG = {
  Low:    { dot: 'bg-emerald-400', text: 'text-emerald-600' },
  Medium: { dot: 'bg-amber-400',   text: 'text-amber-600'   },
  High:   { dot: 'bg-red-400',     text: 'text-red-600'     },
};

const STATUS_MOVES = {
  TODO:        ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS: ['TODO', 'DONE'],
  DONE:        ['TODO', 'IN_PROGRESS'],
};

const STATUS_LABELS = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
};

const STATUS_BUTTON_CONFIG = {
  TODO:        'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100',
  IN_PROGRESS: 'border-orange-100 text-orange-600 bg-orange-50/50 hover:bg-orange-50',
  DONE:        'border-emerald-100 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50',
};

// ── TaskCard component ────────────────────────────────────────────────────────
export default function TaskCard({ task, isOverlay, onDelete, onEdit, onStatusChange }) {
  const { preferences } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close menu on outside click / Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const catCfg  = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG['Lainnya'];
  const priCfg  = PRIORITY_CONFIG[task.priority]  || PRIORITY_CONFIG.Medium;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const locale = preferences?.language === 'en' ? 'en-US' : 'id-ID';
      return new Date(dateString).toLocaleDateString(locale, {
        day:   '2-digit',
        month: 'short',
        year:  'numeric',
      });
    } catch {
      return null;
    }
  };

  // Due date overdue check
  const isOverdue = (() => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  })();

  const dueDateLabel = formatDate(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-white p-5 md:p-6 rounded-[20px] border border-gray-100 shadow-sm transition-all duration-200 select-none',
        isDragging  && 'opacity-40 scale-95',
        isOverlay   && 'rotate-1 scale-[1.03] shadow-xl border-[#FD6825]/30 z-50 cursor-grabbing',
        !isOverlay  && 'cursor-grab hover:border-[#FD6825]/20 hover:shadow-md hover:-translate-y-0.5',
        task.status === 'DONE' && 'opacity-85',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-4">

        {/* Top row: category badge + menu */}
        <div className="flex items-center justify-between gap-2.5">
          <span className={cn(
            'text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0',
            catCfg.bg, catCfg.text
          )}>
            {task.category || 'Akademik'}
          </span>

          {/* Priority dot */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {task.priority && (
              <div className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full shrink-0', priCfg.dot)} />
                <span className={cn('text-[10px] font-black uppercase tracking-wider', priCfg.text)}>{task.priority}</span>
              </div>
            )}
          </div>

          {/* Context menu — stop drag propagation */}
          {!isOverlay && (
            <div ref={menuRef} className="relative shrink-0">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-lg hover:bg-gray-50"
              >
                <MoreVertical size={13} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50 min-w-[170px]"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {/* Edit */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(task); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={12} className="text-[#7C3AED]" /> Edit
                  </button>

                  {/* Move status */}
                  {STATUS_MOVES[task.status]?.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onStatusChange(task.id, s); }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={12} className="text-[#FD6825]" />
                      Pindah ke {STATUS_LABELS[s]}
                    </button>
                  ))}

                  <div className="h-px bg-gray-100 my-1" />

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(task.id); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className={cn(
          'text-sm md:text-base font-black text-gray-900 leading-snug',
          task.status === 'DONE' && 'line-through text-gray-400 font-bold'
        )}>
          {task.title}
        </h4>

        {/* Description (truncated) */}
        {task.description && (
          <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">
            {task.description}
          </p>
        )}

        {/* Footer: date + done badge */}
        <div className="flex items-center justify-between pt-3.5 border-t border-gray-50 gap-2">
          <div className="flex items-center gap-1.5">
            {isOverdue ? (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle size={11} />
                <span className="text-[10px] md:text-xs font-bold">{dueDateLabel}</span>
              </div>
            ) : dueDateLabel ? (
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar size={11} />
                <span className="text-[10px] md:text-xs font-bold">{dueDateLabel}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-300">
                <Clock size={11} />
                <span className="text-[10px] md:text-xs font-medium">{formatDate(task.createdAt)}</span>
              </div>
            )}
          </div>

          {task.status === 'DONE' && (
            <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
              <CheckCircle2 size={11} color="white" />
            </div>
          )}
        </div>

        {/* Mobile-only quick status move buttons */}
        <div 
          className="flex md:hidden items-center gap-1.5 pt-3 border-t border-gray-100 mt-2" 
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mr-auto">
            {t('move_to')}:
          </span>
          {STATUS_MOVES[task.status]?.map((s) => {
            const btnStyles = STATUS_BUTTON_CONFIG[s] || 'border-gray-200 text-gray-600 bg-gray-50';
            return (
              <button
                key={s}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onStatusChange(task.id, s); 
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl text-[9px] font-black border transition-all active:scale-95",
                  btnStyles
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag handle indicator */}
      <div className="absolute top-2 right-2 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical size={13} />
      </div>
    </div>
  );
}
