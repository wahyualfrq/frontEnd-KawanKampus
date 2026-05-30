import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, User, MapPin, BookOpen, ArrowLeft,
  Loader2, ExternalLink, Navigation, AlertCircle, RefreshCw
} from 'lucide-react';
import useChatbotStore from '../store/chatbotStore';
import api from '../services/api';
import { getChatbotPlaceRecommendation } from '../services/chatbot.service';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferences } from '../context/PreferencesContext';

// ── Constants ────────────────────────────────────────────────────────────────

const CAMPUSES = [
  'STMIK IKMI CIREBON',
  'UNIVERSITAS MULTI DATA PALEMBANG',
  'Universitas Airlangga - B',
  'Universitas Bina Nusantara @Anggrek',
  'Universitas Brawijaya',
  'Universitas Gadjah Mada',
  'Universitas Indonesia',
  'Universitas Institut Teknologi Bandung - Ganesha',
  'Universitas Pendidikan Indonesia Bandung',
];

const CATEGORIES = [
  'Apotek', 'Cafe', 'Fotokopi', 'Kedai', 'Kedai Kopi',
  'Makanan', 'Makanan Siap Saji', 'Minimarket', 'Perhentian Bus',
  'Pizza', 'Print', 'Restoran', 'Restoran Padang',
  'Toko Es Krim', 'Warteg', 'Tempat Fitness',
];

// Campus center coordinates — always used automatically, no geolocation
const CAMPUS_CENTERS = {
  'Universitas Gadjah Mada':                          { lat: -7.7733153,   lon: 110.3892489  },
  'Universitas Airlangga - B':                        { lat: -7.2729075,   lon: 112.7560403  },
  'Universitas Bina Nusantara @Anggrek':              { lat: -6.1950023,   lon: 106.7764187  },
  'Universitas Institut Teknologi Bandung - Ganesha': { lat: -6.8950712,   lon: 107.6099105  },
  'Universitas Brawijaya':                            { lat: -7.9508146,   lon: 112.6132311  },
  'STMIK IKMI CIREBON':                               { lat: -6.7357684,   lon: 108.53979385 },
  'UNIVERSITAS MULTI DATA PALEMBANG':                 { lat: -2.9737715,   lon: 104.75612    },
  'Universitas Indonesia':                            { lat: -6.36894785,  lon: 106.83008385 },
  'Universitas Pendidikan Indonesia Bandung':         { lat: -6.8817098,   lon: 107.5954963  },
};

// Place-flow step identifiers
const STEP = {
  CAMPUS:   'campus',
  CATEGORY: 'category',
  LOADING:  'loading',
  RESULTS:  'results',
  ERROR:    'error',
};

// ── Shared atom components ────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-9 h-9 rounded-xl ai-gradient flex items-center justify-center shrink-0 shadow-sm shadow-[#7C3AED]/20">
      <Bot className="w-4 h-4 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-xl bg-[#FD6825] flex items-center justify-center shrink-0 shadow-sm">
      <User className="w-4 h-4 text-white" />
    </div>
  );
}

