import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { loginUser } from '../services/auth.service';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Format email tidak valid.';
    if (!password) errs.password = 'Password wajib diisi.';
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────
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
      // Clear password from state after submission attempt
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F9FAFB]">

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1C1C1E] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        {/* Glow */}
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-[#FD6825]/15 rounded-full blur-[80px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FDC439]/10 rounded-full blur-[80px] pointer-events-none"/>

        <div className="relative z-10 space-y-10 max-w-sm text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FD6825] flex items-center justify-center shadow-lg shadow-[#FD6825]/40">
              <MapPin size={30} color="white"/>
            </div>
            <h1 className="text-3xl font-black text-white">
              Kawan<span className="text-[#FDC439]">Kampus</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              Platform asisten mahasiswa digital — peta kampus, Kanban tugas, dan Chatbot AI dalam satu tempat.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { emoji: '📍', label: 'Peta & Rekomendasi Tempat Kampus' },
              { emoji: '📋', label: 'Manajemen Tugas Kanban' },
              { emoji: '🤖', label: 'Chatbot AI Bantu Tugas' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/8">
                <span className="text-lg">{f.emoji}</span>
                <span className="text-sm font-semibold text-gray-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#FD6825] flex items-center justify-center shadow-sm">
              <MapPin size={17} color="white"/>
            </div>
            <span className="text-xl font-black text-gray-900">
              Kawan<span className="text-[#FD6825]">Kampus</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">Masuk ke KawanKampus</h2>
            <p className="text-gray-500 font-medium">Lanjutkan aktivitas belajarmu hari ini.</p>
          </div>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
            >
              <AlertCircle size={17} className="shrink-0 mt-0.5"/>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); setError(''); }}
                className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all
                  focus:ring-2 focus:ring-[#FD6825]/20 focus:border-[#FD6825]
                  ${fieldErrors.email ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {fieldErrors.email && <p className="text-xs font-medium text-red-500">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); setError(''); }}
                  className={`w-full px-4 py-3 pr-11 bg-white border rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all
                    focus:ring-2 focus:ring-[#FD6825]/20 focus:border-[#FD6825]
                    ${fieldErrors.password ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs font-medium text-red-500">{fieldErrors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FD6825] hover:bg-[#E85A1D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md shadow-[#FD6825]/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin"/>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-7 text-center text-sm text-gray-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#FD6825] font-bold hover:text-[#E85A1D] transition-colors">
              Daftar sekarang
            </Link>
          </p>

          {/* Back to landing */}
          <p className="mt-3 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors">
              ← Kembali ke halaman utama
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
