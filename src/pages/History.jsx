import { useState, useEffect } from 'react';
import {
  Clock, Search, Navigation, Bookmark, Bot, Trash2,
  AlertCircle, Loader2, Calendar, ShieldAlert, ArrowRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import historyService from '../services/history.service';
import { usePreferences } from '../context/PreferencesContext';

const TABS = [
  { id: 'all',      label: 'Semua Activities' },
  { id: 'searched', label: 'Pencarian',      Icon: Search },
  { id: 'visited',  label: 'Rute Peta',      Icon: Navigation },
  { id: 'saved',    label: 'Disimpan',       Icon: Bookmark },
  { id: 'chatbot',  label: 'Chatbot AI',     Icon: Bot },
];

function getActionStyle(action) {
  switch (action) {
    case 'SEARCHED_PLACE':
      return { label: 'Pencarian', color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Search };
    case 'OPENED_MAP_ROUTE':
      return { label: 'Buka Peta', color: 'text-[#FD6825] bg-orange-50 border-orange-100', Icon: Navigation };
    case 'SAVED_FAVORITE':
      return { label: 'Disimpan', color: 'text-yellow-600 bg-yellow-50 border-yellow-100', Icon: Bookmark };
    case 'ASKED_CHATBOT':
      return { label: 'Tanya AI', color: 'text-purple-600 bg-purple-50 border-purple-100', Icon: Bot };
    default:
      return { label: 'Aktivitas', color: 'text-gray-500 bg-gray-50 border-gray-100', Icon: Clock };
  }
}

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { t, formatTime: ctxFormatTime, formatDateTime: ctxFormatDateTime } = usePreferences();

  const fetchHistories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await historyService.getHistories();
      setHistories(data);
    } catch (err) {
      setError('Gagal memuat riwayat aktivitas. Coba segarkan halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  const handleDeleteHistory = async (id) => {
    try {
      await historyService.deleteHistory(id);
      setHistories(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      setError('Gagal menghapus entri riwayat.');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat aktivitas Anda?')) return;
    try {
      await historyService.clearHistories();
      setHistories([]);
    } catch (err) {
      setError('Gagal membersihkan riwayat aktivitas.');
    }
  };

  // Filter items
  const filteredHistories = histories.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'searched') return item.action === 'SEARCHED_PLACE';
    if (activeTab === 'visited') return item.action === 'OPENED_MAP_ROUTE';
    if (activeTab === 'saved') return item.action === 'SAVED_FAVORITE';
    if (activeTab === 'chatbot') return item.action === 'ASKED_CHATBOT';
    return true;
  });

  // Group by date
  const groupHistoryByDate = (items) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const groups = {
      today: [],
      yesterday: [],
      older: []
    };

    items.forEach(item => {
      const d = new Date(item.createdAt);
      const dStr = d.toDateString();
      if (dStr === todayStr) {
        groups.today.push(item);
      } else if (dStr === yesterdayStr) {
        groups.yesterday.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return groups;
  };

  const grouped = groupHistoryByDate(filteredHistories);

  const formatTime = (isoString) => {
    return ctxFormatTime(isoString);
  };

  const formatDateLabel = (isoString) => {
    return ctxFormatDateTime(isoString, { hour: undefined, minute: undefined });
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-10 animate-in fade-in duration-500 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('history_title')}</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {t('history_desc')}
          </p>
        </div>
        
        {histories.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold transition-all border border-red-100/50 shadow-soft"
          >
            <Trash2 size={13}/>
            <span>{t('clear_all_history')}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          <AlertCircle size={15}/> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-soft',
                isActive ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
              )}
            >
              {tab.Icon && <tab.Icon size={13}/>}
              <span>{tab.id === 'all' ? t('all_activities') : tab.id === 'searched' ? t('searched') : tab.id === 'visited' ? t('visited') : tab.id === 'saved' ? t('saved') : tab.id === 'chatbot' ? t('chatbot') : tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-[#FD6825]"/>
          <span className="text-sm font-bold">{t('loading')}</span>
        </div>
      ) : histories.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[24px] border border-gray-100 shadow-soft max-w-md mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
            <Clock className="w-8 h-8 text-gray-300" />
          </div>
          <div className="text-center space-y-1 px-6">
            <h2 className="font-bold text-gray-900 text-base">{t('no_history')}</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {t('no_history_desc')}
            </p>
          </div>
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 text-gray-400 font-bold text-sm">
          {t('no_history_category') || 'Tidak ada riwayat untuk kategori filter ini.'}
        </div>
      ) : (
        <div className="space-y-7">
          {['today', 'yesterday', 'older'].map(groupKey => {
            const list = grouped[groupKey];
            if (list.length === 0) return null;

            const groupTitle =
              groupKey === 'today' ? t('today') :
              groupKey === 'yesterday' ? t('yesterday') :
              formatDateLabel(list[0].createdAt);

            return (
              <div key={groupKey} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                  <Calendar size={13}/>
                  <span>{groupTitle}</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-[24px] p-2 space-y-1 shadow-soft">
                  <AnimatePresence>
                    {list.map((item, idx) => {
                      const style = getActionStyle(item.action);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-[18px] hover:bg-gray-50/50 transition-all duration-150',
                            idx < list.length - 1 && 'border-b border-gray-50'
                          )}
                        >
                          {/* Left Badge */}
                          <div className={cn(
                            'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm font-bold text-xs',
                            style.color
                          )}>
                            <style.Icon size={16}/>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{style.label === 'Pencarian' ? t('searched') : style.label === 'Buka Peta' ? t('visited') : style.label === 'Disimpan' ? t('saved') : style.label === 'Tanya AI' ? t('chatbot') : style.label}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] font-extrabold text-gray-400">{formatTime(item.createdAt)}</span>
                            </div>

                            {/* Main Title/Activity Summary */}
                            <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                              {item.action === 'SEARCHED_PLACE' && (
                                <>Mencari rekomendasi tempat <strong>{item.metadata?.category || 'Umum'}</strong> di sekitar <strong>{item.metadata?.campus || 'Kampus'}</strong></>
                              )}
                              {item.action === 'OPENED_MAP_ROUTE' && (
                                <>Membuka rute jalan ke <strong>{item.metadata?.name}</strong> di Google Maps</>
                              )}
                              {item.action === 'SAVED_FAVORITE' && (
                                <>Menyimpan tempat <strong>{item.metadata?.name}</strong> ({item.metadata?.category}) ke Favorit</>
                              )}
                              {item.action === 'ASKED_CHATBOT' && (
                                <>Tanya AI: <em className="text-gray-500 font-medium">"{item.metadata?.message}"</em></>
                              )}
                              {item.action === 'REMOVED_FAVORITE' && (
                                <>Menghapus tempat <strong>{item.metadata?.name}</strong> dari daftar Favorit</>
                              )}
                            </h3>

                            {/* Actionable link fallback */}
                            {item.metadata?.mapLink && (
                              <a
                                href={item.metadata.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#3B82F6] hover:underline font-bold mt-1.5"
                              >
                                <span>{t('view_on_map')}</span>
                                <ExternalLink size={10}/>
                              </a>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0 align-self-start"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
