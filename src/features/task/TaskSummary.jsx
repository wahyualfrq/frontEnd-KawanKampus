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
    <div className="w-full flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm', stat.bgColor)}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black text-gray-900 leading-none mb-1">{stat.value}</span>
              <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCount !== null && filteredCount !== taskArray.length && (
        <div className="flex items-center">
          <span className="text-xs font-bold text-[#FD6825] bg-[#FFF1E9] border border-[#FD6825]/20 px-3 py-1 rounded-full">
            Menampilkan {filteredCount} dari {taskArray.length} tugas hasil filter
          </span>
        </div>
      )}
    </div>
  );
}
