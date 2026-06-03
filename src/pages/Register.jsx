import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, MapPin, Loader2, AlertCircle, CheckCircle2, ArrowRight,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { registerUser } from '../services/auth.service';
import BrandLogo from '../components/common/BrandLogo';
import { usePreferences } from '../context/PreferencesContext';

export default function RegisterPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const login    = useAuthStore((state) => state.login);

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [fieldErrors,     setFieldErrors]     = useState({});
  const [success,         setSuccess]         = useState(false);

  /* ── Benefits shown in left panel ── */
  const BENEFITS = [
    t('benefit_free'),
    t('benefit_map'),
    t('benefit_kanban'),
    t('benefit_chatbot'),
  ];

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!name.trim())              errs.name = t('name_required');
    else if (name.trim().length < 2) errs.name = t('name_min_length');
    if (!email.trim())             errs.email = t('email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('email_invalid');
    if (!password)                 errs.password = t('password_required');
    else if (password.length < 8)  errs.password = t('password_min_length');
    if (!confirmPassword)          errs.confirmPassword = t('confirm_password_required');
    else if (password !== confirmPassword) errs.confirmPassword = t('passwords_must_match');
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
      const { user, token } = await registerUser(name.trim(), email.trim(), password);
      login(user, token);
      setSuccess(true);
      setTimeout(() => navigate('/places', { replace: true }), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  /* ── Password strength ── */
  const passStrength = (() => {
    if (!password) return null;
    if (password.length < 6)  return { level: 1, label: t('password_strength_weak'),  color: '#EF4444' };
    if (password.length < 8)  return { level: 2, label: t('password_strength_medium'), color: '#F97316' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: t('password_strength_strong'), color: '#22C55E' };
    return { level: 3, label: t('password_strength_fair'), color: '#FDC439' };
  })();

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
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col items-center justify-center p-14"
        style={{ background: 'linear-gradient(160deg, #1a1a1f 0%, #18231e 35%, #1a1826 65%, #18181B 100%)' }}>

        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #FDC439, #FD6825, #22C55E)' }}/>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FDC439 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}/>

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#FDC439]/10 rounded-full blur-[90px] pointer-events-none"/>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-[#FD6825]/15 rounded-full blur-[80px] pointer-events-none"/>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-[#7C3AED]/8 rounded-full blur-[70px] pointer-events-none"/>

        <div className="relative z-10 max-w-sm w-full space-y-10">

          {/* Logo */}
          <div className="flex flex-col items-center text-center gap-5">
            <BrandLogo variant="mark" size="lg" dark={true} />
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Kawan<span className="text-[#FDC439]">Kampus</span>
              </h1>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                {t('register_tagline')}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2.5">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3.5 bg-white/6 hover:bg-white/10 rounded-2xl px-5 py-3 border border-white/8 transition-colors">
                <CheckCircle2 size={16} className="text-[#22C55E] shrink-0"/>
                <span className="text-sm font-semibold text-gray-300">{b}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-white/8 pt-8 text-center">
            <p className="text-gray-600 text-xs font-medium">
              {t('capstone_project')}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <BrandLogo variant="full" size="sm" dark={false} />
          </div>

          {/* Card */}
          <div className="bg-white rounded-[24px] md:rounded-[28px] border border-gray-100 shadow-xl shadow-gray-200/50 p-5 sm:p-8 md:p-10">

            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1.5">
                {t('register_title')}
              </h2>
              <p className="text-gray-500 font-medium">
                {t('register_subtitle')}
              </p>
            </div>

            {/* Success state */}
            {success && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-bold">
                <CheckCircle2 size={18} className="shrink-0 text-green-500"/>
                <span>{t('success_redirect')}</span>
              </div>
            )}

            {/* Error alert */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-500"/>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="text-sm font-bold text-gray-700">
                  {t('full_name')}
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors(p => ({ ...p, name: '' }));
                    setError('');
                  }}
                  className={inputBase(!!fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle size={11}/> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="register-email" className="text-sm font-bold text-gray-700">
                  {t('email_address')}
                </label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="text-sm font-bold text-gray-700">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('password_placeholder')}
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
                    aria-label={showPass ? t('hide_password') : t('show_password')}
                  >
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {/* Strength bar */}
                {passStrength && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div key={lvl} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: lvl <= passStrength.level ? passStrength.color : '#E5E7EB' }}/>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: passStrength.color }}>
                      {passStrength.label}
                    </span>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle size={11}/> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="register-confirm-password" className="text-sm font-bold text-gray-700">
                  {t('confirm_password')}
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('repeat_password_placeholder')}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFieldErrors(p => ({ ...p, confirmPassword: '' }));
                      setError('');
                    }}
                    className={inputBase(!!fieldErrors.confirmPassword) + ' pr-11'}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                    aria-label={showConfirm ? t('hide_password') : t('show_password')}
                  >
                    {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && password && confirmPassword === password && !fieldErrors.confirmPassword && (
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={11}/> {t('password_matched')}
                  </p>
                )}
                {fieldErrors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle size={11}/> {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="register-submit"
                disabled={loading || success}
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
                    {t('creating_account')}
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={17}/>
                    {t('success_created')}
                  </>
                ) : (
                  <>{t('register_now')} <ArrowRight size={16}/></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"/>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">{t('already_have_account')}</span>
              </div>
            </div>

            {/* Login link */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 hover:border-[#FD6825]/40 hover:bg-[#FFF1E9] text-gray-700 hover:text-[#FD6825] font-bold rounded-2xl text-sm transition-all"
            >
              {t('login_to_account')} <ArrowRight size={15}/>
            </Link>
          </div>

          {/* Back link */}
          <p className="mt-5 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors">
              {t('back_to_main')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
