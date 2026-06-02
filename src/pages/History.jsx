import { useState, useEffect } from 'react';
import {
  Clock, Search, Navigation, Bookmark, Bot, Trash2,
  AlertCircle, Loader2, Calendar, ShieldAlert, ArrowRight, ExternalLink,
  Plus, Pencil, CheckCircle2, ChevronRight, LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import historyService from '../services/history.service';
import { usePreferences } from '../context/PreferencesContext';

const TABS = [
  { id: 'all',      labelKey: 'history_all_activities', defaultLabel: 'Semua Aktivitas', Icon: Clock },
  { id: 'searched', labelKey: 'history_searched',       defaultLabel: 'Pencarian',      Icon: Search },
  { id: 'visited',  labelKey: 'history_visited',        defaultLabel: 'Dikunjungi',     Icon: Navigation },
  { id: 'saved',    labelKey: 'history_saved',          defaultLabel: 'Disimpan',       Icon: Bookmark },
  { id: 'chatbot',  labelKey: 'history_chatbot',        defaultLabel: 'Chatbot AI',     Icon: Bot },
  { id: 'kanban',   labelKey: 'history_kanban',         defaultLabel: 'Kanban / Tugas', Icon: LayoutList },
];

const formatStatus = (status) => {
  if (!status) return '-';
  const s = String(status).toUpperCase();
  if (s === 'TODO') return 'To Do';
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'DONE') return 'Done';
  return status;
};

