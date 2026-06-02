import { Briefcase, Clock, CheckCircle, LayoutList } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

export default function TaskSummary({ tasks = [], filteredCount = null }) {
  const { t } = usePreferences();
  const taskArray = Array.isArray(tasks) ? tasks : [];

  const stats = [
    {
      label:   t('total_tugas')       || 'Total Tugas',
      value:   taskArray.length,
      desc:    t('all_tasks_desc')    || 'semua tugas',
      icon:    LayoutList,
      color:   'text-gray-500',
      bgColor: 'bg-gray-100',
    },
    {
      label:   t('sedang_dikerjakan') || 'In Progress',
      value:   taskArray.filter((t) => t.status === 'IN_PROGRESS').length,
      desc:    t('tasks_in_progress_desc') || 'dikerjakan',
      icon:    Briefcase,
      color:   'text-violet-600',
      bgColor: 'bg-violet-100',
    },
    {
      label:   t('belum_dikerjakan') || 'To Do',
      value:   taskArray.filter((t) => t.status === 'TODO').length,
      desc:    t('tasks_pending_desc') || 'menunggu',
      icon:    Clock,
      color:   'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label:   t('selesai') || 'Selesai',
      value:   taskArray.filter((t) => t.status === 'DONE').length,
      desc:    t('tasks_completed_desc') || 'selesai',
      icon:    CheckCircle,
      color:   'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
        {t('ringkasan_tugas') || 'Ringkasan'}
      </span>

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm"
        >
          <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', stat.bgColor)}>
            <stat.icon size={10} className={stat.color} />
          </div>
          <span className="text-xs font-black text-gray-900">{stat.value}</span>
          <span className="text-[10px] font-medium text-gray-500 hidden sm:block">{stat.label}</span>
        </div>
      ))}

      {filteredCount !== null && filteredCount !== taskArray.length && (
        <span className="text-[10px] font-bold text-[#FD6825] bg-[#FFF1E9] border border-[#FD6825]/20 px-2.5 py-1 rounded-full">
          Menampilkan {filteredCount} hasil filter
        </span>
      )}
    </div>
  );
}
