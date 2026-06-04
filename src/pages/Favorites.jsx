import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Star, Heart, Share2, Trash2, Navigation,
  ExternalLink, Loader2, Grid, Printer, Book, Utensils, Coffee, AlertCircle,
  ChevronDown, X, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import favoritesService from '../services/favorites.service';
import historyService from '../services/history.service';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const CHIP_DEFS = [
  { id: 'all',      label: 'Semua',    Icon: Grid,     chipBg: '#FDC439', chipText: '#111827', pinColor: '#FD6825' },
  { id: 'fotokopi', label: 'Fotokopi', Icon: Printer,  chipBg: '#7C3AED', chipText: '#fff',    pinColor: '#7C3AED' },
  { id: 'atk',      label: 'ATK',      Icon: Book,     chipBg: '#3B82F6', chipText: '#fff',    pinColor: '#3B82F6' },
  { id: 'makanan',  label: 'Makanan',  Icon: Utensils, chipBg: '#F97316', chipText: '#fff',    pinColor: '#F97316' },
  { id: 'minuman',  label: 'Minuman',  Icon: Coffee,   chipBg: '#22C55E', chipText: '#fff',    pinColor: '#22C55E' },
  { id: 'lainnya',  label: 'Lainnya',  Icon: Grid,     chipBg: '#64748B', chipText: '#fff',    pinColor: '#64748B' },
];

const LAINNYA_SUBCATEGORIES = [
  'Apotek',
  'Kedai',
  'Kedai Kopi',
  'Minimarket',
  'Perhentian Bus',
  'Pizza',
  'Restoran',
  'Restoran Padang',
  'Tempat Fitness',
  'Toko Es Krim',
  'Warteg'
];

const CAMPUS_CENTERS = {
  'Universitas Gadjah Mada':                         { lat: -7.7733153,   lon: 110.3892489  },
  'Universitas Airlangga - B':                        { lat: -7.2729075,   lon: 112.7560403  },
  'Universitas Bina Nusantara @Anggrek':              { lat: -6.1950023,   lon: 106.7764187  },
  'Universitas Institut Teknologi Bandung - Ganesha': { lat: -6.8950712,   lon: 107.6099105  },
  'Universitas Brawijaya':                            { lat: -7.9508146,   lon: 112.6132311  },
  'STMIK IKMI CIREBON':                               { lat: -6.7357684,   lon: 108.53979385 },
  'UNIVERSITAS MULTI DATA PALEMBANG':                 { lat: -2.9737715,   lon: 104.75612    },
  'Universitas Indonesia':                            { lat: -6.36894785,  lon: 106.83008385 },
  'Universitas Pendidikan Indonesia Bandung':         { lat: -6.8817098,   lon: 107.5954963  },
};

function getNearestCampus(lat, lon) {
  if (lat == null || lon == null) return 'Universitas Gadjah Mada';
  let nearestCampus = 'Universitas Gadjah Mada';
  let minDistance = Infinity;
  for (const [name, center] of Object.entries(CAMPUS_CENTERS)) {
    const d = Math.pow(center.lat - lat, 2) + Math.pow(center.lon - lon, 2);
    if (d < minDistance) {
      minDistance = d;
      nearestCampus = name;
    }
  }
  return nearestCampus;
}

function getFavoriteSubcategory(fav) {
  if (!fav) return '';
  return String(fav.rawCategory || fav.category || fav.broadCategory || '').trim();
}

