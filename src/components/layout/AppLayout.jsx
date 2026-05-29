import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { usePreferences } from '../../context/PreferencesContext';

export default function AppLayout() {
  const { user } = useAuthStore();
  const { t } = usePreferences();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
          <div className="relative w-[440px]">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder={t('search_placeholder')} 
              className="w-full bg-white pl-13 pr-10 py-3 rounded-full border border-gray-200 shadow-soft focus:outline-none focus:ring-4 focus:ring-[#FD6825]/5 focus:border-[#FD6825] transition-all text-sm font-medium"
            />
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">/</kbd>
            </div>
          </div>

          <div className="flex items-center gap-7">
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-xl">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FD6825] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">3</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-xl">
                <MessageSquare size={20} />
              </button>
            </div>
            
            <div className="h-8 w-[1.5px] bg-gray-200 mx-1"></div>
            
            <div className="flex items-center gap-3.5 cursor-pointer group hover:bg-gray-50 p-1.5 pr-3 rounded-2xl transition-all">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 bg-[#FD6825] text-white flex items-center justify-center font-black text-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">{user?.name || 'User'}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('mahasiswa')}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <button className="fixed bottom-8 right-8 ai-gradient text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-medium hover:scale-110 active:scale-95 hover:-translate-y-1 transition-all z-50 group">
        <div className="relative">
           <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
           <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></span>
        </div>
        <span className="font-bold text-sm tracking-tight">{t('tanya_ai')}</span>
      </button>
    </div>
  );
}
