import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, Star, Bookmark, Share2, ChevronDown,
  Printer, Book, Utensils, Coffee, Grid, Loader2, Bot,
  AlertCircle, ExternalLink, Search, Target, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import placesService, { FALLBACK_CONFIG } from '../services/places.service';
import favoritesService from '../services/favorites.service';
import historyService from '../services/history.service';
import { usePreferences } from '../context/PreferencesContext';

// ── Chip definitions (visual only — API values come from loaded config) ──────
const CHIP_DEFS = [
  { id: 'all',      label: 'Semua',    Icon: Grid,     chipBg: '#FDC439', chipText: '#111827', pinColor: '#FD6825' },
  { id: 'fotokopi', label: 'Fotokopi', Icon: Printer,  chipBg: '#7C3AED', chipText: '#fff',    pinColor: '#7C3AED' },
  { id: 'atk',      label: 'ATK',      Icon: Book,     chipBg: '#3B82F6', chipText: '#fff',    pinColor: '#3B82F6', note: 'Dipetakan ke: Print / Fotokopi' },
  { id: 'makanan',  label: 'Makanan',  Icon: Utensils, chipBg: '#F97316', chipText: '#fff',    pinColor: '#F97316' },
  { id: 'minuman',  label: 'Minuman',  Icon: Coffee,   chipBg: '#22C55E', chipText: '#fff',    pinColor: '#22C55E' },
];

function getChip(id) {
  const lower = id?.toLowerCase();
  return (
    CHIP_DEFS.find(c => c.id === lower) ||
    { id: lower, label: id || 'Lainnya', Icon: Grid, chipBg: '#64748B', chipText: '#fff', pinColor: '#64748B' }
  );
}

/**
 * Resolve chip id or raw category to the API value (valid Kategori_Awal).
 * For built-in chips: uses config.categoryApiValue.
 * For Lainnya raw categories: returns the raw value directly (it IS a Kategori_Awal).
 */
function resolveApiCat(chipId, cfg) {
  const apiValues = cfg?.categoryApiValue || {};
  if (apiValues[chipId]) return apiValues[chipId];
  const defaults = { fotokopi:'Fotokopi', makanan:'Makanan', minuman:'Cafe', atk:'Print', all:'Fotokopi' };
  if (defaults[chipId]) return defaults[chipId];
  return chipId; // Lainnya raw category → send as-is
}

// ── Decorative pin positions ──────────────────────────────────────────────────
const PIN_POS = [
  { top:'19%', left:'26%' }, { top:'15%', left:'52%' },
  { top:'18%', left:'70%' }, { top:'63%', left:'20%' },
  { top:'65%', left:'62%' }, { top:'40%', left:'78%' },
];

