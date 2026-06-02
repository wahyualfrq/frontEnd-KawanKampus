import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Star, Bookmark, Share2, ChevronDown,
  Printer, Book, Utensils, Coffee, Grid, Loader2,
  AlertCircle, ExternalLink, Search, X, Plus, Minus, Crosshair, Navigation
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
  const defaults = { fotokopi:'Fotokopi', makanan:'Makanan', minuman:'Cafe', atk:'Print', all:'Semua' };
  if (defaults[chipId]) return defaults[chipId];
  return chipId; // Lainnya raw category → send as-is
}

// ── Decorative pin positions (fallback) ──────────────────────────────────────
const PIN_POS = [
  { top:'19%', left:'26%' }, { top:'15%', left:'52%' },
  { top:'18%', left:'70%' }, { top:'63%', left:'20%' },
  { top:'65%', left:'62%' }, { top:'40%', left:'78%' },
];

function getMarkerPosition(place, centerCoords) {
  if (!place || place.lat == null || place.lon == null || !centerCoords) {
    const idx = place?.rank || 1;
    return PIN_POS[idx - 1] || { top: '30%', left: '30%' };
  }

  const latDiff = parseFloat(place.lat) - parseFloat(centerCoords.lat);
  const lonDiff = parseFloat(place.lon) - parseFloat(centerCoords.lon);

  // A typical diff for 1km is around 0.009. Let's scale it.
  const scale = 3500;
  let leftPercent = 50 + (lonDiff * scale * 1.1);
  let topPercent = 44 - (latDiff * scale);

  leftPercent = Math.max(8, Math.min(92, leftPercent));
  topPercent = Math.max(8, Math.min(92, topPercent));

  return {
    top: `${topPercent}%`,
    left: `${leftPercent}%`
  };
}