function getActionStyle(action, t) {
  const defaultStyle = { label: t('history_detail_unavailable') || 'Aktivitas', color: 'text-gray-500 bg-gray-50 border-gray-100', Icon: Clock };
  if (!action) return defaultStyle;

  switch (action) {
    case 'SEARCHED_PLACE':
      return { label: t('history_searched') || 'Pencarian', color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Search };
    case 'OPENED_MAP_ROUTE':
      return { label: t('history_visited') || 'Dikunjungi', color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Navigation };
    case 'SAVED_FAVORITE':
      return { label: t('history_saved') || 'Disimpan', color: 'text-amber-600 bg-[#FFF8EC] border-[#FDC439]/20', Icon: Bookmark };
    case 'REMOVED_FAVORITE':
      return { label: t('history_saved') || 'Disimpan', color: 'text-red-600 bg-red-50 border-red-100', Icon: Trash2 };
    case 'ASKED_CHATBOT':
    case 'CHATBOT_MESSAGE':
      return { label: t('history_chatbot') || 'Chatbot AI', color: 'text-purple-600 bg-purple-50 border-purple-100', Icon: Bot };
    case 'CREATED_TASK':
    case 'TASK_CREATED':
      return { label: t('history_kanban') || 'Kanban', color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Plus };
    case 'UPDATED_TASK':
    case 'TASK_UPDATED':
      return { label: t('history_kanban') || 'Kanban', color: 'text-amber-600 bg-amber-50 border-amber-100', Icon: Pencil };
    case 'MOVED_TASK':
    case 'TASK_MOVED':
      return { label: t('history_kanban') || 'Kanban', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', Icon: ChevronRight };
    case 'COMPLETED_TASK':
    case 'TASK_COMPLETED':
      return { label: t('history_kanban') || 'Kanban', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', Icon: CheckCircle2 };
    case 'DELETED_TASK':
    case 'TASK_DELETED':
      return { label: t('history_kanban') || 'Kanban', color: 'text-red-600 bg-red-50 border-red-100', Icon: Trash2 };
    default:
      return defaultStyle;
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
    if (!window.confirm(t('confirm_clear_history') || 'Apakah Anda yakin ingin menghapus seluruh riwayat aktivitas Anda?')) return;
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
    if (activeTab === 'chatbot') return item.action === 'ASKED_CHATBOT' || item.action === 'CHATBOT_MESSAGE';
    if (activeTab === 'kanban') {
      const kanbanActions = [
        'CREATED_TASK', 'TASK_CREATED',
        'UPDATED_TASK', 'TASK_UPDATED',
        'MOVED_TASK', 'TASK_MOVED',
        'COMPLETED_TASK', 'TASK_COMPLETED',
        'DELETED_TASK', 'TASK_DELETED'
      ];
      return kanbanActions.includes(item.action);
    }
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
            <span>{t('clear_history') || t('clear_all_history') || 'Hapus Riwayat'}</span>
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
              <span>{t(tab.labelKey) || tab.defaultLabel}</span>
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
              {t('no_history_desc') || 'Aktivitas pencarian, favorit, chatbot, dan tugas akan muncul di sini.'}
            </p>
          </div>
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border border-gray-100 text-gray-400 max-w-md mx-auto space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
            {activeTab === 'kanban' ? <LayoutList className="w-6 h-6 text-gray-300" /> : <Clock className="w-6 h-6 text-gray-300" />}
          </div>
          <p className="text-sm font-bold text-gray-900 text-center px-6">
            {activeTab === 'kanban'
              ? (t('no_task_history') || 'Tugas belum memiliki riwayat aktivitas.')
              : (t('no_history_category') || 'Tidak ada riwayat untuk kategori filter ini.')}
          </p>
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
                      const style = getActionStyle(item.action, t);
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
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                {style.label}
                              </span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] font-extrabold text-gray-400">{formatTime(item.createdAt)}</span>
                            </div>

                            {/* Main Title/Activity Summary */}
                            {item.action === 'SEARCHED_PLACE' && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_searched_place_title', { category: item.metadata?.category || 'Umum' })}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {t('history_searched_place_desc', { campus: item.metadata?.campus || 'Kampus' })}
                                </p>
                              </>
                            )}
                            {item.action === 'OPENED_MAP_ROUTE' && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_opened_route_title', { placeName: item.metadata?.placeName || item.metadata?.name || 'Tempat' })}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {(() => {
                                    const cat = item.metadata?.category || 'Tempat';
                                    const dist = item.metadata?.distanceText;
                                    return dist && dist !== '-' ? `${cat} · ${dist}` : cat;
                                  })()}
                                </p>
                              </>
                            )}
                            {item.action === 'SAVED_FAVORITE' && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_saved_favorite_title')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {t('history_saved_favorite_desc', {
                                    placeName: item.metadata?.placeName || item.metadata?.name || 'Tempat',
                                    category: item.metadata?.category || 'Favorit'
                                  })}
                                </p>
                              </>
                            )}
                            {item.action === 'REMOVED_FAVORITE' && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_removed_favorite_title')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {t('history_removed_favorite_desc', {
                                    placeName: item.metadata?.placeName || item.metadata?.name || 'Tempat',
                                    category: item.metadata?.category || 'Favorit'
                                  })}
                                </p>
                              </>
                            )}
                            {(item.action === 'ASKED_CHATBOT' || item.action === 'CHATBOT_MESSAGE') && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_asked_chatbot_title')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {t('history_asked_chatbot_desc', {
                                    messagePreview: item.metadata?.messagePreview || item.metadata?.message || ''
                                  })}
                                </p>
                              </>
                            )}

                            {/* Kanban Tasks Titles & Descriptions */}
                            {['CREATED_TASK', 'TASK_CREATED'].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('history_created_task_title') || 'Tugas baru dibuat'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  {t('history_created_task_desc', { title: item.metadata?.title || '-' })}
                                </p>
                              </>
                            )}
                            {['UPDATED_TASK', 'TASK_UPDATED'].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('task_updated_history') || 'Tugas diperbarui'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  Kamu memperbarui tugas: <strong>{item.metadata?.title || '-'}</strong> ({item.metadata?.category || 'Akademik'})
                                </p>
                              </>
                            )}
                            {['MOVED_TASK', 'TASK_MOVED'].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('task_moved_history') || 'Status tugas diubah'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  <strong>{item.metadata?.title || '-'}</strong> dipindahkan dari <strong>{formatStatus(item.metadata?.fromStatus)}</strong> ke <strong>{formatStatus(item.metadata?.toStatus)}</strong>
                                </p>
                              </>
                            )}
                            {['COMPLETED_TASK', 'TASK_COMPLETED'].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('task_completed_history') || 'Tugas diselesaikan'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  Kamu menyelesaikan tugas: <strong>{item.metadata?.title || '-'}</strong>
                                </p>
                              </>
                            )}
                            {['DELETED_TASK', 'TASK_DELETED'].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {t('task_deleted_history') || 'Tugas dihapus'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                  Kamu menghapus tugas: <strong>{item.metadata?.title || '-'}</strong>
                                </p>
                              </>
                            )}

                            {/* Fallback for unrecognized action type */}
                            {!['SEARCHED_PLACE', 'OPENED_MAP_ROUTE', 'SAVED_FAVORITE', 'ASKED_CHATBOT', 'CHATBOT_MESSAGE', 'REMOVED_FAVORITE',
                              'CREATED_TASK', 'TASK_CREATED', 'UPDATED_TASK', 'TASK_UPDATED', 'MOVED_TASK', 'TASK_MOVED', 'COMPLETED_TASK', 'TASK_COMPLETED', 'DELETED_TASK', 'TASK_DELETED'
                            ].includes(item.action) && (
                              <>
                                <h3 className="font-bold text-gray-800 text-[14px] leading-snug mt-0.5">
                                  {style.label}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.metadata?.message || t('history_detail_unavailable') || 'Detail aktivitas tidak tersedia.'}
                                </p>
                              </>
                            )}

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
