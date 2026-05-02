import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  LayoutList 
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function TaskSummary({ tasks = [] }) {
  const taskArray = Array.isArray(tasks) ? tasks : [];
  
  const stats = [
    {
      label: 'Total Tugas',
      value: taskArray.length,
      desc: 'Semua tugas Anda',
      icon: LayoutList,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'Sedang Dikerjakan',
      value: taskArray.filter(t => t.status === 'IN_PROGRESS').length,
      desc: 'Tugas dalam proses',
      icon: Briefcase,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      label: 'Belum Dikerjakan',
      value: taskArray.filter(t => t.status === 'TODO').length,
      desc: 'Tugas menunggu',
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    {
      label: 'Selesai',
      value: taskArray.filter(t => t.status === 'DONE').length,
      desc: 'Tugas terselesaikan',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-6 pt-10">
      <h2 className="text-xl font-bold text-gray-900">Ringkasan Tugas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className={cn(
              "flex items-center p-6 rounded-[24px] shadow-soft border border-white transition-all hover:shadow-medium hover:-translate-y-1",
              stat.color.split(' ')[0] // Using the bg-color for the card
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mr-5",
              stat.iconBg
            )}>
              <stat.icon size={24} className={stat.color.split(' ')[1]} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 leading-none mb-1">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-gray-900/80 mb-0.5">
                {stat.label}
              </span>
              <span className="text-[10px] font-medium text-gray-500">
                {stat.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
