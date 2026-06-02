import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CheckSquare, MessageSquare, ArrowRight, Menu, X } from 'lucide-react';

// ── Mini Map Preview ─────────────────────────────────────────────────────────
function MiniMapPreview() {
  return (
    <div className="relative w-full h-full bg-[#F5F0E8] rounded-2xl overflow-hidden border border-[#E8E0CC]">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mini-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#C8BFA0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mini-grid)"/>
        {/* Roads */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#E8E0CC" strokeWidth="6"/>
        <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#E8E0CC" strokeWidth="6"/>
        {/* Park area */}
        <rect x="45%" y="10%" width="30%" height="35%" rx="8" fill="#D5EDD0" fillOpacity="0.7"/>
      </svg>

      {/* Campus pins */}
      {[
        { top: '28%', left: '20%', color: '#7C3AED', label: 'Fotokopi' },
        { top: '55%', left: '48%', color: '#FD6825', label: 'Makanan' },
        { top: '22%', left: '62%', color: '#22C55E', label: 'Minuman' },
        { top: '68%', left: '25%', color: '#3B82F6', label: 'ATK' },
      ].map((pin, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ top: pin.top, left: pin.left, transform: 'translate(-50%,-100%)' }}
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white"
            style={{ background: pin.color }}
          >
            <MapPin size={13} color="white" />
          </div>
          <div className="absolute top-full mt-1 bg-gray-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap">
            {pin.label}
          </div>
          <div className="w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `6px solid ${pin.color}` }}/>
        </div>
      ))}

      {/* Center pulse */}
      <div className="absolute" style={{ top: '44%', left: '40%', transform: 'translate(-50%,-50%)' }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 bg-[#FD6825]/20 rounded-full animate-ping"/>
          <div className="relative w-4 h-4 bg-[#FD6825] rounded-full border-2 border-white shadow-md"/>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-700 shadow-sm border border-gray-100">
        📍 Area Kampus
      </div>
    </div>
  );
}

// ── Mini Kanban Preview ──────────────────────────────────────────────────────
function MiniKanbanPreview() {
  const cols = [
    { title: 'To Do', color: '#6B7280', tasks: ['Riset paper', 'Outline bab 1'] },
    { title: 'In Progress', color: '#F97316', tasks: ['Analisis data'] },
    { title: 'Done', color: '#22C55E', tasks: ['Proposal', 'Survey'] },
  ];
  return (
    <div className="w-full h-full bg-[#F9FAFB] rounded-2xl p-3 border border-gray-100 flex gap-2 overflow-hidden">
      {cols.map((col) => (
        <div key={col.title} className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }}/>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-wide truncate">{col.title}</span>
          </div>
          {col.tasks.map((task) => (
            <div key={task} className="bg-white rounded-lg px-2 py-1.5 shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-700 leading-tight truncate">{task}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Mini Chat Preview ────────────────────────────────────────────────────────
function MiniChatPreview() {
  const messages = [
    { sender: 'user', text: 'Bantu rangkum materi statistika?' },
    { sender: 'ai', text: 'Tentu! Statistika deskriptif mencakup...' },
    { sender: 'user', text: 'Contoh soal latihan?' },
  ];
  return (
    <div className="w-full h-full bg-[#F9FAFB] rounded-2xl p-3 border border-gray-100 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
          <MessageSquare size={10} color="white"/>
        </div>
        <span className="text-[9px] font-black text-gray-700">Bantu Tugas AI</span>
        <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full"/>
      </div>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[9px] font-medium leading-relaxed ${
              m.sender === 'user'
                ? 'bg-[#FD6825] text-white rounded-br-sm'
                : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm'
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, color, bgColor, title, desc, preview }) {
  return (
    <div className="group bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bgColor }}>
          <Icon size={22} style={{ color }}/>
        </div>
        <h3 className="text-base font-black text-gray-900">{title}</h3>
      </div>
      <div className="h-36 rounded-xl overflow-hidden">{preview}</div>
      <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
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

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FD6825] flex items-center justify-center shadow-sm">
              <MapPin size={16} color="white"/>
            </div>
            <span className="text-lg font-black text-gray-900">
              Kawan<span className="text-[#FD6825]">Kampus</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            <button onClick={() => scrollTo('features')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Fitur</button>
            <button onClick={() => scrollTo('how')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Cara Kerja</button>
            <button onClick={() => scrollTo('about')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Tentang</button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all">
              Masuk
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-[#FD6825] hover:bg-[#E85A1D] rounded-xl shadow-sm shadow-[#FD6825]/30 transition-all hover:scale-105 active:scale-95">
              Daftar
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-5 py-4 space-y-1 shadow-md">
            <button onClick={() => scrollTo('features')} className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Fitur</button>
            <button onClick={() => scrollTo('how')} className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cara Kerja</button>
            <button onClick={() => scrollTo('about')} className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Tentang</button>
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Masuk</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-[#FD6825] rounded-xl shadow-sm transition-all">Daftar</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Dark charcoal bg */}
        <div className="absolute inset-0 bg-[#1C1C1E]"/>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>

        {/* Glow blobs */}
        <div className="absolute top-1/4 right-0 w-[50%] h-[60%] bg-[#FD6825]/10 rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-[#FDC439]/8 rounded-full blur-[100px] pointer-events-none"/>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FD6825]/15 rounded-full border border-[#FD6825]/20">
              <div className="w-1.5 h-1.5 bg-[#FD6825] rounded-full animate-pulse"/>
              <span className="text-[#FDC439] text-xs font-bold uppercase tracking-wider">Platform Mahasiswa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-white leading-tight">
              Teman produktif untuk{' '}
              <span className="text-[#FDC439]">kehidupan kampus.</span>
            </h1>

            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
              Atur tugas, temukan tempat penting di sekitar kampus, dan dapatkan bantuan AI dalam satu platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FD6825] hover:bg-[#E85A1D] text-white font-bold rounded-2xl shadow-lg shadow-[#FD6825]/30 transition-all hover:scale-105 active:scale-95"
              >
                Mulai Sekarang <ArrowRight size={16}/>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Masuk ke Akun
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {['M', 'R', 'A', 'D'].map((init, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1C1C1E] flex items-center justify-center text-[11px] font-black text-white"
                    style={{ background: ['#FD6825','#7C3AED','#22C55E','#3B82F6'][i] }}>
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs font-medium">
                Bergabung dengan ratusan mahasiswa produktif
              </p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:flex flex-col gap-3">
            {/* Map */}
            <div className="h-52 rounded-[20px] overflow-hidden shadow-xl ring-1 ring-white/10">
              <MiniMapPreview/>
            </div>
            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-36 rounded-[16px] overflow-hidden shadow-xl ring-1 ring-white/10">
                <MiniKanbanPreview/>
              </div>
              <div className="h-36 rounded-[16px] overflow-hidden shadow-xl ring-1 ring-white/10">
                <MiniChatPreview/>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <div className="w-5 h-8 rounded-full border-2 border-gray-600 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce"/>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF1E9] rounded-full border border-[#FD6825]/20">
              <span className="text-[#FD6825] text-xs font-black uppercase tracking-wider">Fitur Unggulan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Semua yang kamu butuhkan,<br/>
              <span className="text-[#FD6825]">dalam satu tempat.</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              Didesain khusus untuk mahasiswa yang ingin lebih produktif di kampus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={MapPin}
              color="#FD6825"
              bgColor="#FFF1E9"
              title="Peta Kampus"
              desc="Temukan fotokopi, makanan, minuman, ATK, dan kebutuhan lain di sekitar kampus dengan rekomendasi cerdas."
              preview={<MiniMapPreview/>}
            />
            <FeatureCard
              icon={CheckSquare}
              color="#7C3AED"
              bgColor="#EDE9FE"
              title="Kanban Tugas"
              desc="Kelola tugas kuliah dengan sistem Kanban visual: To Do, In Progress, dan Done. Pantau progres setiap saat."
              preview={<MiniKanbanPreview/>}
            />
            <FeatureCard
              icon={MessageSquare}
              color="#3B82F6"
              bgColor="#EFF6FF"
              title="Chatbot AI"
              desc="Dapatkan bantuan cepat untuk ide, rangkuman materi, dan kebutuhan belajar lainnya dari asisten AI pintar."
              preview={<MiniChatPreview/>}
            />
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF1E9] rounded-full border border-[#FD6825]/20">
              <span className="text-[#FD6825] text-xs font-black uppercase tracking-wider">Cara Kerja</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Mulai dalam 3 langkah.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Buat Akun', desc: 'Daftar gratis dengan nama, email, dan password. Tidak perlu kartu kredit.', color: '#FD6825' },
              { step: '02', title: 'Jelajahi Kampus', desc: 'Buka peta dan temukan tempat terdekat di sekitar kampusmu.', color: '#7C3AED' },
              { step: '03', title: 'Kelola & Tanyakan', desc: 'Atur tugas di Kanban dan tanya apapun ke Chatbot AI kapan saja.', color: '#22C55E' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-[18px] flex items-center justify-center text-xl font-black text-white shadow-md"
                  style={{ background: item.color }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / CTA ── */}
      <section id="about" className="py-24 bg-[#1C1C1E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FD6825]/8 rounded-full blur-[120px] pointer-events-none"/>

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FD6825]/15 rounded-full border border-[#FD6825]/20">
            <span className="text-[#FDC439] text-xs font-black uppercase tracking-wider">Siap Mulai?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Siap membuat aktivitas<br/>
            <span className="text-[#FDC439]">kampus lebih rapi?</span>
          </h2>
          <p className="text-gray-400 font-medium text-lg">
            Bergabunglah sekarang dan rasakan perbedaannya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FD6825] hover:bg-[#E85A1D] text-white font-bold rounded-2xl shadow-lg shadow-[#FD6825]/30 transition-all hover:scale-105 active:scale-95"
            >
              Daftar Gratis <ArrowRight size={16}/>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              Masuk ke Akun
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#111111] py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#FD6825] flex items-center justify-center">
              <MapPin size={13} color="white"/>
            </div>
            <span className="font-black text-white">
              Kawan<span className="text-[#FD6825]">Kampus</span>
            </span>
          </div>

          <p className="text-gray-600 text-xs font-medium text-center">
            Capstone Project — Platform Asisten Mahasiswa Digital
          </p>

          <p className="text-gray-700 text-xs font-medium">
            © {new Date().getFullYear()} KawanKampus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
