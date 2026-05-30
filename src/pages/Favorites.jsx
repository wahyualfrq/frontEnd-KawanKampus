import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Star, Bookmark, Share2, Trash2, Navigation,
  ExternalLink, Loader2, Grid, Printer, Book, Utensils, Coffee, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import favoritesService from '../services/favorites.service';
import historyService from '../services/history.service';
import { usePreferences } from '../context/PreferencesContext';

const CHIP_DEFS = [
  { id: 'all',      label: 'Semua',    Icon: Grid,     chipBg: '#FDC439', chipText: '#111827', pinColor: '#FD6825' },
  { id: 'fotokopi', label: 'Fotokopi', Icon: Printer,  chipBg: '#7C3AED', chipText: '#fff',    pinColor: '#7C3AED' },
  { id: 'atk',      label: 'ATK',      Icon: Book,     chipBg: '#3B82F6', chipText: '#fff',    pinColor: '#3B82F6' },
  { id: 'makanan',  label: 'Makanan',  Icon: Utensils, chipBg: '#F97316', chipText: '#fff',    pinColor: '#F97316' },
  { id: 'minuman',  label: 'Minuman',  Icon: Coffee,   chipBg: '#22C55E', chipText: '#fff',    pinColor: '#22C55E' },
  { id: 'lainnya',  label: 'Lainnya',  Icon: Grid,     chipBg: '#64748B', chipText: '#fff',    pinColor: '#64748B' },
];

