import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, CheckSquare, MessageSquare, ArrowRight,
  Menu, X, Star, Zap, BookOpen, Coffee, Copy,
  ShoppingBag, ChevronRight, TrendingUp, Clock,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   MINI PREVIEWS (CSS-only mockups, no images)
───────────────────────────────────────────── */

function MiniMapPreview() {
  const pins = [
    { top: '28%', left: '18%', color: '#FD6825', label: 'Fotokopi', Icon: Copy },
    { top: '55%', left: '52%', color: '#22C55E', label: 'Makanan', Icon: Coffee },
    { top: '20%', left: '65%', color: '#3B82F6', label: 'ATK', Icon: ShoppingBag },
    { top: '70%', left: '28%', color: '#7C3AED', label: 'Minuman', Icon: Star },
  ];
  return (
    <div className="relative w-full h-full bg-[#F0EDE5] rounded-2xl overflow-hidden">
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mg" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#BDB6A0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mg)"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#D6CEB8" strokeWidth="8"/>
        <line x1="38%" y1="0" x2="38%" y2="100%" stroke="#D6CEB8" strokeWidth="6"/>
        <rect x="42%" y="12%" width="28%" height="32%" rx="6" fill="#C8E6C0" fillOpacity="0.6"/>
        <ellipse cx="60%" cy="70%" rx="12%" ry="8%" fill="#B8D4F0" fillOpacity="0.5"/>
      </svg>
      {/* Pins */}
      {pins.map((pin, i) => (
        <div key={i} className="absolute flex flex-col items-center"
          style={{ top: pin.top, left: pin.left, transform: 'translate(-50%,-100%)' }}>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white"
            style={{ background: pin.color }}>
            <pin.Icon size={12} color="white" strokeWidth={2.5}/>
          </div>
          <div className="w-0 h-0" style={{
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `5px solid ${pin.color}`
          }}/>
          <div className="absolute top-8 bg-gray-900/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap">
            {pin.label}
          </div>
        </div>
      ))}
      {/* Pulse */}
      <div className="absolute" style={{ top: '44%', left: '38%', transform: 'translate(-50%,-50%)' }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-9 h-9 bg-[#FD6825]/25 rounded-full animate-ping"/>
          <div className="relative w-3.5 h-3.5 bg-[#FD6825] rounded-full border-2 border-white shadow-md"/>
        </div>
      </div>
      {/* Label */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[9px] font-black text-gray-700 shadow-sm border border-gray-100 flex items-center gap-1">
        <MapPin size={9} className="text-[#FD6825]"/> Area Kampus
      </div>
    </div>
  );
}

function MiniKanbanPreview() {
  const cols = [
    { title: 'To Do', color: '#6B7280', tasks: ['Riset paper', 'Outline bab 1'] },
    { title: 'In Progress', color: '#F97316', tasks: ['Analisis data'] },
    { title: 'Done', color: '#22C55E', tasks: ['Proposal', 'Survey'] },
  ];
  return (
    <div className="w-full h-full bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100 flex gap-2 overflow-hidden">
      {cols.map((col) => (
        <div key={col.title} className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }}/>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-wide truncate">{col.title}</span>
          </div>
          {col.tasks.map((t) => (
            <div key={t} className="bg-white rounded-lg px-2 py-1.5 shadow-sm border border-gray-100">
              <div className="h-1 w-3/4 rounded-full mb-1" style={{ background: col.color + '40' }}/>
              <p className="text-[8px] font-bold text-gray-700 leading-tight truncate">{t}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniChatPreview() {
  const messages = [
    { sender: 'user', text: 'Bantu rangkum statistika?' },
    { sender: 'ai', text: 'Tentu! Statistika deskriptif mencakup mean, median, modus...' },
    { sender: 'user', text: 'Contoh soal latihan?' },
  ];
  return (
    <div className="w-full h-full bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100 flex flex-col gap-1.5 overflow-hidden">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-5 h-5 rounded-lg ai-gradient flex items-center justify-center">
          <MessageSquare size={9} color="white"/>
        </div>
        <span className="text-[8px] font-black text-gray-700">Bantu Tugas AI</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"/>
          <span className="text-[7px] text-gray-400 font-medium">Online</span>
        </div>
      </div>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[90%] px-2 py-1.5 rounded-xl text-[8px] font-medium leading-snug ${
            m.sender === 'user'
              ? 'bg-[#FD6825] text-white rounded-br-none'
              : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-none'
          }`}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE CARDS (large, with visual previews)
───────────────────────────────────────────── */

function FeatureCard({ icon: Icon, color, bgColor, gradientFrom, gradientTo, badge, title, desc, preview }) {
  return (
    <div className="group relative bg-white rounded-[28px] overflow-hidden
      shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300
      flex flex-col">
      {/* Gradient top accent bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}/>
      <div className="p-7 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}33)`, border: `1.5px solid ${gradientFrom}30` }}>
            <Icon size={24} style={{ color }}/>
          </div>
          {badge && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `linear-gradient(135deg, ${gradientFrom}18, ${gradientTo}25)`, color, border: `1px solid ${color}20` }}>
              {badge}
            </span>
          )}
        </div>
        {/* Preview */}
        <div className="h-40 rounded-2xl overflow-hidden shadow-inner"
          style={{ background: `linear-gradient(160deg, ${gradientFrom}08, ${gradientTo}10)`, border: `1px solid ${gradientFrom}18` }}>
          {preview}
        </div>
        {/* Text */}
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-1.5">{title}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
        </div>
        {/* CTA hint */}
        <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-auto"
          style={{ color }}>
          Lihat selengkapnya <ChevronRight size={13}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP PREVIEW TABS
───────────────────────────────────────────── */

function AppPreviewSection() {
  const [active, setActive] = useState(0);
  const tabs = [
    {
      id: 'places',
      label: 'Peta Kampus',
      icon: MapPin,
      color: '#FD6825',
      title: 'Temukan tempat di sekitar kampus',
      desc: 'Peta interaktif dengan rekomendasi tempat berdasarkan kebutuhanmu — dari fotokopi, makanan, ATK, hingga tempat nongkrong.',
      preview: <MiniMapPreview/>,
    },
    {
      id: 'kanban',
      label: 'Kanban Tugas',
      icon: CheckSquare,
      color: '#7C3AED',
      title: 'Kelola semua tugas kuliah',
      desc: 'Board Kanban visual dengan kolom To Do, In Progress, dan Done. Drag & drop tugas antar kolom dengan mudah.',
      preview: <MiniKanbanPreview/>,
    },
    {
      id: 'chatbot',
      label: 'Chatbot AI',
      icon: MessageSquare,
      color: '#3B82F6',
      title: 'Asisten AI siap bantu kapan saja',
      desc: 'Tanyakan apa saja: rangkuman materi, ide tugas, penjelasan konsep, atau apapun yang kamu butuhkan saat belajar.',
      preview: <MiniChatPreview/>,
    },
  ];

  return (
    <section className="py-28 relative z-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF1E9] rounded-full border border-[#FD6825]/20">
            <TrendingUp size={12} className="text-[#FD6825]"/>
            <span className="text-[#FD6825] text-xs font-black uppercase tracking-wider">Preview Aplikasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Satu dashboard untuk<br/>
            <span className="text-[#FD6825]">aktivitas kampusmu.</span>
          </h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Semua yang kamu butuhkan sudah tersedia — tidak perlu buka banyak aplikasi lagi.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((tab, i) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  active === i
                    ? 'text-white shadow-md scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={active === i ? { background: tab.color, boxShadow: `0 4px 14px ${tab.color}40` } : {}}
              >
                <TabIcon size={15}/>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {(() => {
          const ActiveIcon = tabs[active].icon;
          return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg shadow-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text */}
            <div className="p-10 lg:p-14 flex flex-col justify-center space-y-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: tabs[active].color + '18' }}>
                <ActiveIcon size={22} style={{ color: tabs[active].color }}/>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{tabs[active].title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{tabs[active].desc}</p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                style={{ color: tabs[active].color }}
              >
                Coba sekarang <ArrowRight size={15}/>
              </Link>
            </div>
            {/* Preview */}
            <div className="h-72 lg:h-auto p-6 lg:p-10 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-gray-100">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-md">
                {tabs[active].preview}
              </div>
            </div>
          </div>
        </div>
          );
        })()}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FD6825] flex items-center justify-center shadow-sm shadow-[#FD6825]/30">
              <MapPin size={15} color="white"/>
            </div>
            <span className="text-lg font-black text-gray-900">
              Kawan<span className="text-[#FD6825]">Kampus</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[['features', 'Fitur'], ['how', 'Cara Kerja'], ['preview', 'Preview']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login"
              className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
              Masuk
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm shadow-[#FD6825]/30 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FD6825 0%, #FFC928 100%)' }}>
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 px-5 py-4 space-y-1 shadow-lg">
            {[['features', 'Fitur'], ['how', 'Cara Kerja'], ['preview', 'Preview']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                Masuk
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-3 text-sm font-bold text-white rounded-xl shadow-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #FD6825 0%, #FFC928 100%)' }}>
                Daftar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Dark bg */}
        <div className="absolute inset-0 bg-[#18181B]"/>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}/>

        {/* Glow blobs */}
        <div className="absolute top-0 right-[-10%] w-[55%] h-[70%] bg-[#FD6825]/12 rounded-full blur-[130px] pointer-events-none"/>
        <div className="absolute bottom-0 left-[-5%] w-[45%] h-[55%] bg-[#FDC439]/8 rounded-full blur-[100px] pointer-events-none"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-[#7C3AED]/6 rounded-full blur-[100px] pointer-events-none"/>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center w-full">
          {/* ── Text column ── */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FD6825]/15 rounded-full border border-[#FD6825]/25">
              <div className="w-1.5 h-1.5 bg-[#FD6825] rounded-full animate-pulse"/>
              <span className="text-[#FDC439] text-xs font-black uppercase tracking-wider">Platform Mahasiswa</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white leading-[1.1] tracking-tight">
                Teman produktif
                <br/>
                <span className="text-[#FDC439]">untuk kehidupan</span>
                <br/>
                <span className="text-white">kampus.</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
              Atur tugas, temukan tempat penting di sekitar kampus, dan dapatkan bantuan AI — semuanya dalam satu platform.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: MapPin, label: 'Rekomendasi Tempat', color: '#FD6825' },
                { icon: CheckSquare, label: 'Kanban Tugas', color: '#7C3AED' },
                { icon: MessageSquare, label: 'Chatbot AI', color: '#3B82F6' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2 bg-white/8 rounded-2xl border border-white/12 backdrop-blur-sm">
                  <Icon size={13} style={{ color }}/>
                  <span className="text-gray-300 text-xs font-bold">{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-[#FD6825] hover:bg-[#E85A1D] text-white font-bold rounded-2xl shadow-lg shadow-[#FD6825]/35 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                Mulai Sekarang <ArrowRight size={16}/>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/16 text-white font-bold rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm text-sm"
              >
                Masuk ke Akun
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex -space-x-2.5">
                {[
                  ['M', '#FD6825'], ['R', '#7C3AED'], ['A', '#22C55E'], ['D', '#3B82F6'],
                ].map(([init, bg], i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#18181B] flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: bg }}>
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs font-medium">
                Bergabung dengan ratusan mahasiswa produktif
              </p>
            </div>
          </div>

          {/* ── Visual column ── */}
          <div className="relative hidden lg:block">
            {/* Floating glow behind cards */}
            <div className="absolute -inset-10 bg-[#FD6825]/8 rounded-full blur-[60px] pointer-events-none"/>

            {/* Main map card */}
            <div className="relative z-10 rounded-[24px] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10 h-56 mb-4">
              <MiniMapPreview/>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/10 h-40">
                <MiniKanbanPreview/>
              </div>
              <div className="rounded-[20px] overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/10 h-40">
                <MiniChatPreview/>
              </div>
            </div>

            {/* Floating stat chips */}
            <div className="absolute -top-3 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-gray-100 flex items-center gap-2.5 z-20">
              <div className="w-8 h-8 rounded-xl bg-[#FFF1E9] flex items-center justify-center">
                <Zap size={15} className="text-[#FD6825]"/>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Produktivitas</p>
                <p className="text-sm font-black text-gray-900">3x lebih cepat</p>
              </div>
            </div>

            <div className="absolute -bottom-3 -left-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-gray-100 flex items-center gap-2.5 z-20">
              <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <BookOpen size={15} className="text-[#7C3AED]"/>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">AI siap bantu</p>
                <p className="text-sm font-black text-gray-900">24 jam sehari</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border-2 border-gray-600 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce"/>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fff8f4 40%, #fef3e8 70%, #ffffff 100%)' }}>
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-[50%] h-[60%] rounded-full blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FD682514 0%, transparent 70%)' }}/>
        <div className="absolute bottom-0 left-0 w-[35%] h-[40%] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FDC43914 0%, transparent 70%)' }}/>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF1E9] rounded-full border border-[#FD6825]/20">
              <Star size={12} className="text-[#FD6825]"/>
              <span className="text-[#FD6825] text-xs font-black uppercase tracking-wider">Fitur Unggulan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Semua yang kamu butuhkan,<br/>
              <span className="text-[#FD6825]">dalam satu tempat.</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              Didesain khusus untuk mahasiswa yang ingin lebih terorganisir dan produktif di kampus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <FeatureCard
              icon={MapPin}
              color="#FD6825"
              bgColor="#FFF1E9"
              gradientFrom="#FD6825"
              gradientTo="#FFC928"
              badge="Populer"
              title="Peta Kampus"
              desc="Temukan fotokopi, makanan, minuman, ATK, dan kebutuhan lain di sekitar kampus dengan rekomendasi cerdas berbasis lokasimu."
              preview={<MiniMapPreview/>}
            />
            <FeatureCard
              icon={CheckSquare}
              color="#7C3AED"
              bgColor="#EDE9FE"
              gradientFrom="#7C3AED"
              gradientTo="#3B82F6"
              badge="Kanban"
              title="Kanban Tugas"
              desc="Kelola tugas kuliah dengan sistem Kanban visual: To Do, In Progress, dan Done. Pantau progres dan deadline setiap saat."
              preview={<MiniKanbanPreview/>}
            />
            <FeatureCard
              icon={MessageSquare}
              color="#3B82F6"
              bgColor="#EFF6FF"
              gradientFrom="#3B82F6"
              gradientTo="#06B6D4"
              badge="AI-Powered"
              title="Chatbot AI"
              desc="Dapatkan bantuan cepat untuk ide, rangkuman materi, penjelasan konsep, dan kebutuhan belajar lainnya dari asisten AI pintar."
              preview={<MiniChatPreview/>}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how" className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EDE9FE20 30%, #F8FAFC 60%, #FFF1E910 100%)' }}>
        {/* Mesh dots */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)', backgroundSize: '28px 28px' }}/>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF1E9] rounded-full border border-[#FD6825]/20">
              <Clock size={12} className="text-[#FD6825]"/>
              <span className="text-[#FD6825] text-xs font-black uppercase tracking-wider">Cara Kerja</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Mulai dalam 3 langkah.</h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              Daftar gratis dan langsung mulai produktif hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#FD6825] via-[#7C3AED] to-[#22C55E] opacity-20"/>

            {[
              {
                step: '01', title: 'Buat Akun',
                desc: 'Daftar gratis dengan nama, email, dan password. Tidak perlu kartu kredit — langsung bisa masuk.',
                gradFrom: '#FD6825', gradTo: '#FFC928',
                icon: BookOpen,
              },
              {
                step: '02', title: 'Jelajahi Kampus',
                desc: 'Buka peta dan temukan tempat-tempat strategis di sekitar kampusmu — fotokopi, warung, ATK, dan lebih banyak lagi.',
                gradFrom: '#7C3AED', gradTo: '#3B82F6',
                icon: MapPin,
              },
              {
                step: '03', title: 'Kelola & Tanyakan',
                desc: 'Atur semua tugas kuliah di Kanban dan gunakan Chatbot AI kapan saja kamu butuh bantuan belajar.',
                gradFrom: '#22C55E', gradTo: '#06B6D4',
                icon: Zap,
              },
            ].map((item) => {
              const StepIcon = item.icon;
              return (
              <div key={item.step}
                className="relative bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                {/* Gradient top accent */}
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${item.gradFrom}, ${item.gradTo})` }}/>
                <div className="p-7 flex flex-col gap-5">
                {/* Step + icon */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${item.gradFrom}, ${item.gradTo})` }}>
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${item.gradFrom}18, ${item.gradTo}22)`, border: `1px solid ${item.gradFrom}25` }}>
                    <StepIcon size={18} style={{ color: item.gradFrom }}/>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                </div>
                </div>
              </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ────────────────────────────────────────────── */}
      <div id="preview" className="relative overflow-hidden"
        style={{ background: 'linear-gradient(175deg, #ffffff 0%, #F0EBF8 35%, #E8F1FE 65%, #ffffff 100%)' }}>
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED12 0%, transparent 70%)' }}/>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-[130px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3B82F610 0%, transparent 70%)' }}/>
        <AppPreviewSection/>
      </div>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section id="about" className="py-28 bg-[#18181B] relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}/>
        {/* Glows */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FD6825]/10 rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-1/3 h-3/4 bg-[#FDC439]/6 rounded-full blur-[100px] pointer-events-none"/>

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FD6825]/15 rounded-full border border-[#FD6825]/25">
            <Star size={12} className="text-[#FDC439]"/>
            <span className="text-[#FDC439] text-xs font-black uppercase tracking-wider">Siap Mulai?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Siap membuat aktivitas<br/>
            <span className="text-[#FDC439]">kampus lebih rapi?</span>
          </h2>

          <p className="text-gray-400 font-medium text-lg max-w-lg mx-auto leading-relaxed">
            Mulai dari mencari tempat fotokopi, mengelola tugas, sampai bertanya ke AI — semuanya gratis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-2xl shadow-lg shadow-[#FD6825]/30 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FD6825 0%, #FFC928 100%)' }}
            >
              Daftar Gratis <ArrowRight size={16}/>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/16 text-white font-bold rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              Masuk ke Akun
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { icon: Star, text: 'Gratis selamanya' },
              { icon: Zap, text: 'Tanpa setup rumit' },
              { icon: BookOpen, text: 'Khusus mahasiswa' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <Icon size={14} className="text-[#FDC439]"/>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#111111] py-10 px-5 sm:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FD6825] flex items-center justify-center shadow-sm">
                <MapPin size={13} color="white"/>
              </div>
              <span className="font-black text-white">
                Kawan<span className="text-[#FD6825]">Kampus</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              {[['features', 'Fitur'], ['how', 'Cara Kerja'], ['preview', 'Preview']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-gray-600 hover:text-gray-400 text-xs font-semibold transition-colors">
                  {label}
                </button>
              ))}
            </div>

            {/* Right */}
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-xs font-medium">Capstone Project</p>
              <p className="text-gray-700 text-xs font-medium">© {new Date().getFullYear()} KawanKampus</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