// ── Map placeholder ───────────────────────────────────────────────────────────
function MapPlaceholder({ places, hasLocation, onLocate, locating, onCampusDemo, selectedUni }) {
  const { t } = usePreferences();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-medium border-4 border-white" style={{ height:420 }}>
      <div className="absolute inset-0" style={{ background:'#eae8df' }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#eae8df"/>
          <rect x="0"   y="0"   width="23%" height="12%" fill="#e2dfd5"/>
          <rect x="25%" y="0"   width="18%" height="12%" fill="#e2dfd5"/>
          <rect x="65%" y="0"   width="35%" height="12%" fill="#e2dfd5"/>
          <rect x="0"   y="80%" width="35%" height="20%" fill="#e2dfd5"/>
          <rect x="37%" y="80%" width="28%" height="20%" fill="#e2dfd5"/>
          <rect x="67%" y="67%" width="33%" height="33%" fill="#e2dfd5"/>
          <rect x="35%" y="28%" width="26%" height="34%" rx="6" fill="#c9e3b0" stroke="#b2d494" strokeWidth="1.5"/>
          <line x1="0"   y1="13%"  x2="100%" y2="13%"  stroke="#fff" strokeWidth="10"/>
          <line x1="0"   y1="62%"  x2="100%" y2="62%"  stroke="#fff" strokeWidth="10"/>
          <line x1="24%" y1="0"    x2="24%"  y2="100%" stroke="#fff" strokeWidth="10"/>
          <line x1="62%" y1="0"    x2="62%"  y2="100%" stroke="#fff" strokeWidth="10"/>
          <line x1="0"   y1="43%"  x2="100%" y2="43%"  stroke="#d5d1c8" strokeWidth="4"/>
          <line x1="0"   y1="79%"  x2="100%" y2="79%"  stroke="#d5d1c8" strokeWidth="4"/>
          <line x1="43%" y1="0"    x2="43%"  y2="100%" stroke="#d5d1c8" strokeWidth="4"/>
          <line x1="80%" y1="0"    x2="80%"  y2="100%" stroke="#d5d1c8" strokeWidth="4"/>
          <line x1="10%" y1="0"    x2="10%"  y2="100%" stroke="#dbd8cf" strokeWidth="3"/>
        </svg>

        {/* Campus label */}
        <div className="absolute" style={{ top:'41%', left:'47%', transform:'translate(-50%,-50%)', zIndex:5 }}>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 shadow-sm whitespace-nowrap border border-white/60">
            {selectedUni || 'Pilih Kampus'}
          </div>
        </div>

        {/* Pins */}
        {places.length > 0
          ? places.slice(0,5).map((place, i) => {
              const chip = getChip(place.category);
              const pos  = PIN_POS[i] || { top:'30%', left:'30%' };
              return (
                <motion.div key={place.id||i} className="absolute" style={{ top:pos.top, left:pos.left, zIndex:10 }}
                  initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:'spring', stiffness:280, damping:22, delay:i*0.08 }}>
                  <div className="relative">
                    <div className="p-2.5 rounded-xl shadow-lg ring-2 ring-white" style={{ background:chip.pinColor }}>
                      <chip.Icon size={16} color="white"/>
                    </div>
                    <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0"
                       style={{ borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:`9px solid ${chip.pinColor}` }}/>
                  </div>
                </motion.div>
              );
            })
          : [
              { pos:PIN_POS[0], color:'#7C3AED', Icon:Printer },
              { pos:PIN_POS[1], color:'#7C3AED', Icon:Printer },
              { pos:PIN_POS[2], color:'#F97316', Icon:Utensils },
              { pos:PIN_POS[3], color:'#F97316', Icon:Utensils },
              { pos:PIN_POS[4], color:'#22C55E', Icon:Coffee },
              { pos:PIN_POS[5], color:'#3B82F6', Icon:Book },
            ].map(({ pos, color, Icon }, i) => (
              <div key={i} className="absolute" style={{ top:pos.top, left:pos.left, zIndex:10 }}>
                <div className="relative">
                  <div className="p-2.5 rounded-xl shadow-lg ring-2 ring-white" style={{ background:color }}>
                    <Icon size={16} color="white"/>
                  </div>
                  <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:`9px solid ${color}` }}/>
                </div>
              </div>
            ))
        }

        {/* User / campus location pulsing dot */}
        {hasLocation && (
          <div className="absolute" style={{ top:'44%', left:'48%', transform:'translate(-50%,-50%)', zIndex:20 }}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 bg-[#3B82F6]/20 rounded-full animate-ping"/>
              <div className="absolute w-8  h-8  bg-[#3B82F6]/10 rounded-full"/>
              <div className="relative w-5  h-5  bg-[#3B82F6] rounded-full border-[3px] border-white shadow-xl"/>
            </div>
          </div>
        )}
      </div>

      {/* Bottom-left actions */}
      <div className="absolute bottom-5 left-5 flex flex-col gap-2" style={{ zIndex:30 }}>
        <button onClick={onLocate} disabled={locating}
          className={cn('glass px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-medium border',
            hasLocation ? 'bg-white/90 border-[#3B82F6]/40 text-[#3B82F6]'
                        : 'bg-white/80 border-white/30 text-gray-700 hover:bg-white')}>
          {locating ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14} className={hasLocation ? 'fill-[#3B82F6] text-[#3B82F6]' : ''}/>}
          {locating ? t('loading') : hasLocation ? t('active_location') : t('my_location')}
        </button>
        <button onClick={onCampusDemo}
          className="glass px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-white/80 border border-white/30 text-gray-600 hover:bg-white hover:text-[#FD6825] transition-all shadow-soft">
          <Target size={13}/>
          {t('use_campus_point')}
        </button>
      </div>

      {/* Tanya AI */}
      <div className="absolute bottom-5 right-5" style={{ zIndex:30 }}>
        <button className="bg-[#FD6825] hover:bg-[#E85A1D] px-5 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#FD6825]/35 transition-all hover:scale-105 active:scale-95">
          <Bot size={14}/>
          {t('tanya_ai')}
        </button>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5" style={{ zIndex:30 }}>
        <button className="glass w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white transition-all shadow-soft border border-white/40"><Navigation size={14}/></button>
        <button className="glass w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 font-bold text-xl hover:bg-white transition-all shadow-soft border border-white/40">+</button>
        <button className="glass w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 font-bold text-xl hover:bg-white transition-all shadow-soft border border-white/40">−</button>
      </div>
    </div>
  );
}