function getChip(category) {
  const lower = String(category || '').toLowerCase();
  if (lower.includes('fotokopi') || lower.includes('copy')) return CHIP_DEFS[1];
  if (lower.includes('atk') || lower.includes('print')) return CHIP_DEFS[2];
  if (lower.includes('makan') || lower.includes('restoran') || lower.includes('food') || lower.includes('warteg') || lower.includes('pizza')) return CHIP_DEFS[3];
  if (lower.includes('minum') || lower.includes('kopi') || lower.includes('cafe') || lower.includes('kafe')) return CHIP_DEFS[4];
  return CHIP_DEFS[5];
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFav, setSelectedFav] = useState(null);
  const [activeChip, setActiveChip] = useState('all');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await favoritesService.getFavorites();
      setFavorites(data);
      if (data.length > 0) {
        setSelectedFav(data[0]);
      } else {
        setSelectedFav(null);
      }
    } catch (err) {
      setError('Gagal memuat daftar favorit. Pastikan Anda sudah login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e, id, placeName) => {
    e.stopPropagation();
    try {
      await favoritesService.removeFavorite(id);
      
      // Save history activity
      await historyService.createHistory('REMOVED_FAVORITE', {
        name: placeName,
        placeId: id
      });

      setFavorites(prev => {
        const next = prev.filter(f => f.id !== id);
        if (selectedFav?.id === id) {
          setSelectedFav(next.length > 0 ? next[0] : null);
        }
        return next;
      });
    } catch (err) {
      setError('Gagal menghapus tempat favorit.');
    }
  };

  // Filter logic
  const filteredFavorites = favorites.filter(fav => {
    if (activeChip === 'all') return true;
    const chip = getChip(fav.category);
    return chip.id === activeChip;
  });

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10 animate-in fade-in duration-500 p-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('favorites_title')}</h1>
        <p className="text-sm text-gray-400 font-medium mt-1">
          {t('favorites_desc')}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          <AlertCircle size={15}/> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-[#FD6825]"/>
          <span className="text-sm font-bold">{t('loading')}</span>
        </div>
      ) : favorites.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-[24px] border border-gray-100 shadow-soft max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8EC] flex items-center justify-center border border-[#FDC439]/20 shadow-sm">
            <Bookmark className="w-10 h-10 text-[#FD6825]" />
          </div>
          <div className="text-center space-y-1 px-6">
            <h2 className="font-bold text-gray-900 text-lg">{t('no_favorites')}</h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              {t('no_favorites_desc')}
            </p>
          </div>
          <button
            onClick={() => navigate('/places')}
            className="bg-[#FD6825] hover:bg-[#E85A1D] px-6 py-3 rounded-full text-xs font-extrabold text-white flex items-center gap-2 shadow-lg shadow-[#FD6825]/25 transition-all hover:scale-105 active:scale-95"
          >
            <Navigation size={14}/>
            {t('search_places')}
          </button>
        </div>
      ) : (
        <>
          {/* Category Chips */}
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {CHIP_DEFS.map(chip => {
              const count = favorites.filter(f => activeChip === 'all' || getChip(f.category).id === chip.id).length;
              const isActive = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActiveChip(chip.id);
                    const filtered = favorites.filter(f => chip.id === 'all' || getChip(f.category).id === chip.id);
                    setSelectedFav(filtered.length > 0 ? filtered[0] : null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-soft',
                    isActive ? 'border-transparent text-white' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'
                  )}
                  style={isActive ? { background: chip.chipBg, color: chip.chipText } : {}}
                >
                  <chip.Icon size={14}/>
                  {chip.id === 'all' ? t('all_categories') : chip.id === 'fotokopi' ? t('photocopy') : chip.id === 'atk' ? t('atk') : chip.id === 'makanan' ? t('food') : chip.id === 'minuman' ? t('drink') : chip.id === 'lainnya' ? t('others') : chip.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Left list */}
            <div className="lg:col-span-7 space-y-3">
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[20px] border border-gray-50 text-gray-400 font-bold text-sm">
                  {t('no_favorites_category') || 'Tidak ada favorit di kategori ini.'}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredFavorites.map((fav, idx) => {
                    const chip = getChip(fav.category);
                    const isSelected = selectedFav?.id === fav.id;
                    return (
                      <motion.div
                        key={fav.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <div
                          onClick={() => setSelectedFav(fav)}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-[18px] cursor-pointer border transition-all duration-200',
                            isSelected ? 'bg-[#FFF8EC] border-[#FDC439] shadow-md' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-soft'
                          )}
                        >
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: `${chip.pinColor}18`, color: chip.pinColor }}>
                            <chip.Icon size={22}/>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate pr-1">{fav.name}</h3>
                            <p className="text-xs font-bold mb-1" style={{ color: chip.pinColor }}>{fav.category}</p>
                            {fav.address && (
                              <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">📍 {fav.address}</p>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleRemoveFavorite(e, fav.id, fav.name)}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-100 transition-all shrink-0"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Right details */}
            <div className="lg:col-span-5 sticky top-28 h-fit">
              <AnimatePresence mode="wait">
                {selectedFav ? (
                  <motion.div
                    key={selectedFav.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-[24px] overflow-hidden shadow-medium border border-gray-100"
                  >
                    {/* Hero */}
                    <div className="relative h-44 flex items-center justify-center" style={{ background: `${getChip(selectedFav.category).pinColor}14` }}>
                      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#000" strokeWidth="0.5"/>)}
                        {Array.from({ length: 6 }).map((_, i) => <line key={`v${i}`} x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="#000" strokeWidth="0.5"/>)}
                      </svg>
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: `${getChip(selectedFav.category).pinColor}22`, color: getChip(selectedFav.category).pinColor }}>
                        {(() => {
                          const chip = getChip(selectedFav.category);
                          return <chip.Icon size={38}/>;
                        })()}
                      </div>
                      <div className="absolute bottom-4 left-5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: getChip(selectedFav.category).pinColor }}>
                          {selectedFav.category}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedFav.name}</h3>
                      </div>

                      {selectedFav.address && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/50">
                          <span className="font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{t('address')}</span>
                          <span className="leading-relaxed">{selectedFav.address}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 border-t border-b border-gray-50 py-3.5">
                        <button className="flex flex-col items-center gap-1.5 group">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-[#FFF8EC] text-[#FD6825]">
                            <Bookmark size={17} fill="#FD6825"/>
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('save')}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: selectedFav.name, url: selectedFav.mapLink });
                            } else {
                              navigator.clipboard.writeText(selectedFav.mapLink);
                              alert('Link disalin!');
                            }
                          }}
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-gray-50 text-gray-400 group-hover:bg-gray-100">
                            <Share2 size={17}/>
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('share')}</span>
                        </button>
                        <button
                          onClick={(e) => handleRemoveFavorite(e, selectedFav.id, selectedFav.name)}
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          <div className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all flex items-center justify-center">
                            <Trash2 size={17}/>
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('delete')}</span>
                        </button>
                      </div>

                      {selectedFav.mapLink ? (
                        <a
                          href={selectedFav.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            // Record open route history
                            historyService.createHistory('OPENED_MAP_ROUTE', {
                              name: selectedFav.name,
                              mapLink: selectedFav.mapLink
                            });
                          }}
                          className="w-full bg-[#FD6825] hover:bg-[#E85A1D] py-3.5 rounded-[16px] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FD6825]/25 hover:scale-[1.01] active:scale-95 transition-all"
                        >
                          <ExternalLink size={14}/>
                          {t('open_in_google_maps')}
                        </a>
                      ) : (
                        <button disabled className="w-full bg-gray-100 py-3.5 rounded-[16px] text-gray-400 font-extrabold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                          <Navigation size={14}/> {t('not_available')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-[24px] border border-gray-100/50 text-gray-400 font-bold text-sm">
                    {t('select_place_details') || 'Pilih lokasi untuk melihat detail.'}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