function TypingDots() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="flex items-end gap-3">
        <BotAvatar />
        <div className="px-5 py-4 rounded-[20px] rounded-bl-sm bg-white border border-gray-100 flex gap-1.5 shadow-soft">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]/40 animate-bounce" style={{ animationDelay: '160ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]/40 animate-bounce" style={{ animationDelay: '320ms' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Place result card ─────────────────────────────────────────────────────────

function PlaceResultCard({ place, idx }) {
  const name     = place.name     || `Tempat ${idx + 1}`;
  const category = place.category || '';
  const dist     = place.distanceText || null;
  const mapLink  = place.mapLink  || '';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-2 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin size={14} className="text-[#7C3AED]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm leading-snug">{name}</p>
          {category ? (
            <p className="text-[11px] font-bold text-[#7C3AED] mt-0.5">{category}</p>
          ) : null}
          {dist ? (
            <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
              <Navigation size={10} /> {dist}
            </p>
          ) : null}
        </div>
      </div>
      {mapLink ? (
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#FD6825] hover:underline transition-colors"
        >
          <ExternalLink size={11} /> Buka Maps
        </a>
      ) : null}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const { t } = usePreferences();
  const { messages, addMessage, isTyping, setIsTyping } = useChatbotStore();

  // Page mode: 'welcome' | 'place-flow' | 'task-chat'
  const [mode, setMode] = useState('welcome');

  // ── Task-chat state ──
  const [taskInput, setTaskInput] = useState('');
  const taskEndRef = useRef(null);

  // ── Place-flow state ──
  const [placeMessages, setPlaceMessages] = useState([]);
  const [placeStep, setPlaceStep]         = useState(STEP.CAMPUS);
  const [placeTyping, setPlaceTyping]     = useState(false);
  const [selectedCampus, setSelectedCampus]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const placeEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    taskEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    placeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [placeMessages, placeTyping]);

  // ── Message helpers ───────────────────────────────────────────────────────

  const pushBot = useCallback((text, extra = {}) => {
    setPlaceMessages(prev => [...prev, {
      id: `bot_${Date.now()}_${Math.random()}`,
      sender: 'bot',
      text,
      ...extra,
    }]);
  }, []);

  const pushUser = useCallback((text) => {
    setPlaceMessages(prev => [...prev, {
      id: `usr_${Date.now()}_${Math.random()}`,
      sender: 'user',
      text,
    }]);
  }, []);

  // ── Mode transitions ──────────────────────────────────────────────────────

  const goWelcome = () => {
    setMode('welcome');
    setPlaceMessages([]);
    setPlaceStep(STEP.CAMPUS);
    setSelectedCampus('');
    setSelectedCategory('');
    setPlaceTyping(false);
  };

  const startTaskChat = () => setMode('task-chat');

  const startPlaceFlow = () => {
    setPlaceMessages([]);
    setPlaceStep(STEP.CAMPUS);
    setSelectedCampus('');
    setSelectedCategory('');
    setPlaceTyping(false);
    setMode('place-flow');

    // Boot greeting with slight delay for natural feel
    setTimeout(() => {
      pushBot('Hai 👋, aku asisten rekomendasi tempat terdekat. Silakan ikuti pilihan berikut.');
      setTimeout(() => {
        pushBot('Universitas mana yang ingin kamu cari sekitarnya?', { step: STEP.CAMPUS });
      }, 600);
    }, 250);
  };

  // ── Place-flow handlers ───────────────────────────────────────────────────

  const handleCampusSelect = (campus) => {
    if (placeStep !== STEP.CAMPUS) return;
    setSelectedCampus(campus);
    pushUser(campus);
    setPlaceStep(STEP.LOADING);
    setPlaceTyping(true);
    setTimeout(() => {
      setPlaceTyping(false);
      pushBot(`Sip, ${campus}! Sekarang kategori apa yang kamu cari?`, { step: STEP.CATEGORY });
      setPlaceStep(STEP.CATEGORY);
    }, 750);
  };

  const handleCategorySelect = useCallback(async (category) => {
    if (placeStep !== STEP.CATEGORY) return;
    setSelectedCategory(category);
    pushUser(category);
    setPlaceStep(STEP.LOADING);
    setPlaceTyping(true);

    // Inform user we're using campus coordinates automatically
    await new Promise(r => setTimeout(r, 600));
    setPlaceTyping(false);
    pushBot('Baik, aku akan menggunakan titik pusat kampus sebagai lokasi referensi.');
    await new Promise(r => setTimeout(r, 600));
    setPlaceTyping(true);

    // Resolve campus center — always automatic, no geolocation
    const coords = CAMPUS_CENTERS[selectedCampus];
    if (!coords) {
      setPlaceTyping(false);
      pushBot('⚠️ Koordinat kampus tidak tersedia. Coba pilih kampus lain.', { isError: true });
      setPlaceStep(STEP.ERROR);
      return;
    }

    try {
      const result = await getChatbotPlaceRecommendation({
        selected_uni: selectedCampus,
        selected_cat: category,
        lat:          coords.lat,
        lon:          coords.lon,
      });

      setPlaceTyping(false);

      // Controlled error from backend
      if (result.success === false) {
        pushBot(
          result.message || 'Maaf, rekomendasi tempat belum bisa diproses saat ini.',
          { isError: true }
        );
        setPlaceStep(STEP.ERROR);
        return;
      }

      const recs  = result.data?.recommendations || [];
      const reply = result.data?.reply || null;

      if (recs.length > 0) {
        pushBot(
          `Berikut ${recs.length} rekomendasi ${category} di sekitar ${selectedCampus}:`,
          { places: recs }
        );
      } else if (reply) {
        pushBot(reply);
      } else {
        pushBot(`Tidak ditemukan rekomendasi ${category} di sekitar ${selectedCampus}.`);
      }

      setPlaceStep(STEP.RESULTS);
    } catch (err) {
      setPlaceTyping(false);
      const msg = err.response?.data?.message || 'Maaf, rekomendasi tempat belum bisa diproses saat ini.';
      pushBot(`⚠️ ${msg}`, { isError: true });
      setPlaceStep(STEP.ERROR);
    }
  }, [placeStep, selectedCampus, pushBot, pushUser]);

  // ── Task-chat send ────────────────────────────────────────────────────────

  const handleTaskSend = async (e) => {
    e.preventDefault();
    const msg = taskInput.trim();
    if (!msg || isTyping) return;
    setTaskInput('');
    addMessage({ id: Date.now(), text: msg, sender: 'user' });
    setIsTyping(true);
    try {
      const response = await api.post('/chatbot', { message: msg });
      const reply =
        response.data?.data?.reply    ||
        response.data?.reply          ||
        response.data?.data?.message  ||
        response.data?.message        ||
        'Maaf, saya tidak bisa memproses pesan kamu saat ini.';
      addMessage({ id: Date.now() + 1, text: reply, sender: 'bot' });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        'Koneksi ke AI gagal. Pastikan backend berjalan dan AI_API_URL sudah dikonfigurasi.';
      addMessage({ id: Date.now() + 1, text: `⚠️ ${errMsg}`, sender: 'bot' });
    } finally {
      setIsTyping(false);
    }
  };

  // ── Shared back button ────────────────────────────────────────────────────

  function BackButton() {
    return (
      <button
        onClick={goWelcome}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={13} /> Ganti bantuan
      </button>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: WELCOME
  // ════════════════════════════════════════════════════════════════════════════

  if (mode === 'welcome') {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Bot avatar + greeting */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-[28px] ai-gradient flex items-center justify-center shadow-xl shadow-[#7C3AED]/25">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-2 border-white shadow-sm flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1.5">Hai 👋</h1>
            <p className="text-sm font-medium text-gray-500 text-center leading-relaxed">
              Pilih bantuan yang ingin kamu gunakan:
            </p>
          </div>

          {/* Mode cards */}
          <div className="space-y-3.5">
            {/* Rekomendasi Tempat */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={startPlaceFlow}
              className="w-full text-left bg-white border border-gray-100 rounded-[22px] p-5 shadow-medium hover:border-[#FD6825]/25 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-[#FFF1E9] flex items-center justify-center shrink-0 group-hover:bg-[#FD6825]/12 transition-colors">
                  <MapPin size={24} className="text-[#FD6825]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-black text-gray-900 leading-tight mb-0.5">Rekomendasi Tempat</h2>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    Cari warkop, fotokopi, dan tempat sekitar kampus
                  </p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-[#FD6825]/8 flex items-center justify-center shrink-0 group-hover:bg-[#FD6825] transition-all">
                  <ArrowLeft size={14} className="text-[#FD6825] group-hover:text-white rotate-180 transition-colors" />
                </div>
              </div>
            </motion.button>

            {/* Bantu Tugas */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={startTaskChat}
              className="w-full text-left bg-white border border-gray-100 rounded-[22px] p-5 shadow-medium hover:border-[#7C3AED]/25 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#7C3AED]/8 flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED]/15 transition-colors">
                  <BookOpen size={24} className="text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-black text-gray-900 leading-tight mb-0.5">Bantu Tugas (AI)</h2>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    Tanya materi kuliah, konsep, dan penjelasan akademik
                  </p>
                </div>
                <div className="w-7 h-7 rounded-xl bg-[#7C3AED]/8 flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED] transition-all">
                  <ArrowLeft size={14} className="text-[#7C3AED] group-hover:text-white rotate-180 transition-colors" />
                </div>
              </div>
            </motion.button>
          </div>

          <p className="text-center text-[10px] text-gray-400 font-medium mt-8">
            KawanKampus AI dapat membuat kesalahan. Periksa kembali jawaban.
          </p>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: PLACE RECOMMENDATION FLOW
  // ════════════════════════════════════════════════════════════════════════════

  if (mode === 'place-flow') {
    return (
      <div className="p-8 h-full">
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-[24px] shadow-medium border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF1E9] flex items-center justify-center">
                <MapPin size={17} className="text-[#FD6825]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900">Rekomendasi Tempat</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asisten Lokasi</p>
              </div>
            </div>
            <BackButton />
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/30 scrollbar-hide">
            <AnimatePresence initial={false}>
              {placeMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex w-full', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.sender === 'bot' ? (
                    <div className="flex items-end gap-3 max-w-[92%]">
                      <BotAvatar />
                      <div className="space-y-2 flex-1">

                        {/* Main text bubble */}
                        <div className={cn(
                          'px-4 py-3.5 rounded-[18px] rounded-bl-sm shadow-soft border text-sm font-medium leading-relaxed whitespace-pre-wrap',
                          msg.isError
                            ? 'bg-red-50 border-red-100 text-red-700'
                            : 'bg-white border-gray-100 text-gray-800'
                        )}>
                          {msg.text}
                        </div>

                        {/* Campus choice buttons */}
                        {msg.step === STEP.CAMPUS && placeStep === STEP.CAMPUS && (
                          <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                            {CAMPUSES.map(campus => (
                              <button
                                key={campus}
                                onClick={() => handleCampusSelect(campus)}
                                className="text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-[#FD6825]/40 hover:bg-[#FFF1E9] hover:text-[#FD6825] transition-all shadow-soft"
                              >
                                {campus}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Category choice buttons */}
                        {msg.step === STEP.CATEGORY && placeStep === STEP.CATEGORY && (
                          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className="text-left px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] transition-all shadow-soft"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Recommendation result cards */}
                        {msg.places && msg.places.length > 0 && (
                          <div className="space-y-2 pt-0.5">
                            {msg.places.map((place, idx) => (
                              <PlaceResultCard key={place.id || idx} place={place} idx={idx} />
                            ))}
                          </div>
                        )}

                        {/* Restart option after results or error */}
                        {(placeStep === STEP.RESULTS || placeStep === STEP.ERROR) &&
                          msg.id === placeMessages[placeMessages.length - 1]?.id && (
                          <button
                            onClick={startPlaceFlow}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#FD6825] hover:underline mt-1"
                          >
                            <RefreshCw size={11} /> Cari tempat lain
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* User bubble */
                    <div className="flex items-end gap-3 max-w-[75%]">
                      <div className="bg-[#FD6825] px-4 py-3 rounded-[18px] rounded-br-sm shadow-soft">
                        <p className="text-sm font-semibold text-white">{msg.text}</p>
                      </div>
                      <UserAvatar />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {placeTyping && <TypingDots />}
            <div ref={placeEndRef} />
          </div>

          {/* Passive footer — buttons drive the flow */}
          <div className="px-5 py-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-xs text-gray-400 font-medium flex-1">Pilih tombol di atas untuk melanjutkan...</p>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-medium mt-2">
              KawanKampus AI dapat membuat kesalahan. Periksa kembali jawaban.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: TASK-HELP CHAT
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="p-8 h-full">
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-[24px] shadow-medium border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl ai-gradient flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {t('bantu_tugas') || 'Bantu Tugas'}
              </h2>
              <p className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block animate-pulse" />
                AI Support Online
              </p>
            </div>
          </div>
          <BackButton />
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 bg-gray-50/20 scrollbar-hide">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20"
              >
                <div className="w-20 h-20 rounded-3xl ai-gradient flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-base text-gray-700">Tanyakan sesuatu</p>
                  <p className="text-sm text-gray-400 max-w-xs text-center">
                    Materi kuliah, konsep, atau penjelasan akademik
                  </p>
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={cn('flex w-full', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'flex max-w-[85%] items-end gap-3',
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  {msg.sender === 'user' ? <UserAvatar /> : <BotAvatar />}
                  <div className={cn(
                    'px-5 py-4 rounded-[20px] text-sm font-medium leading-relaxed shadow-soft border',
                    msg.sender === 'user'
                      ? 'bg-[#FD6825] text-white border-[#FD6825] rounded-br-sm'
                      : 'bg-white border-gray-100 text-gray-800 rounded-bl-sm whitespace-pre-wrap'
                  )}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && <TypingDots />}
          </AnimatePresence>
          <div ref={taskEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleTaskSend} className="relative flex items-center">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Ketik pertanyaanmu di sini..."
              className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all text-sm font-medium placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!taskInput.trim() || isTyping}
              className="absolute right-2.5 p-3.5 ai-gradient text-white rounded-xl transition-all shadow-lg shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              {isTyping
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />
              }
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 font-medium mt-2.5">
            KawanKampus AI dapat membuat kesalahan. Periksa kembali jawaban.
          </p>
        </div>
      </div>
    </div>
  );
}
