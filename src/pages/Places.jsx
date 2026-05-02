import { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  Bookmark, 
  Share2, 
  Send,
  ChevronDown,
  Printer,
  Book,
  Utensils,
  Coffee,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const categories = [
  { id: 'all', name: 'Semua', icon: Grid },
  { id: 'fotokopi', name: 'Fotokopi', icon: Printer, color: '#7C3AED' },
  { id: 'atk', name: 'ATK', icon: Book, color: '#3B82F6' },
  { id: 'makanan', name: 'Makanan', icon: Utensils, color: '#F97316' },
  { id: 'minuman', name: 'Minuman', icon: Coffee, color: '#22C55E' },
];

const mockPlaces = [
  { 
    id: 1, 
    name: 'Fotokopi Makmur Jaya', 
    type: 'Fotokopi', 
    rating: 4.6, 
    reviews: 128, 
    distance: '120 m', 
    status: 'Buka', 
    hours: '08.00 - 20.00',
    image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&q=80&w=400',
    desc: 'Melayani fotokopi, print, scan, jilid, dan perlengkapan tugas lainnya dengan harga terjangkau.'
  },
  { 
    id: 2, 
    name: 'Toko ATK Kampus', 
    type: 'ATK', 
    rating: 4.4, 
    reviews: 96, 
    distance: '180 m', 
    status: 'Buka', 
    hours: '08.00 - 21.00',
    image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=400',
    desc: 'Pusat alat tulis kantor dan perlengkapan kuliah paling lengkap di area kampus.'
  },
  { 
    id: 3, 
    name: 'Warung Bu Rini', 
    type: 'Makanan', 
    rating: 4.7, 
    reviews: 203, 
    distance: '250 m', 
    status: 'Buka', 
    hours: '07.00 - 21.00',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
    desc: 'Masakan rumah khas Jawa dengan varian menu nasi rames yang selalu hangat dan lezat.'
  },
  { 
    id: 4, 
    name: 'Kopi Nalar', 
    type: 'Minuman', 
    rating: 4.5, 
    reviews: 87, 
    distance: '300 m', 
    status: 'Tutup', 
    hours: '08.00 - 22.00',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400',
    desc: 'Tempat nongkrong asik sambil nugas dengan racikan kopi pilihan dan suasana tenang.'
  },
];

export default function PlacesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(mockPlaces[0]);
  const [sortOrder, setSortOrder] = useState('Terdekat');

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-soft border",
                isActive 
                  ? "bg-[#FD6825] text-white border-[#FD6825]" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-100"
              )}
            >
              <cat.icon size={16} />
              {cat.name}
            </button>
          );
        })}
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white text-gray-700 border border-gray-100 shadow-soft">
          Lainnya <ChevronDown size={14} />
        </button>
      </div>

      <div className="relative w-full h-[420px] rounded-[24px] overflow-hidden shadow-medium border-4 border-white group">
        <div className="absolute inset-0 bg-gray-100">
           <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
            alt="Map View" 
            className="w-full h-full object-cover opacity-90" 
          />
          
          <motion.div 
            whileHover={{ scale: 1.2, zIndex: 20 }}
            className="absolute top-1/4 left-1/3 p-2.5 bg-[#7C3AED] text-white rounded-xl shadow-lg cursor-pointer ring-4 ring-white"
          >
            <Printer size={18} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#7C3AED]"></div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.2, zIndex: 20 }}
            className="absolute top-1/2 left-2/3 p-2.5 bg-[#3B82F6] text-white rounded-xl shadow-lg cursor-pointer ring-4 ring-white"
          >
            <Book size={18} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#3B82F6]"></div>
          </motion.div>

          <div className="absolute top-[45%] left-[55%] flex items-center justify-center">
            <div className="absolute w-20 h-20 bg-[#3B82F6]/10 rounded-full animate-ping"></div>
            <div className="relative w-5 h-5 bg-[#3B82F6] rounded-full border-4 border-white shadow-xl"></div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6">
          <button className="glass px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-white transition-all shadow-medium">
            <Navigation size={16} className="text-[#3B82F6] fill-[#3B82F6]" />
            Lokasi Saya
          </button>
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-3">
           <div className="glass flex flex-col rounded-2xl overflow-hidden shadow-medium">
              <button className="p-3 hover:bg-white transition-all border-b border-gray-100 font-bold text-lg">+</button>
              <button className="p-3 hover:bg-white transition-all font-bold text-lg">-</button>
           </div>
           <button className="glass p-3 rounded-2xl hover:bg-white transition-all shadow-medium">
              <Grid size={20} className="text-gray-600" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tempat di Sekitar Kamu</h2>
              <p className="text-sm text-gray-500 font-bold mt-1">25+ Fasilitas Terdeteksi</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Urutkan</span>
              <button className="text-xs font-bold flex items-center gap-2 text-gray-900 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-soft">
                {sortOrder} <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mockPlaces.map((place) => {
              const isSelected = selectedPlace.id === place.id;
              return (
                <motion.div
                  key={place.id}
                  layout
                  onClick={() => setSelectedPlace(place)}
                  className={cn(
                    "relative flex gap-5 p-5 rounded-[20px] transition-all cursor-pointer border group shadow-soft",
                    isSelected 
                      ? "bg-[#FFF1E9] border-[#FD6825] ring-1 ring-[#FD6825]/30" 
                      : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-medium hover:-translate-y-1"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-inner",
                    place.type === 'Fotokopi' ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 
                    place.type === 'ATK' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                    place.type === 'Makanan' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#22C55E]/10 text-[#22C55E]'
                  )}>
                    {place.type === 'Fotokopi' ? <Printer size={28} /> : 
                     place.type === 'ATK' ? <Book size={28} /> :
                     place.type === 'Makanan' ? <Utensils size={28} /> : <Coffee size={28} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{place.name}</h3>
                      <div className="flex items-center gap-3">
                         <span className={cn(
                           "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider",
                           place.status === 'Buka' ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-gray-100 text-gray-400'
                         )}>{place.status}</span>
                         <button className={cn("transition-colors", isSelected ? "text-[#FD6825]" : "text-gray-300 hover:text-[#FD6825]")}>
                            <Bookmark size={20} fill={isSelected ? "currentColor" : "none"} />
                         </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-900">{place.rating}</span>
                        <span className="text-gray-400">({place.reviews})</span>
                      </div>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{place.distance}</span>
                      </div>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{place.hours}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel Section */}
        <div className="lg:col-span-5 h-fit sticky top-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlace.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-medium border border-gray-100"
            >
              <div className="h-56 relative overflow-hidden group">
                <img 
                  src={selectedPlace.image} 
                  alt={selectedPlace.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                   <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">
                      {selectedPlace.type}
                   </span>
                </div>
              </div>
              
              <div className="p-7 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedPlace.name}</h3>
                    <div className="flex items-center gap-1.5 bg-[#FFF6D6] px-3 py-1.5 rounded-xl border border-[#FDC439]/30">
                      <Star size={16} className="text-[#FDC439] fill-[#FDC439]" />
                      <span className="font-bold text-gray-900">{selectedPlace.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl uppercase tracking-wider",
                      selectedPlace.status === 'Buka' ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-gray-100 text-gray-400'
                    )}>{selectedPlace.status}</div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={16} className="text-gray-400" />
                      {selectedPlace.hours}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    {selectedPlace.desc}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-50 py-6">
                  <button className="flex flex-col items-center gap-2.5 group">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825] transition-all">
                      <Navigation size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rute</span>
                  </button>
                  <button className="flex flex-col items-center gap-2.5 group">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825] transition-all">
                      <Bookmark size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Simpan</span>
                  </button>
                  <button className="flex flex-col items-center gap-2.5 group">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6825]/10 group-hover:text-[#FD6825] transition-all">
                      <Share2 size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bagikan</span>
                  </button>
                </div>

                <button className="w-full bg-[#FD6825] hover:bg-[#E85A1D] py-4.5 rounded-[16px] text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#FD6825]/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  <Send size={20} />
                  Dapatkan Petunjuk Jalan
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
