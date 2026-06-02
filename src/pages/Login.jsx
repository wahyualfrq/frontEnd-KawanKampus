import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, MapPin, Loader2, AlertCircle,
  CheckSquare, MessageSquare, ArrowRight,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { loginUser } from '../services/auth.service';

/* ── Decorative left-panel features list ── */
const FEATURES = [
  { icon: MapPin,       color: '#FD6825', bg: '#FFF1E9', label: 'Peta & Rekomendasi Tempat Kampus' },
  { icon: CheckSquare,  color: '#7C3AED', bg: '#EDE9FE', label: 'Manajemen Tugas Kanban' },
  { icon: MessageSquare,color: '#3B82F6', bg: '#EFF6FF', label: 'Chatbot AI Bantu Tugas' },
];

export default function LoginPage() {
  const navigate  = useNavigate();
  const login     = useAuthStore((state) => state.login);

  const [email,        setEmail]       = useState('');
  const [password,     setPassword]    = useState('');
  const [showPass,     setShowPass]    = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState('');
  const [fieldErrors,  setFieldErrors] = useState({});

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!email.trim())
      errs.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = 'Format email tidak valid.';
    if (!password)
      errs.password = 'Password wajib diisi.';
    return errs;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { user, token } = await loginUser(email.trim(), password);
      login(user, token);
      navigate('/places', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  /* ── Input base classes ── */
  const inputBase = (hasError) =>
    `w-full px-4 py-3 bg-white border rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all
     placeholder-gray-400
     focus:ring-2 focus:ring-[#FD6825]/25 focus:border-[#FD6825]
     ${hasError
       ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
       : 'border-gray-200 hover:border-gray-300'}`;

  return (
    <div className="min-h-screen w-full flex">

      {/* ── LEFT PANEL (branding) ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#18181B] relative overflow-hidden flex-col items-center justify-center p-14">

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}/>

        {/* Glow blobs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#FD6825]/15 rounded-full blur-[90px] pointer-events-none"/>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-[#FDC439]/8 rounded-full blur-[80px] pointer-events-none"/>
        <div className="absolute bottom-0 right-1/3 w-56 h-56 bg-[#7C3AED]/8 rounded-full blur-[80px] pointer-events-none"/>

        <div className="relative z-10 max-w-sm w-full space-y-10">

          {/* Logo */}
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-18 h-18 rounded-3xl bg-[#FD6825] flex items-center justify-center shadow-2xl shadow-[#FD6825]/40"
              style={{ width: 72, height: 72 }}>
              <MapPin size={34} color="white" strokeWidth={2.5}/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Kawan<span className="text-[#FDC439]">Kampus</span>
              </h1>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Platform asisten mahasiswa digital —<br/>
                peta kampus, Kanban, dan AI dalam satu tempat.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, color, bg, label }) => (
              <div key={label}
                className="flex items-center gap-3.5 bg-white/6 hover:bg-white/10 rounded-2xl px-5 py-3.5 border border-white/8 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg + '20' }}>
                  <Icon size={16} style={{ color }}/>
                </div>
                <span className="text-sm font-semibold text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Bottom quote */}
          <div className="border-t border-white/8 pt-8 text-center">
            <p className="text-gray-600 text-xs font-medium">
              Capstone Project • Platform Produktivitas Mahasiswa
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-5 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#FD6825] flex items-center justify-center shadow-sm">
              <MapPin size={17} color="white"/>
            </div>
            <span className="text-xl font-black text-gray-900">
              Kawan<span className="text-[#FD6825]">Kampus</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 sm:p-10">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1.5">
                Masuk ke KawanKampus
              </h2>
              <p className="text-gray-500 font-medium">
                Lanjutkan aktivitas belajarmu hari ini.
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-500"/>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-bold text-gray-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors(p => ({ ...p, email: '' }));
                    setError('');
                  }}
                  className={inputBase(!!fieldErrors.email)}
                />
                {fieldErrors.email && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle size={11}/> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-sm font-bold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors(p => ({ ...p, password: '' }));
                      setError('');
                    }}
                    className={inputBase(!!fieldErrors.password) + ' pr-11'}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle size={11}/> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-2
                  bg-[#FD6825] hover:bg-[#E85A1D]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-bold rounded-2xl
                  shadow-md shadow-[#FD6825]/25
                  transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin"/>
                    Memproses...
                  </>
                ) : (
                  <>Masuk <ArrowRight size={16}/></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"/>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">Belum punya akun?</span>
              </div>
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 hover:border-[#FD6825]/40 hover:bg-[#FFF1E9] text-gray-700 hover:text-[#FD6825] font-bold rounded-2xl text-sm transition-all"
            >
              Daftar sekarang <ArrowRight size={15}/>
            </Link>
          </div>

          {/* Back link */}
          <p className="mt-5 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors">
              ← Kembali ke halaman utama
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
