import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { usePreferences } from '../../context/PreferencesContext';
import historyService from '../../services/history.service';
import { cn } from '../../utils/cn';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { t, formatTime } = usePreferences();
  const navigate = useNavigate();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [histories, setHistories] = useState([]);

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const fetchHistories = async () => {
    try {
      const data = await historyService.getHistories();
      setHistories(data || []);
    } catch (e) {
      console.warn('[AppLayout] Failed to fetch notification activities:', e.message);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  // Fetch histories again when notification dropdown is opened
  useEffect(() => {
    if (isNotifDropdownOpen) {
      fetchHistories();
    }
  }, [isNotifDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
        setIsNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Badge count: recent activities logged in last 24 hours
  const recentActivities = histories.filter(item => {
    if (!item.createdAt) return false;
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours < 24;
  });

  const displayActivities = histories.slice(0, 5);

  const getActionText = (action) => {
    switch (action) {
      case 'SEARCHED_PLACE':
        return t('notif_searched_place');
      case 'SAVED_FAVORITE':
        return t('notif_saved_favorite');
      case 'OPENED_MAP_ROUTE':
        return t('notif_opened_map_route');
      case 'ASKED_CHATBOT':
        return t('notif_asked_chatbot');
      case 'CREATED_TASK':
        return t('notif_created_task');
      case 'UPDATED_TASK':
        return t('notif_updated_task');
      case 'COMPLETED_TASK':
        return t('notif_completed_task');
      default:
        return action;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30">
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
            {/* Bell Notifications */}
            <div className="flex items-center gap-4" ref={notifDropdownRef}>
              <div className="relative">
                <button 
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="relative p-2 text-gray-500 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-xl"
                >
                  <Bell size={20} />
                  {recentActivities.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FD6825] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-200">
                      {Math.min(recentActivities.length, 9)}
                    </span>
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-[24px] shadow-medium border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 pb-3 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{t('notifications')}</span>
                      {recentActivities.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FD6825]/10 text-[#FD6825] rounded-full">
                          {recentActivities.length}
                        </span>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto py-2">
                      {displayActivities.length > 0 ? (
                        displayActivities.map((item) => (
                          <div 
                            key={item.id}
                            className="px-5 py-3 hover:bg-gray-50 transition-all flex flex-col gap-1 border-b border-gray-50/50 last:border-0"
                          >
                            <span className="text-xs font-bold text-gray-700 leading-normal">
                              {getActionText(item.action)}
                            </span>
                            {item.createdAt && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                {formatTime(item.createdAt)}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-center px-5 space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200 text-gray-300">
                            <Bell size={18} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-700">{t('no_notifications')}</p>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                              {t('notifications_empty_desc')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-4 pt-2 border-t border-gray-50">
                      <button 
                        onClick={() => {
                          setIsNotifDropdownOpen(false);
                          navigate('/history');
                        }}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition-all text-center block"
                      >
                        {t('view_history')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-8 w-[1.5px] bg-gray-200 mx-1"></div>
            
            {/* Account / User Menu Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <div 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-3.5 cursor-pointer group hover:bg-gray-50 p-1.5 pr-3 rounded-2xl transition-all"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 bg-[#FD6825] text-white flex items-center justify-center font-black text-sm shrink-0">
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
                <ChevronDown size={14} className={cn("text-gray-400 group-hover:text-gray-600 transition-transform", isUserDropdownOpen && "rotate-180")} />
              </div>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-[24px] shadow-medium border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User summary */}
                  <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 bg-[#FD6825] text-white flex items-center justify-center font-black text-base shrink-0">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user?.name)
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User'}</span>
                      <span className="text-[10px] text-gray-400 truncate">{user?.email || ''}</span>
                      <span className="text-[9px] text-[#FD6825] font-extrabold uppercase mt-0.5 tracking-wider">{t('mahasiswa')}</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="px-2 pt-2 pb-1">
                    <button 
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2.5"
                    >
                      {t('profile_title')}
                    </button>
                    <button 
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2.5"
                    >
                      {t('pengaturan')}
                    </button>
                    <button 
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigate('/history');
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2.5"
                    >
                      {t('riwayat')}
                    </button>
                  </div>

                  <div className="px-2 pt-1 border-t border-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2.5"
                    >
                      {t('logout_button')}
                    </button>
                  </div>
                </div>
              )}
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
