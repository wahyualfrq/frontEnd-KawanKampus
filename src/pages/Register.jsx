import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { registerUser } from '../services/auth.service';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    else if (name.trim().length < 2) errs.name = 'Nama minimal 2 karakter.';
    if (!email.trim()) errs.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Format email tidak valid.';
    if (!password) errs.password = 'Password wajib diisi.';
    else if (password.length < 8) errs.password = 'Password minimal 8 karakter.';
    if (!confirmPassword) errs.confirmPassword = 'Konfirmasi password wajib diisi.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Password tidak cocok.';
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
      // Backend returns token on register → auto-login (Option A)
      const { user, token } = await registerUser(name.trim(), email.trim(), password);
      login(user, token);
      setSuccess(true);
      // Small delay to show success state before redirect
      setTimeout(() => {
        navigate('/places', { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      // Clear passwords from state
      setPassword('');
      setConfirmPassword('');
    }
  };

  // ── Password strength indicator ────────────────────────────
  const passStrength = (() => {
    if (!password) return null;
    if (password.length < 6) return { level: 1, label: 'Lemah', color: '#EF4444' };
    if (password.length < 8) return { level: 2, label: 'Sedang', color: '#F97316' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: 'Kuat', color: '#22C55E' };
    return { level: 3, label: 'Cukup', color: '#FDC439' };
  })();

  return (
    <div className="min-h-screen w-full flex bg-[#F9FAFB]">

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1C1C1E] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #FD6825 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        {/* Glow */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#FDC439]/10 rounded-full blur-[80px] pointer-events-none"/>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-[#FD6825]/15 rounded-full blur-[80px] pointer-events-none"/>

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
              Daftar gratis dan mulai produktif bersama ribuan mahasiswa lainnya.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-3 text-left">
            {[
              'Akun gratis selamanya',
              'Peta rekomendasi tempat kampus',
              'Manajemen tugas Kanban',
              'Chatbot AI siap bantu 24/7',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/8">
                <CheckCircle2 size={16} className="text-[#22C55E] shrink-0"/>
                <span className="text-sm font-semibold text-gray-300">{benefit}</span>
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
            <h2 className="text-3xl font-black text-gray-900 mb-1">Buat akun KawanKampus</h2>
            <p className="text-gray-500 font-medium">Mulai kelola aktivitas kampusmu dengan lebih rapi.</p>
          </div>

          {/* Success state */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-bold"
            >
              <CheckCircle2 size={18} className="shrink-0 text-green-500"/>
              <span>Akun berhasil dibuat! Mengalihkan...</span>
            </motion.div>
          )}

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
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Budi Santoso"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); setError(''); }}
                className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all
                  focus:ring-2 focus:ring-[#FD6825]/20 focus:border-[#FD6825]
                  ${fieldErrors.name ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
              />
              {fieldErrors.name && <p className="text-xs font-medium text-red-500">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input
                id="register-email"
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
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
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
              {/* Strength bar */}
              {passStrength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: lvl <= passStrength.level ? passStrength.color : '#E5E7EB' }}/>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: passStrength.color }}>{passStrength.label}</span>
                </div>
              )}
              {fieldErrors.password && <p className="text-xs font-medium text-red-500">{fieldErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); setError(''); }}
                  className={`w-full px-4 py-3 pr-11 bg-white border rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all
                    focus:ring-2 focus:ring-[#FD6825]/20 focus:border-[#FD6825]
                    ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirm ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs font-medium text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-[#FD6825] hover:bg-[#E85A1D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md shadow-[#FD6825]/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin"/>
                  Membuat akun...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={17}/>
                  Berhasil!
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-gray-500 font-medium">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#FD6825] font-bold hover:text-[#E85A1D] transition-colors">
              Masuk
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