// ── Map placeholder ───────────────────────────────────────────────────────────
function MapPlaceholder({ places, selectedUni, zoom, setZoom, centerCoords, panOffset, setPanOffset, onSelectPlace, selectedPlace }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click drag
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full rounded-[30px] overflow-hidden shadow-medium border-4 border-white bg-[#FAF8F5]" style={{ height: 420 }}>
      {/* Map Viewport wrapper */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Scaled/zoomed/panned content container */}
        <div 
          className={cn(
            "absolute inset-0 select-none",
            !isDragging && "transition-transform duration-300 ease-out"
          )}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG Map Background */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#FAF8F5"/>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAE6DF" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6"/>

            {/* Green park areas (campus gardens/forests) */}
            <path d="M 150 50 Q 220 20 300 70 T 450 60 L 520 250 Q 400 350 250 280 Z" fill="#E8F4E5" stroke="#D5EDD0" strokeWidth="1.5"/>
            <path d="M 50 250 Q 120 280 180 200 T 250 320 L 120 400 Z" fill="#E8F4E5" stroke="#D5EDD0" strokeWidth="1.5"/>
            <rect x="65%" y="60%" width="28%" height="32%" rx="20" fill="#E2F0DD" stroke="#D5EDD0" strokeWidth="1.5"/>
            
            {/* Campus Lake / River */}
            <path d="M 0 350 Q 200 300 350 340 T 700 280 L 700 320 T 350 380 Q 200 340 0 390 Z" fill="#DCEEF9" opacity="0.8"/>
            <path d="M 0 350 Q 200 300 350 340 T 700 280" fill="none" stroke="#B9DDF3" strokeWidth="1.5"/>

            {/* Secondary streets */}
            <line x1="50" y1="0" x2="50" y2="420" stroke="#F1EFEA" strokeWidth="6"/>
            <line x1="300" y1="0" x2="300" y2="420" stroke="#F1EFEA" strokeWidth="6"/>
            <line x1="600" y1="0" x2="600" y2="420" stroke="#F1EFEA" strokeWidth="6"/>
            <line x1="0" y1="180" x2="700" y2="180" stroke="#F1EFEA" strokeWidth="6"/>
            <line x1="0" y1="280" x2="700" y2="280" stroke="#F1EFEA" strokeWidth="6"/>

            {/* Main roads */}
            <path d="M 0 100 L 700 100" fill="none" stroke="#EAE6DF" strokeWidth="14"/>
            <path d="M 0 100 L 700 100" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
            
            <path d="M 400 0 L 400 420" fill="none" stroke="#EAE6DF" strokeWidth="14"/>
            <path d="M 400 0 L 400 420" fill="none" stroke="#FFFFFF" strokeWidth="10"/>

            <path d="M 120 0 L 120 420" fill="none" stroke="#EAE6DF" strokeWidth="10"/>
            <path d="M 120 0 L 120 420" fill="none" stroke="#FFFFFF" strokeWidth="6"/>

            {/* Building blocks */}
            <g transform="translate(180, 80)">
              <rect width="60" height="40" rx="4" fill="#F0ECE1" stroke="#E5DEC9" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.03))' }}/>
              <text x="30" y="24" fill="#A89E84" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">LIB</text>
            </g>
            <g transform="translate(480, 120)">
              <rect width="70" height="35" rx="4" fill="#F0ECE1" stroke="#E5DEC9" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.03))' }}/>
              <text x="35" y="22" fill="#A89E84" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">ENG</text>
            </g>
            <g transform="translate(460, 290)">
              <rect width="60" height="45" rx="4" fill="#F0ECE1" stroke="#E5DEC9" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.03))' }}/>
              <text x="30" y="26" fill="#A89E84" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">SCI</text>
            </g>
            <g transform="translate(230, 220)">
              <circle cx="25" cy="25" r="22" fill="#F0ECE1" stroke="#E5DEC9" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.03))' }}/>
              <text x="25" y="28" fill="#A89E84" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">AUD</text>
            </g>
            <g transform="translate(70, 20)">
              <rect width="50" height="35" rx="4" fill="#F0ECE1" stroke="#E5DEC9" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.03))' }}/>
              <text x="25" y="22" fill="#A89E84" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">HQ</text>
            </g>
            
            <rect x="5%" y="5%" width="90%" height="90%" rx="16" fill="none" stroke="#FD6825" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.2"/>
          </svg>

          {/* Pulsing Campus Center Dot */}
          <div className="absolute" style={{ top: '44%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 20 }}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-[#FD6825]/15 rounded-full animate-ping"/>
              <div className="absolute w-7  h-7  bg-[#FD6825]/10 rounded-full"/>
              <div className="relative w-4  h-4  bg-[#FD6825] rounded-full border-2 border-white shadow-lg"/>
            </div>
          </div>

          {/* Dynamic Place pins */}
          {places.length > 0 &&
            places.slice(0, 15).map((place, i) => {
              const chip = getChip(place.category);
              const pos = getMarkerPosition(place, centerCoords);
              const isSelected = selectedPlace?.id === place.id;
              return (
                <motion.div 
                  key={place.id || i} 
                  className="absolute" 
                  style={{ top: pos.top, left: pos.left, zIndex: 10 }}
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.08 }}
                >
                  <div 
                    className="relative group/pin cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlace(place);
                    }}
                  >
                    <div 
                      className={cn(
                        "p-2.5 rounded-xl shadow-lg ring-2 ring-white hover:scale-110 transition-transform",
                        isSelected && "ring-[#FD6825] ring-offset-2 scale-110 shadow-xl"
                      )} 
                      style={{ background: chip.pinColor }}
                    >
                      <chip.Icon size={16} color="white"/>
                    </div>
                    <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0"
                       style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `9px solid ${chip.pinColor}` }}/>
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:block z-50">
                      <div className="bg-gray-900/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap shadow-xl border border-white/10">
                        {place.name}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"/>
                    </div>
                  </div>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* FIXED OVERLAY ELEMENTS (Do not scale with zoom) */}

      {/* Campus label */}
      <div className="absolute top-4 left-4" style={{ zIndex: 30 }}>
        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl text-xs font-black text-gray-800 shadow-medium border border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FD6825] animate-pulse"/>
          {selectedUni || 'Pilih Kampus'}
        </div>
      </div>

      {/* Info Box (bottom left) */}
      <div className="absolute bottom-4 left-5 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-gray-100 shadow-medium max-w-[280px]" style={{ zIndex: 30 }}>
        <div className="text-[10px] font-extrabold text-[#FD6825] uppercase tracking-wider mb-0.5">Area Kampus</div>
        <div className="text-[10px] font-medium text-gray-500 leading-normal">
          Rekomendasi dihitung dari titik pusat kampus yang dipilih.
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2" style={{ zIndex: 30 }}>
        <button 
          onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
          className="w-10 h-10 rounded-full bg-white text-gray-700 hover:text-[#FD6825] flex items-center justify-center shadow-medium hover:shadow-lg active:scale-95 transition-all border border-gray-100/50"
          title="Zoom In"
        >
          <Plus size={18} strokeWidth={2.5}/>
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
          className="w-10 h-10 rounded-full bg-white text-gray-700 hover:text-[#FD6825] flex items-center justify-center shadow-medium hover:shadow-lg active:scale-95 transition-all border border-gray-100/50"
          title="Zoom Out"
        >
          <Minus size={18} strokeWidth={2.5}/>
        </button>
        <button 
          onClick={() => {
            setZoom(1.0);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="w-10 h-10 rounded-full bg-white text-gray-700 hover:text-[#FD6825] flex items-center justify-center shadow-medium hover:shadow-lg active:scale-95 transition-all border border-gray-100/50"
          title="Pusatkan Peta"
        >
          <Crosshair size={18} strokeWidth={2.5}/>
        </button>
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
            <span>{formatDistance(place.distanceMeters)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function PlaceDetail({ place, isFavorited, onToggleFavorite, getMapsUrl, handleOpenRoute, selectedUni }) {
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
        <div className="absolute bottom-4 left-5 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background:chip.pinColor }}>
            {place.category || chip.label}
          </span>
          {place.popularityCategory && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-sm flex items-center gap-0.5">
              🔥 {place.popularityCategory}
            </span>
          )}
          {place.distanceCategory && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500 text-white shadow-sm">
              📍 {place.distanceCategory}
            </span>
          )}
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
              {formatDistance(place.distanceMeters)} dari pusat kampus
            </span>
          )}
        </div>

        {/* Google Category and Tags */}
        {(place.googleCategory || place.tags) && (
          <div className="space-y-2 border-t border-gray-50 pt-3">
            {place.googleCategory && (
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Kategori Google: <span className="text-gray-700 capitalize font-medium">{place.googleCategory}</span>
              </p>
            )}
            {place.tags && (
              <div className="flex flex-wrap gap-1.5">
                {(typeof place.tags === 'string' ? place.tags.split(',') : place.tags).map((tag, idx) => {
                  const cleaned = tag.trim();
                  if (!cleaned) return null;
                  return (
                    <span key={idx} className="text-[10px] font-bold text-[#FD6825] bg-[#FFF8EC] border border-[#FDC439]/20 px-2 py-0.5 rounded-lg">
                      #{cleaned}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Trust Score */}
        {place.trustScore != null && (
          <div className="bg-green-50/50 border border-green-100/50 px-4 py-3 rounded-2xl space-y-1.5 shadow-soft">
            <div className="flex justify-between text-xs font-bold text-green-700">
              <span className="flex items-center gap-1">🛡️ Skor Kepercayaan AI</span>
              <span>{place.trustScore > 1 ? place.trustScore : Math.round(place.trustScore * 100)}%</span>
            </div>
            <div className="w-full bg-green-200/40 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${place.trustScore > 1 ? place.trustScore : place.trustScore * 100}%` }}/>
            </div>
          </div>
        )}

        {place.description && (
          <p className="text-sm text-gray-600 leading-relaxed pt-1">{place.description}</p>
        )}

        {place.address && (
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/50">
            <span className="font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{t('address')}</span>
            <span className="leading-relaxed">{place.address}</span>
          </div>
        )}

        {(() => {
          const routeUrl = getMapsUrl ? getMapsUrl(place) : null;
          return (
            <>
              <div className="grid grid-cols-3 gap-3 border-t border-b border-gray-50 py-3.5">
                <button
                  onClick={() => handleOpenRoute && handleOpenRoute(place)}
                  disabled={!routeUrl}
                  title={!routeUrl ? "Link rute tidak tersedia." : ""}
                  className={cn(
                    "flex flex-col items-center gap-1.5 group transition-all",
                    !routeUrl ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                    !routeUrl 
                      ? "bg-gray-100 text-gray-300" 
                      : "bg-gray-50 text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825]"
                  )}>
                    <Navigation size={18}/>
                  </div>
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
                    if (!routeUrl) return;
                    if (navigator.share) {
                      navigator.share({ title: place.name, text: place.name, url: routeUrl })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(routeUrl);
                      alert('Link berhasil disalin!');
                    }
                  }}
                  disabled={!routeUrl}
                  title={!routeUrl ? "Link rute tidak tersedia." : ""}
                  className={cn(
                    "flex flex-col items-center gap-1.5 group transition-all",
                    !routeUrl ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                    !routeUrl 
                      ? "bg-gray-100 text-gray-300" 
                      : "bg-gray-50 text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825]"
                  )}>
                    <Share2 size={18}/>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('share')}</span>
                </button>
              </div>
              
              {!routeUrl && (
                <p className="text-[10px] text-center text-red-500 font-bold bg-red-50/50 py-2.5 rounded-2xl border border-red-100/30">
                  ⚠️ Link rute tidak tersedia.
                </p>
              )}

              {routeUrl ? (
                <button
                  onClick={() => handleOpenRoute && handleOpenRoute(place)}
                  className="w-full bg-[#FD6825] hover:bg-[#E85A1D] py-4 rounded-[16px] text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#FD6825]/25 hover:scale-[1.02] active:scale-95 transition-all">
                  <ExternalLink size={18}/>
                  {t('open_in_google_maps')}
                </button>
              ) : (
                <button disabled className="w-full bg-gray-100 py-4 rounded-[16px] text-gray-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Navigation size={18}/> {t('not_available')}
                </button>
              )}
            </>
          );
        })()}
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

  // Campus + Map States
  const [selectedUni, setSelectedUni]     = useState('');
  const [zoom, setZoom]                   = useState(1.0);
  const [panOffset, setPanOffset]         = useState({ x: 0, y: 0 });
  const prevUniRef                        = useRef('');

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
      if (cfg.campuses?.length) {
        setSelectedUni(cfg.campuses[0].name);
        prevUniRef.current = cfg.campuses[0].name;
      }
    }).finally(() => setConfigLoading(false));

    // Load favorites
    favoritesService.getFavorites().then(favs => {
      setFavorites(favs);
    }).catch(e => console.warn('Failed to load favorites:', e.message));
  }, []);

  // Trigger search on selectedUni / activeChip / activeLainnya changes
  useEffect(() => {
    if (!selectedUni || configLoading) return;

    const centers = appConfig.campusCenters || FALLBACK_CONFIG.campusCenters;
    const campusCenter = centers[selectedUni];
    if (!campusCenter) return;

    // Reset zoom and pan when campus changes
    if (prevUniRef.current !== selectedUni) {
      setZoom(1.0);
      setPanOffset({ x: 0, y: 0 });
      prevUniRef.current = selectedUni;
    }

    const apiCat = activeLainnya || resolveApiCat(activeChip, appConfig);

    runSearch(campusCenter, apiCat);
  }, [selectedUni, activeChip, activeLainnya, configLoading]);

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

  const isPlaceFavorited = (place) => {
    if (!place) return false;
    return favorites.some(f => 
      (f.googleId && place.mapLink && f.googleId === place.mapLink) ||
      (f.name === place.name && f.category === place.category)
    );
  };

  const getMapsUrl = (place) => {
    if (!place) return null;
    if (place.mapLink) return place.mapLink;
    if (place.lat != null && place.lon != null && !isNaN(place.lat) && !isNaN(place.lon)) {
      return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
    }
    if (place.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    }
    return null;
  };

  const handleOpenRoute = (place) => {
    if (!place) return;
    const url = getMapsUrl(place);
    if (!url) return;

    try {
      historyService.createHistory('OPENED_MAP_ROUTE', {
        placeId: place.id || '',
        placeName: place.name || '',
        category: place.rawCategory || place.category || '',
        campus: selectedUni || '',
        mapLink: url,
        distanceText: place.distanceText || ''
      });
    } catch (e) {
      console.warn('[Places] Failed to record OPENED_MAP_ROUTE:', e.message);
    }

    window.open(url, '_blank', 'noopener,noreferrer');
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
        const newFav = await favoritesService.addFavorite({ ...place, campus: selectedUni });
        setFavorites(prev => [...prev, newFav]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  // ── Chip click ──
  const handleChipClick = (chipId) => {
    setActiveChip(chipId);
    setActiveLainnya(null);
    setLainnyaOpen(false);
  };

  // ── Lainnya sub-category select ──
  const handleLainnyaSelect = (rawCat) => {
    setActiveLainnya(rawCat);
    setActiveChip('lainnya');
    setLainnyaOpen(false);
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
      if (results && results.success === false && results.code === 'PLACE_RECOMMENDER_NOT_CONFIGURED') {
        setError('PLACE_RECOMMENDER_NOT_CONFIGURED');
        setPlaces([]);
        setSelectedPlace(null);
      } else {
        setPlaces(results);
        if (results.length > 0) setSelectedPlace(results[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Active chip label (for Lainnya sub-selections)
  const activeChipLabel = activeLainnya || CHIP_DEFS.find(c => c.id === activeChip)?.label || 'Semua';

  const currentCampusCenter = appConfig.campusCenters?.[selectedUni] || FALLBACK_CONFIG.campusCenters?.[selectedUni];

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

        {/* Scrollable built-in chips ── */}
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

        {/* Lainnya dropdown */}
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
        selectedUni={selectedUni}
        zoom={zoom}
        setZoom={setZoom}
        centerCoords={currentCampusCenter}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
        onSelectPlace={setSelectedPlace}
        selectedPlace={selectedPlace}
      />

      {/* Error */}
      {!loading && error && error !== 'PLACE_RECOMMENDER_NOT_CONFIGURED' && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white rounded-[28px] border border-red-100 shadow-medium max-w-2xl mx-auto space-y-5"
        >
          <div className="w-16 h-16 rounded-[22px] bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Layanan rekomendasi sedang bermasalah. Coba lagi nanti.
            </h3>
            {error && <p className="text-xs text-gray-400 font-mono mt-1">Detail: {error}</p>}
          </div>
          <button
            onClick={() => {
              if (currentCampusCenter) {
                runSearch(currentCampusCenter, activeLainnya || resolveApiCat(activeChip, appConfig));
              }
            }}
            className="bg-[#FD6825] hover:bg-[#E85A1D] px-7 py-3 rounded-full text-xs font-bold text-white shadow-lg shadow-[#FD6825]/25 hover:scale-105 active:scale-95 transition-all"
          >
            Coba Lagi
          </button>
        </motion.div>
      )}

      {/* Recommender Service Not Configured State */}
      {!loading && error === 'PLACE_RECOMMENDER_NOT_CONFIGURED' && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white rounded-[28px] border border-gray-100 shadow-medium max-w-2xl mx-auto space-y-5"
        >
          <div className="w-16 h-16 rounded-[22px] bg-[#FFF8EC] border border-[#FDC439]/30 flex items-center justify-center text-[#FD6825] shadow-sm">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Layanan rekomendasi tempat belum terhubung
            </h3>
            <p className="text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
              Fitur Peta sudah siap, tetapi service rekomendasi tempat terpisah belum dikonfigurasi.
            </p>
          </div>
          <button
            onClick={() => {
              if (currentCampusCenter) {
                runSearch(currentCampusCenter, activeLainnya || resolveApiCat(activeChip, appConfig));
              }
            }}
            className="bg-[#FD6825] hover:bg-[#E85A1D] px-7 py-3 rounded-full text-xs font-bold text-white shadow-lg shadow-[#FD6825]/25 hover:scale-105 active:scale-95 transition-all"
          >
            Coba Lagi
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-14 text-gray-400">
          <Loader2 size={26} className="animate-spin text-[#FD6825]"/>
          <span className="text-sm font-bold">{t('loading')}</span>
        </div>
      )}

      {/* No results from API */}
      {!loading && hasSearched && places.length === 0 && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white rounded-[28px] border border-gray-100 shadow-medium max-w-2xl mx-auto space-y-4"
        >
          <div className="w-16 h-16 rounded-[22px] bg-[#FFF8EC] border border-[#FDC439]/30 flex items-center justify-center text-[#FD6825] shadow-sm">
            <MapPin size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Tidak ada rekomendasi untuk kategori ini. Coba kategori lain.
            </h3>
          </div>
        </motion.div>
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
                  {activeChip === 'all'
                    ? `Menampilkan ${filteredPlaces.length} rekomendasi terdekat dari beberapa kategori`
                    : `Menampilkan ${filteredPlaces.length} rekomendasi terdekat · ${activeChipLabel}`}
                </p>
              </div>
              <button className="text-xs font-bold flex items-center gap-1.5 text-gray-700 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-soft whitespace-nowrap shrink-0 mt-1">
                {t('nearest') || 'Terdekat'} <ChevronDown size={13} className="text-gray-400"/>
              </button>
            </div>

            {/* Text filter ── */}
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
                  getMapsUrl={getMapsUrl}
                  handleOpenRoute={handleOpenRoute}
                  selectedUni={selectedUni}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
