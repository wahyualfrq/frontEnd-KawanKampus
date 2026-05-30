import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, 
  LayoutDashboard, 
  MessageSquare, 
  Heart, 
  History, 
  Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../context/PreferencesContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = usePreferences();

  const navigation = [
    { name: t('peta'), href: '/places', icon: MapIcon, desc: t('peta_desc') },
    { name: t('kanban'), href: '/dashboard', icon: LayoutDashboard, desc: t('kanban_desc') },
    { name: t('chatbot'), href: '/chatbot', icon: MessageSquare, desc: t('chatbot_desc') },
    { name: t('favorit'), href: '/favorites', icon: Heart, desc: t('favorit_desc') },
    { name: t('riwayat'), href: '/history', icon: History, desc: t('riwayat_desc') },
    { name: t('pengaturan'), href: '/settings', icon: Settings, desc: t('pengaturan_desc') },
  ];

  return (
    <div className="flex h-full w-[260px] flex-col sidebar-bg text-white">
      <div className="flex h-20 shrink-0 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FD6825] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#FD6825]/20">K</div>
          <span className="text-xl font-bold tracking-tight">KawanKampus</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-[#FDC439] text-[#111827] shadow-lg shadow-[#FDC439]/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 hover:translate-x-1 font-medium',
                  'group flex items-start rounded-xl px-4 py-3.5 text-sm transition-all'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-[#111827]' : 'text-gray-400 group-hover:text-white',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors mt-0.5'
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  {!isActive && <span className="text-[10px] text-gray-500 font-normal">{item.desc}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageSquare size={80} className="text-[#FD6825]" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl">🤖</span>
            </div>
            <h4 className="font-bold text-xs mb-1">{t('ask_ai_anything')}</h4>
            <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
              {t('ask_ai_desc')}
            </p>
            <button 
              onClick={() => navigate('/chatbot')}
              className="w-full py-2 bg-[#FD6825] hover:bg-[#E85A1D] text-white text-[10px] font-bold rounded-xl transition-all shadow-lg shadow-[#FD6825]/20"
            >
              {t('start_chat')}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