// ── Place card ────────────────────────────────────────────────────────────────
function PlaceCard({ place, isSelected, isFavorited, onToggleFavorite, onClick }) {
  const chip = getChip(place.category);
  const { formatDistance } = usePreferences();
  return (
    <div onClick={onClick}
      className={cn('flex items-center gap-4 p-4 rounded-[18px] cursor-pointer border transition-all duration-200',
        isSelected ? 'bg-[#FFF8EC] border-[#FDC439] shadow-md'
                   : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-soft hover:-translate-y-0.5')}>
      
      {place.rank != null && (
        <div className="w-7 h-7 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center font-black text-xs shrink-0 border border-gray-200/40">
          {place.rank}
        </div>
      )}

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background:`${chip.pinColor}18`, color:chip.pinColor }}>
        <chip.Icon size={26}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate pr-1">{place.name}</h3>
          <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }} className="shrink-0 mt-0.5 p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <Bookmark size={17} className={isFavorited ? 'text-[#FD6825]' : 'text-gray-300 hover:text-[#FD6825] transition-colors'}
              fill={isFavorited ? '#FD6825' : 'none'}/>
          </button>
        </div>
        <p className="text-xs font-bold mb-1.5" style={{ color:chip.pinColor }}>{place.category || chip.label}</p>
        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500">
          {place.rating != null && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400"/>
              {place.rating.toFixed(1)}
              {place.reviews != null && <span className="font-normal text-gray-400">({place.reviews})</span>}
            </span>
          )}
          {place.rating != null && place.distanceText && place.distanceText !== '-' && (
            <span className="text-gray-300">•</span>
          )}
          {place.distanceText && place.distanceText !== '-' && (
            <span>{formatDistance(place.distanceText)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function PlaceDetail({ place, isFavorited, onToggleFavorite }) {
  const chip = getChip(place.category);
  const { t, formatDistance } = usePreferences();
  return (
    <motion.div key={place.id}
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      transition={{ duration:0.2 }}
      className="bg-white rounded-[24px] overflow-hidden shadow-medium border border-gray-100">
      {/* Hero */}
      <div className="relative h-52 flex items-center justify-center" style={{ background:`${chip.pinColor}14` }}>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          {Array.from({length:8}).map((_,i) => <line key={`h${i}`} x1="0" y1={`${i*14}%`} x2="100%" y2={`${i*14}%`} stroke="#000" strokeWidth="0.5"/>)}
          {Array.from({length:8}).map((_,i) => <line key={`v${i}`} x1={`${i*14}%`} y1="0" x2={`${i*14}%`} y2="100%" stroke="#000" strokeWidth="0.5"/>)}
        </svg>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ background:`${chip.pinColor}22`, color:chip.pinColor }}>
          <chip.Icon size={44}/>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/25 to-transparent"/>
        <div className="absolute bottom-4 left-5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background:chip.pinColor }}>
            {place.category || chip.label}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{place.name}</h3>
          {place.rating != null && (
            <div className="flex items-center gap-1 bg-[#FFF6D6] px-2.5 py-1.5 rounded-xl border border-[#FDC439]/30 shrink-0">
              <Star size={13} className="text-[#FDC439] fill-[#FDC439]"/>
              <span className="font-bold text-gray-900 text-sm">{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium flex-wrap">
          {place.rating != null && (
            <span className="flex items-center gap-1 text-yellow-500 font-bold">
              <Star size={12} className="fill-yellow-400 text-yellow-400"/>
              {place.rating.toFixed(1)}
              {place.reviews != null && <span className="text-gray-400 font-normal ml-0.5">({place.reviews} {t('reviews') || 'ulasan'})</span>}
            </span>
          )}
          {place.rating != null && place.distanceText && place.distanceText !== '-' && (
            <span className="text-gray-300">•</span>
          )}
          {place.distanceText && place.distanceText !== '-' && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[#FD6825]"/>
              {formatDistance(place.distanceText)} {t('from_your_location')}
            </span>
          )}
        </div>

        {place.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
        )}

        {place.address && (
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/50">
            <span className="font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{t('address')}</span>
            <span className="leading-relaxed">{place.address}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 border-t border-b border-gray-50 py-3.5">
          <button
            onClick={() => {
              if (place.mapLink) {
                historyService.createHistory('OPENED_MAP_ROUTE', {
                  name: place.name,
                  mapLink: place.mapLink
                });
                window.open(place.mapLink, '_blank');
              }
            }}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825] transition-all"><Navigation size={18}/></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('route')}</span>
          </button>
          
          <button onClick={onToggleFavorite} className="flex flex-col items-center gap-1.5 group">
            <div className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
              isFavorited ? 'bg-[#FFF8EC] text-[#FD6825]' : 'bg-gray-50 text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825]'
            )}>
              <Bookmark size={18} fill={isFavorited ? '#FD6825' : 'none'}/>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('save')}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: place.name, url: place.mapLink });
              } else {
                navigator.clipboard.writeText(place.mapLink);
                alert('Link disalin ke clipboard!');
              }
            }}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825] transition-all"><Share2 size={18}/></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('share')}</span>
          </button>
        </div>
        
        {place.mapLink ? (
          <a href={place.mapLink} target="_blank" rel="noopener noreferrer"
            onClick={() => {
              historyService.createHistory('OPENED_MAP_ROUTE', {
                name: place.name,
                mapLink: place.mapLink
              });
            }}
            className="w-full bg-[#FD6825] hover:bg-[#E85A1D] py-4 rounded-[16px] text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#FD6825]/25 hover:scale-[1.02] active:scale-95 transition-all">
            <ExternalLink size={18}/>
            {t('open_in_google_maps')}
          </a>
        ) : (
          <button disabled className="w-full bg-gray-100 py-4 rounded-[16px] text-gray-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed">
            <Navigation size={18}/> {t('not_available')}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PlacesPage() {
  const { t } = usePreferences();
  // Config
  const [appConfig, setAppConfig]         = useState(FALLBACK_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);

  // UI
  const [activeChip, setActiveChip]       = useState('fotokopi');
  const [lainnyaOpen, setLainnyaOpen]     = useState(false);
  const [activeLainnya, setActiveLainnya] = useState(null); // raw category chosen from Lainnya
  const lainnyaRef                        = useRef(null);

  // Campus + location
  const [selectedUni, setSelectedUni]     = useState('');
  const [userLocation, setUserLocation]   = useState(null);
  const [usingCampus, setUsingCampus]     = useState(false);
  const [locating, setLocating]           = useState(false);

  // Results
  const [places, setPlaces]               = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [hasSearched, setHasSearched]     = useState(false);
  const [favorites, setFavorites]         = useState([]);

  // Client-side text filter
  const [filterQuery, setFilterQuery]     = useState('');

  // ── Load config ──
  useEffect(() => {
    placesService.getPlacesConfig().then(cfg => {
      setAppConfig(cfg);
      if (cfg.campuses?.length) setSelectedUni(cfg.campuses[0].name);
    }).finally(() => setConfigLoading(false));

    // Load favorites
    favoritesService.getFavorites().then(favs => {
      setFavorites(favs);
    }).catch(e => console.warn('Failed to load favorites:', e.message));
  }, []);

  // Close Lainnya dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (lainnyaRef.current && !lainnyaRef.current.contains(e.target)) setLainnyaOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const campusList     = appConfig.campuses       || FALLBACK_CONFIG.campuses;
  const lainnyaCats    = appConfig.lainnyaCategories || FALLBACK_CONFIG.lainnyaCategories;

  // Resolve the active API category value
  const getApiCat = (chipId, rawCat) => {
    if (rawCat) return rawCat; // Lainnya raw category → send directly
    return resolveApiCat(chipId, appConfig);
  };

  // Client-side filter on displayed places
  const filteredPlaces = filterQuery.trim()
    ? places.filter(p => {
        const q = filterQuery.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      })
    : places;

  // ── Geolocation ──
  const handleLocate = () => {
    if (!navigator.geolocation) { setError('Browser tidak mendukung geolokasi.'); return; }
    setLocating(true); setError(''); setUsingCampus(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc); setLocating(false);
        await runSearch(loc, getApiCat(activeChip, activeLainnya));
      },
      () => { setLocating(false); setError('Akses lokasi ditolak. Gunakan "Gunakan titik kampus" untuk demo.'); },
      { timeout: 10000 }
    );
  };

  // ── Demo: campus centre ──
  const handleCampusDemo = async () => {
    const centers = appConfig.campusCenters || FALLBACK_CONFIG.campusCenters;
    const c = centers?.[selectedUni];
    if (!c) { setError('Koordinat kampus tidak tersedia.'); return; }
    setError(''); setUsingCampus(true);
    const loc = { lat: c.lat, lon: c.lon };
    setUserLocation(loc);
    await runSearch(loc, getApiCat(activeChip, activeLainnya));
  };

  const isPlaceFavorited = (place) => {
    if (!place) return false;
    return favorites.some(f => 
      (f.googleId && place.mapLink && f.googleId === place.mapLink) ||
      (f.name === place.name && f.category === place.category)
    );
  };

  const handleToggleFavorite = async (place) => {
    if (!place) return;
    const favorited = isPlaceFavorited(place);
    try {
      if (favorited) {
        const match = favorites.find(f => 
          (f.googleId && place.mapLink && f.googleId === place.mapLink) ||
          (f.name === place.name && f.category === place.category)
        );
        if (match) {
          await favoritesService.removeFavorite(match.id);
          setFavorites(prev => prev.filter(f => f.id !== match.id));
        }
      } else {
        const newFav = await favoritesService.addFavorite(place);
        setFavorites(prev => [...prev, newFav]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  // ── Chip click ──
  const handleChipClick = async (chipId) => {
    setActiveChip(chipId); setActiveLainnya(null); setLainnyaOpen(false);
    if (!userLocation) return;
    if (chipId === 'all') {
      // Semua: re-use existing results if any, otherwise default to fotokopi
      if (places.length > 0) return; // already have results, just remove category filter
      await runSearch(userLocation, 'Fotokopi');
      return;
    }
    await runSearch(userLocation, resolveApiCat(chipId, appConfig));
  };

  // ── Lainnya sub-category select ──
  const handleLainnyaSelect = async (rawCat) => {
    setActiveLainnya(rawCat); setActiveChip('lainnya'); setLainnyaOpen(false);
    if (!userLocation) return;
    await runSearch(userLocation, rawCat);
  };

  // ── Core search ──
  const runSearch = async (loc, apiCat) => {
    if (!selectedUni) { setError('Pilih kampus terlebih dahulu.'); return; }
    setLoading(true); setHasSearched(true); setPlaces([]); setSelectedPlace(null); setError(''); setFilterQuery('');
    try {
      const results = await placesService.getRecommendations({
        selected_uni: selectedUni,
        selected_cat: apiCat,
        lat: loc.lat,
        lon: loc.lon,
      });
      setPlaces(results);
      if (results.length > 0) setSelectedPlace(results[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Active chip label (for Lainnya sub-selections)
  const activeChipLabel = activeLainnya || CHIP_DEFS.find(c => c.id === activeChip)?.label || 'Semua';

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10 animate-in fade-in duration-500">

      {/* ── Campus selector (compact — ONE row, no second search bar) ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('campus') || 'Kampus'}</span>
        </div>
        <div className="relative">
          <select value={selectedUni} onChange={e => setSelectedUni(e.target.value)}
            disabled={configLoading}
            className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FDC439]/40 focus:border-[#FDC439] shadow-soft cursor-pointer max-w-[280px] disabled:opacity-60">
            {campusList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
        {configLoading && <Loader2 size={14} className="animate-spin text-gray-400"/>}
      </div>

      {/* ── Category chips ── */}
      <div className="flex items-center gap-2.5">

        {/* Scrollable built-in chips — overflow is safe here */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1 flex-1 min-w-0">
          {CHIP_DEFS.map(chip => {
            const isActive = activeChip === chip.id && !activeLainnya;
            return (
              <div key={chip.id} className="relative group shrink-0">
                <button onClick={() => handleChipClick(chip.id)}
                  className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-soft',
                    isActive ? 'border-transparent' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200')}
                  style={isActive ? { background:chip.chipBg, color:chip.chipText } : {}}>
                  <chip.Icon size={15}/>
                  {chip.id === 'all' ? t('all_categories') : chip.id === 'fotokopi' ? t('photocopy') : chip.id === 'atk' ? t('atk') : chip.id === 'makanan' ? t('food') : chip.id === 'minuman' ? t('drink') : chip.label}
                </button>
                {/* ATK tooltip */}
                {chip.id === 'atk' && chip.note && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-gray-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg">{chip.note}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"/>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lainnya — OUTSIDE overflow-x-auto so the dropdown is never clipped */}
        <div className="relative shrink-0" ref={lainnyaRef}>
          <button
            onClick={() => setLainnyaOpen(o => !o)}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-soft',
              activeLainnya
                ? 'bg-[#64748B] text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
            )}
          >
            {activeLainnya ? (
              <>
                <Grid size={15}/>
                <span className="max-w-[100px] truncate">{activeLainnya}</span>
                <X size={13} onClick={e => {
                  e.stopPropagation();
                  setActiveLainnya(null);
                  setActiveChip('fotokopi');
                }}/>
              </>
            ) : (
              <>
                {t('others')}
                <ChevronDown size={13} className={cn('transition-transform duration-200', lainnyaOpen && 'rotate-180')}/>
              </>
            )}
          </button>

          {/* Dropdown — renders below and to the right, z-index above everything */}
          <AnimatePresence>
            {lainnyaOpen && (
              <motion.div
                initial={{ opacity:0, y:6, scale:0.97 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:4, scale:0.97 }}
                transition={{ duration:0.15 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-medium border border-gray-100 overflow-hidden min-w-[200px]"
                style={{ zIndex: 9999 }}
              >
                <div className="p-1.5 max-h-72 overflow-y-auto">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                    {t('others')}
                  </p>
                  {lainnyaCats.map(cat => (
                    <button key={cat} onClick={() => handleLainnyaSelect(cat)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                        activeLainnya === cat
                          ? 'bg-[#FFF8EC] text-[#FD6825] font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>


      {/* ── Map ── */}
      <MapPlaceholder
        places={places}
        hasLocation={!!userLocation}
        onLocate={handleLocate}
        locating={locating}
        onCampusDemo={handleCampusDemo}
        selectedUni={selectedUni}
      />

      {/* Demo mode banner */}
      {usingCampus && userLocation && (
        <div className="flex items-center gap-2 text-xs font-bold text-[#3B82F6] bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
          <Target size={13}/>
          {t('active_location')} <strong className="ml-1">{selectedUni}</strong>
          <span className="font-normal ml-1">({t('demo_mode')})</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          <AlertCircle size={15}/> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-14 text-gray-400">
          <Loader2 size={26} className="animate-spin text-[#FD6825]"/>
          <span className="text-sm font-bold">{t('loading')}</span>
        </div>
      )}

      {/* Pre-search empty */}
      {!loading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Navigation size={26} className="text-gray-300"/>
          </div>
          <p className="text-sm font-medium text-center max-w-xs text-gray-400">
            {t('click') || 'Klik'} <span className="font-bold text-[#3B82F6]">{t('my_location')}</span> {t('or') || 'atau'}{' '}
            <span className="font-bold text-[#FD6825]">{t('use_campus_point')}</span> {t('to_start') || 'pada peta untuk memulai.'}
          </p>
        </div>
      )}

      {/* No results from API */}
      {!loading && hasSearched && places.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
          <MapPin size={32} className="text-gray-300"/>
          <p className="text-sm font-bold">{t('no_recommendations')}</p>
        </div>
      )}

      {/* Results */}
      {!loading && places.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

          {/* Left: list + filter */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('places_near_you')}</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">
                  {t('showing_places', { count: places.length })} · {selectedUni}
                </p>
              </div>
              <button className="text-xs font-bold flex items-center gap-1.5 text-gray-700 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-soft whitespace-nowrap shrink-0 mt-1">
                {t('nearest') || 'Terdekat'} <ChevronDown size={13} className="text-gray-400"/>
              </button>
            </div>

            {/* Text filter — appears only when there are results */}
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder={t('filter_placeholder') || 'Filter: nama, kategori, atau deskripsi…'}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FD6825]/15 focus:border-[#FD6825] shadow-soft transition-all placeholder:text-gray-300"
              />
              {filterQuery && (
                <button onClick={() => setFilterQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={14}/>
                </button>
              )}
            </div>

            {/* Filtered empty state */}
            {filteredPlaces.length === 0 && filterQuery && (
              <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                <Search size={28} className="text-gray-200"/>
                <p className="text-sm font-bold">{(t('no_results_for') || 'Tidak ada hasil untuk') + ` "${filterQuery}"`}</p>
                <button onClick={() => setFilterQuery('')} className="text-xs text-[#FD6825] font-bold hover:underline">{t('clear_filter') || 'Hapus filter'}</button>
              </div>
            )}

            {/* Cards */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredPlaces.map((place, idx) => (
                  <motion.div key={place.id || idx}
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:idx * 0.04 }}>
                    <PlaceCard
                      place={place}
                      isSelected={selectedPlace?.id === place.id}
                      isFavorited={isPlaceFavorited(place)}
                      onToggleFavorite={() => handleToggleFavorite(place)}
                      onClick={() => setSelectedPlace(place)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: detail */}
          <div className="lg:col-span-5 sticky top-28 h-fit">
            <AnimatePresence mode="wait">
              {selectedPlace && (
                <PlaceDetail
                  key={selectedPlace.id}
                  place={selectedPlace}
                  isFavorited={isPlaceFavorited(selectedPlace)}
                  onToggleFavorite={() => handleToggleFavorite(selectedPlace)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