function getChip(categoryOrFav) {
  let category = '';
  if (categoryOrFav && typeof categoryOrFav === 'object') {
    category = categoryOrFav.rawCategory || categoryOrFav.category || categoryOrFav.broadCategory || '';
  } else {
    category = String(categoryOrFav || '');
  }

  const lower = category.toLowerCase().trim();

  // 1. Fotokopi tab: Fotokopi, Fotocopy, Photocopy, Copy, Print
  const isFotokopi = ['fotokopi', 'fotocopy', 'photocopy', 'copy', 'print'].some(term => lower.includes(term));
  if (isFotokopi) return CHIP_DEFS[1];

  // 2. ATK tab: ATK, Alat Tulis, Stationery
  const isATK = ['atk', 'alat tulis', 'stationery'].some(term => lower.includes(term));
  if (isATK) return CHIP_DEFS[2];

  // 3. Makanan tab: Makanan, Restoran, Restaurant, Warteg, Pizza, Food, Makanan Siap Saji, Restoran Padang
  const isMakanan = ['makanan', 'restoran', 'restaurant', 'warteg', 'pizza', 'food', 'makanan siap saji', 'restoran padang'].some(term => lower.includes(term));
  if (isMakanan) return CHIP_DEFS[3];

  // 4. Minuman tab: Minuman, Cafe, Kafe, Kedai, Kedai Kopi, Kopi, Coffee, Toko Es Krim, Eskrim
  const isMinuman = ['minuman', 'cafe', 'kafe', 'kedai', 'kedai kopi', 'kopi', 'coffee', 'toko es krim', 'eskrim'].some(term => lower.includes(term));
  if (isMinuman) return CHIP_DEFS[4];

  // 5. Lainnya tab: anything else
  return CHIP_DEFS[5];
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFav, setSelectedFav] = useState(null);
  const [activeChip, setActiveChip] = useState('all');
  const [activeLainnya, setActiveLainnya] = useState(null);
  const [lainnyaOpen, setLainnyaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const lainnyaRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (lainnyaRef.current && !lainnyaRef.current.contains(e.target)) {
        setLainnyaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLainnyaOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRemoveFavorite = async (e, id, placeName) => {
    if (e) e.stopPropagation();
    const ok = await confirm({
      title: 'Hapus dari favorit?',
      description: 'Tempat ini akan dihapus dari daftar favorit Anda.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!ok) return false;
    try {
      await favoritesService.removeFavorite(id);

      setFavorites(prev => {
        const next = prev.filter(f => f.id !== id);
        if (selectedFav?.id === id) {
          setSelectedFav(next.length > 0 ? next[0] : null);
        }
        return next;
      });
      showToast('Favorit berhasil dihapus.', 'success');
      return true;
    } catch (err) {
      showToast('Gagal menghapus data. Coba lagi.', 'error');
      return false;
    }
  };

  // Filter logic
  const filteredFavorites = favorites.filter(fav => {
    // 1. Category filter
    let matchesCategory = true;
    if (activeChip !== 'all') {
      if (activeChip === 'lainnya') {
        if (activeLainnya) {
          const sub = getFavoriteSubcategory(fav).toLowerCase();
          matchesCategory = sub === activeLainnya.toLowerCase();
        } else {
          const groupId = getChip(fav).id;
          matchesCategory = groupId === 'lainnya';
        }
      } else {
        const groupId = getChip(fav).id;
        matchesCategory = groupId === activeChip;
      }
    }

    // 2. Search query filter
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = fav.name?.toLowerCase().includes(q);
      const catMatch = fav.category?.toLowerCase().includes(q) || fav.rawCategory?.toLowerCase().includes(q);
      const addrMatch = fav.address?.toLowerCase().includes(q);
      matchesSearch = nameMatch || catMatch || addrMatch;
    }

    return matchesCategory && matchesSearch;
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left: list skeleton */}
          <div className="lg:col-span-7 space-y-3">
            <div className="h-12 w-full bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[18px] border border-gray-100 bg-white animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-100 rounded" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gray-50 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: detail skeleton */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 h-fit animate-pulse">
            <div className="bg-white rounded-[24px] overflow-hidden shadow-medium border border-gray-100">
              <div className="h-44 bg-gray-100 w-full" />
              <div className="p-5 space-y-5">
                <div className="h-6 w-1/2 bg-gray-100 rounded" />
                <div className="h-14 w-full bg-gray-50 rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-14 bg-gray-50 rounded-2xl" />
                  <div className="h-14 bg-gray-50 rounded-2xl" />
                  <div className="h-14 bg-gray-50 rounded-2xl" />
                </div>
                <div className="h-12 w-full bg-gray-100 rounded-[16px]" />
              </div>
            </div>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-[24px] border border-gray-100 shadow-soft max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8EC] flex items-center justify-center border border-[#FDC439]/20 shadow-sm">
            <Heart className="w-10 h-10 text-[#FD6825] fill-[#FD6825]" />
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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1 flex-1 min-w-0">
              {CHIP_DEFS.slice(0, 5).map(chip => {
                const isActive = activeChip === chip.id && !activeLainnya;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setActiveChip(chip.id);
                      setActiveLainnya(null);
                      setLainnyaOpen(false);
                      const filtered = favorites.filter(f => chip.id === 'all' || getChip(f).id === chip.id);
                      setSelectedFav(filtered.length > 0 ? filtered[0] : null);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-soft',
                      isActive ? 'border-transparent text-white' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'
                    )}
                    style={isActive ? { background: chip.chipBg, color: chip.chipText } : {}}
                  >
                    <chip.Icon size={14}/>
                    {chip.id === 'all' ? t('all_categories') : chip.id === 'fotokopi' ? t('photocopy') : chip.id === 'atk' ? t('atk') : chip.id === 'makanan' ? t('food') : chip.id === 'minuman' ? t('drink') : chip.label}
                  </button>
                );
              })}
            </div>

            {/* Lainnya Dropdown */}
            <div className="relative shrink-0" ref={lainnyaRef}>
              <button
                onClick={() => setLainnyaOpen(o => !o)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-soft',
                  activeChip === 'lainnya'
                    ? 'border-transparent text-white'
                    : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'
                )}
                style={activeChip === 'lainnya' ? { background: '#64748B', color: '#fff' } : {}}
              >
                {activeLainnya ? (
                  <>
                    <Grid size={14}/>
                    <span className="max-w-[100px] truncate">{activeLainnya}</span>
                    <X size={13} className="hover:text-red-200 transition-colors" onClick={e => {
                      e.stopPropagation();
                      setActiveLainnya(null);
                      setActiveChip('lainnya');
                      const filtered = favorites.filter(f => getChip(f).id === 'lainnya');
                      setSelectedFav(filtered.length > 0 ? filtered[0] : null);
                    }}/>
                  </>
                ) : (
                  <>
                    <Grid size={14}/>
                    <span>{t('favorites_other_categories') || t('others') || 'Lainnya'}</span>
                    <ChevronDown size={13} className={cn('transition-transform duration-200', lainnyaOpen && 'rotate-180')}/>
                  </>
                )}
              </button>

              <AnimatePresence>
                {lainnyaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-medium border border-gray-100 overflow-hidden min-w-[200px]"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-1.5 max-h-72 overflow-y-auto">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                        {t('favorites_other_categories') || t('others') || 'Lainnya'}
                      </p>
                      {LAINNYA_SUBCATEGORIES.map(cat => {
                        const subCount = favorites.filter(f => getFavoriteSubcategory(f).toLowerCase() === cat.toLowerCase()).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setActiveLainnya(cat);
                              setActiveChip('lainnya');
                              setLainnyaOpen(false);
                              const filtered = favorites.filter(f => getFavoriteSubcategory(f).toLowerCase() === cat.toLowerCase());
                              setSelectedFav(filtered.length > 0 ? filtered[0] : null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all',
                              activeLainnya === cat
                                ? 'bg-[#FFF8EC] text-[#FD6825] font-bold'
                                : 'text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            <span>{cat}</span>
                            {subCount > 0 && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                activeLainnya === cat ? "bg-[#FD6825]/10 text-[#FD6825]" : "bg-gray-100 text-gray-500"
                              )}>
                                {subCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Left list */}
            <div className="lg:col-span-7 space-y-3">
              {/* Local Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('search_favorites_placeholder') || 'Cari favorit berdasarkan nama atau kategori...'}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FD6825]/15 focus:border-[#FD6825] shadow-soft transition-all placeholder:text-gray-300"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={14}/>
                  </button>
                )}
              </div>

              {filteredFavorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[20px] border border-gray-50 text-gray-400 font-bold text-sm">
                  {t('no_favorites_category') || 'Tidak ada favorit di kategori ini.'}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredFavorites.map((fav, idx) => {
                    const chip = getChip(fav);
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

            {/* Right details (Desktop only) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28 h-fit">
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
                    <div className="relative h-44 flex items-center justify-center" style={{ background: `${getChip(selectedFav).pinColor}14` }}>
                      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#000" strokeWidth="0.5"/>)}
                        {Array.from({ length: 6 }).map((_, i) => <line key={`v${i}`} x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="#000" strokeWidth="0.5"/>)}
                      </svg>
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: `${getChip(selectedFav).pinColor}22`, color: getChip(selectedFav).pinColor }}>
                        {(() => {
                          const chip = getChip(selectedFav);
                          return <chip.Icon size={38}/>;
                        })()}
                      </div>
                      <div className="absolute bottom-4 left-5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: getChip(selectedFav).pinColor }}>
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
                        <button
                          onClick={(e) => handleRemoveFavorite(e, selectedFav.id, selectedFav.name)}
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-[#FFF8EC] text-[#FD6825] group-hover:bg-red-50 group-hover:text-red-500">
                            <Heart size={17} fill="#FD6825" className="group-hover:fill-red-500 transition-colors"/>
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('favorit')}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: selectedFav.name, url: selectedFav.mapLink });
                            } else {
                              navigator.clipboard.writeText(selectedFav.mapLink);
                              showToast(t('link_copied') || 'Link berhasil disalin.', 'success');
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
                              placeId: selectedFav.placeId || '',
                              placeName: selectedFav.name,
                              category: selectedFav.category || '',
                              campus: getNearestCampus(selectedFav.lat, selectedFav.lon || selectedFav.lng),
                              mapLink: selectedFav.mapLink,
                              distanceText: selectedFav.distanceText || ''
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

            {/* Mobile/Tablet Bottom Sheet Overlay */}
            <AnimatePresence>
              {selectedFav && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm">
                  <div className="absolute inset-0" onClick={() => setSelectedFav(null)} />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col"
                  >
                    <div className="w-full flex justify-center py-3 shrink-0">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                    </div>
                    <button
                      onClick={() => setSelectedFav(null)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-150 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shadow-sm"
                    >
                      <X size={16} />
                    </button>
                    <div className="overflow-y-auto flex-1 pb-8">
                      <div className="relative h-44 flex items-center justify-center" style={{ background: `${getChip(selectedFav).pinColor}14` }}>
                        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                          {Array.from({ length: 6 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#000" strokeWidth="0.5"/>)}
                          {Array.from({ length: 6 }).map((_, i) => <line key={`v${i}`} x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="#000" strokeWidth="0.5"/>)}
                        </svg>
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{ background: `${getChip(selectedFav).pinColor}22`, color: getChip(selectedFav).pinColor }}>
                          {(() => {
                            const chip = getChip(selectedFav);
                            return <chip.Icon size={38}/>;
                          })()}
                        </div>
                        <div className="absolute bottom-4 left-5">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: getChip(selectedFav).pinColor }}>
                            {selectedFav.category}
                          </span>
                        </div>
                      </div>

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
                          <button
                            onClick={(e) => handleRemoveFavorite(e, selectedFav.id, selectedFav.name)}
                            className="flex flex-col items-center gap-1.5 group"
                          >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all bg-[#FFF8EC] text-[#FD6825] group-hover:bg-red-50 group-hover:text-red-500">
                              <Heart size={17} fill="#FD6825" className="group-hover:fill-red-500 transition-colors"/>
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('favorit')}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({ title: selectedFav.name, url: selectedFav.mapLink });
                              } else {
                                navigator.clipboard.writeText(selectedFav.mapLink);
                                showToast(t('link_copied') || 'Link berhasil disalin.', 'success');
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
                            onClick={async (e) => {
                              const deleted = await handleRemoveFavorite(e, selectedFav.id, selectedFav.name);
                              if (deleted) setSelectedFav(null);
                            }}
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
                                placeId: selectedFav.placeId || '',
                                placeName: selectedFav.name,
                                category: selectedFav.category || '',
                                campus: getNearestCampus(selectedFav.lat, selectedFav.lon || selectedFav.lng),
                                mapLink: selectedFav.mapLink,
                                distanceText: selectedFav.distanceText || ''
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
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
