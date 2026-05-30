import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  LayoutList 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

export default function TaskSummary({ tasks = [] }) {
  const { t } = usePreferences();
  const taskArray = Array.isArray(tasks) ? tasks : [];
  
  const stats = [
    {
      label: t('total_tugas'),
      value: taskArray.length,
      desc: t('all_tasks_desc'),
      icon: LayoutList,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    },
    {
      label: t('sedang_dikerjakan'),
      value: taskArray.filter(t => t.status === 'IN_PROGRESS').length,
      desc: t('tasks_in_progress_desc'),
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: t('belum_dikerjakan'),
      value: taskArray.filter(t => t.status === 'TODO').length,
      desc: t('tasks_pending_desc'),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: t('selesai'),
      value: taskArray.filter(t => t.status === 'DONE').length,
      desc: t('tasks_completed_desc'),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="sticky top-[-32px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 -mx-8 px-8 py-3 mb-8 -mt-2">
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">{t('ringkasan_tugas')}</span>
        <div className="flex items-center gap-4">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-50 shadow-sm"
            >
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", stat.bgColor)}>
                <stat.icon size={10} className={stat.color} />
              </div>
              <span className="text-xs font-bold text-gray-900">{stat.value}</span>
              <span className="text-[10px] font-medium text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
