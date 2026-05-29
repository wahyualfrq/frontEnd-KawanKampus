import { useState, useEffect, useRef } from 'react';
import {
  User, Settings, Bell, Shield, Lock, Globe, Info, HelpCircle,
  Camera, ChevronDown, Clock, Eye, EyeOff, AlertCircle, Check, Loader2, Edit2
} from 'lucide-react';
import { cn } from '../utils/cn';
import useAuthStore from '../store/authStore';
import settingsService from '../services/settings.service';
import { usePreferences } from '../context/PreferencesContext';

export default function SettingsPage() {
  const { user, login, logout } = useAuthStore();
  const fileInputRef = useRef(null);
  const { preferences, updatePreference, t, formatDateTime } = usePreferences();

  // Dynamic Menu defined inside the component to respond instantly to language updates
  const MENU = [
    { id: 'profile',    label: t('profile_title'),    desc: t('profile_desc'),      icon: User },
    { id: 'preference', label: t('preferences_title'), desc: t('preferences_desc'),  icon: Settings },
    { id: 'notif',      label: t('notif_title'),      desc: t('notif_desc'),        icon: Bell },
    { id: 'security',   label: t('security_title'),   desc: t('security_desc'),     icon: Shield },
    { id: 'privacy',    label: t('privacy_title'),    desc: t('privacy_desc'),      icon: Lock },
    { id: 'language',   label: t('language_title'),   desc: t('language_desc'),     icon: Globe },
    { id: 'about',      label: t('about_title'),      desc: t('about_desc'),        icon: Info },
    { id: 'help',       label: t('help_title'),       desc: t('help_desc'),         icon: HelpCircle },
  ];

  // States
  const [activeMenu, setActiveMenu] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form States
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    university: '',
    faculty: '',
    cohortYear: '',
    gender: '',
    bio: '',
    avatarUrl: ''
  });

  // Photo preview temp state
  const [photoPreview, setPhotoPreview] = useState(null);

  // Password Change States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Account Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  // Real-time Clock for Timezone preview
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial settings from backend
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const prof = await settingsService.getProfile();
      setProfileForm({
        name: prof.name || '',
        phone: prof.phone || '',
        university: prof.university || '',
        faculty: prof.faculty || '',
        cohortYear: prof.cohortYear || '',
        gender: prof.gender || '',
        bio: prof.bio || '',
        avatarUrl: prof.avatarUrl || ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToast = (success, message) => {
    if (success) {
      setSuccessMsg(message);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(message);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      
      const payload = { ...profileForm };
      if (photoPreview) {
        payload.avatarUrl = photoPreview; // Send base64 data URL
      }

      const updated = await settingsService.updateProfile(payload);
      
      // Update store
      login({ ...user, name: updated.name, avatarUrl: updated.avatarUrl }, useAuthStore.getState().token);
      
      setProfileForm({
        name: updated.name || '',
        phone: updated.phone || '',
        university: updated.university || '',
        faculty: updated.faculty || '',
        cohortYear: updated.cohortYear || '',
        gender: updated.gender || '',
        bio: updated.bio || '',
        avatarUrl: updated.avatarUrl || ''
      });
      setPhotoPreview(null);
      setIsEditMode(false);
      handleToast(true, t('success') || 'Profil Anda berhasil diperbarui.');
    } catch (err) {
      handleToast(false, err.response?.data?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 1MB)
    if (file.size > 1024 * 1024) {
      handleToast(false, 'Ukuran file foto maksimal adalah 1 MB.');
      return;
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      handleToast(false, 'Hanya menerima file gambar JPG, PNG, atau WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      if (!isEditMode) {
        setIsEditMode(true); // Auto trigger edit mode
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      const updated = await settingsService.updateProfile({ avatarUrl: '' });
      login({ ...user, avatarUrl: '' }, useAuthStore.getState().token);
      setProfileForm(prev => ({ ...prev, avatarUrl: '' }));
      setPhotoPreview(null);
      handleToast(true, t('success') || 'Foto profil berhasil dihapus.');
    } catch (err) {
      handleToast(false, t('failed'));
    } finally {
      setLoading(false);
    }
  };

  // Centralized Preference Update Helper with immediate save & success toast
  const handlePreferenceUpdate = async (field, value) => {
    try {
      await updatePreference(field, value);
      handleToast(true, t('success') || 'Preferensi berhasil diperbarui.');
    } catch (err) {
      handleToast(false, t('failed'));
    }
  };

  // Notifications Toggle
  const handleNotificationToggle = async (field, value) => {
    if (field === 'pushNotifications' && value) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          handleToast(false, 'Akses notifikasi browser ditolak.');
          return;
        }
      }
    }
    await handlePreferenceUpdate(field, value);
  };

  // Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      handleToast(false, 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    try {
      setLoading(true);
      await settingsService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      handleToast(true, t('success') || 'Kata sandi Anda berhasil diubah.');
    } catch (err) {
      handleToast(false, err.response?.data?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  };

  // Clear Activity logs
  const handleClearHistory = async () => {
    if (!window.confirm(t('confirm') || 'Apakah Anda yakin ingin menghapus seluruh riwayat tempat dan obrolan AI?')) return;
    try {
      setLoading(true);
      await settingsService.clearHistory();
      handleToast(true, t('success') || 'Semua riwayat obrolan AI dan tempat berhasil dibersihkan.');
    } catch (err) {
      handleToast(false, t('failed'));
    } finally {
      setLoading(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteConfirmPassword) return;
    try {
      setLoading(true);
      await settingsService.deleteAccount({ password: deleteConfirmPassword });
      setIsDeleteModalOpen(false);
      logout();
    } catch (err) {
      handleToast(false, err.response?.data?.message || t('failed'));
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 p-6">
      
      {/* Title */}
      <div className="mb-6 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings')}</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">{t('settings_desc')}</p>
        </div>
        {loading && <Loader2 className="animate-spin text-[#FD6825] mt-2" size={24}/>}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100 mb-6 transition-all duration-200">
          <Check size={16}/> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 mb-6 transition-all duration-200">
          <AlertCircle size={16}/> {errorMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

        {/* ── Left menu sidebar ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft overflow-hidden">
            {MENU.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 last:border-b-0',
                    isActive ? 'bg-[#FFF8EC] text-[#111827]' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                      isActive ? 'bg-[#FDC439]/30 text-[#FD6825]' : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <item.icon size={16}/>
                  </div>
                  <div>
                    <div className={cn('text-sm font-bold leading-tight', isActive ? 'text-gray-900' : 'text-gray-700')}>
                      {item.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right Content Panel ── */}
        <div className="lg:col-span-9 space-y-6">

          {/* SECTION 1: Profile */}
          {activeMenu === 'profile' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-7">
              <div className="flex items-center justify-between border-b border-gray-50 pb-5">
                <h2 className="text-lg font-bold text-gray-900">{t('profile_title')}</h2>
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="text-xs font-bold text-[#FD6825] border border-[#FD6825]/40 px-4 py-2 rounded-xl hover:bg-[#FFF1E9] transition-all flex items-center gap-1.5"
                  >
                    <Edit2 size={13}/> {t('edit_profile')}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setPhotoPreview(null);
                        loadData(); // Reload existing from DB
                      }}
                      className="text-xs font-bold text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleProfileSave}
                      className="text-xs font-bold bg-[#FD6825] text-white px-4 py-2 rounded-xl hover:bg-[#E85A1D] transition-all shadow-md shadow-[#FD6825]/20"
                    >
                      {t('save')}
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Upload row */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-medium flex items-center justify-center font-black text-xl text-gray-600">
                    {photoPreview || profileForm.avatarUrl ? (
                      <img
                        src={photoPreview || profileForm.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      getInitials(profileForm.name || user?.name)
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#FD6825] rounded-full flex items-center justify-center shadow-md hover:bg-[#E85A1D] transition-all border-2 border-white text-white"
                  >
                    <Camera size={12}/>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-gray-800">{t('profile_photo')}</p>
                  <p className="text-xs text-gray-400">{t('photo_max_size')}</p>
                  {(photoPreview || profileForm.avatarUrl) && (
                    <button
                      onClick={handleRemovePhoto}
                      className="text-[11px] font-bold text-red-500 hover:underline"
                    >
                      {t('delete_photo')}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Inputs Form */}
              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('full_name')}</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    readOnly={!isEditMode}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('email_address')}</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-400 border-gray-100 text-sm font-medium outline-none cursor-default"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('phone_number')}</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    readOnly={!isEditMode}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('university')}</label>
                  <input
                    type="text"
                    value={profileForm.university}
                    onChange={e => setProfileForm(p => ({ ...p, university: e.target.value }))}
                    readOnly={!isEditMode}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('faculty')}</label>
                  <input
                    type="text"
                    value={profileForm.faculty}
                    onChange={e => setProfileForm(p => ({ ...p, faculty: e.target.value }))}
                    readOnly={!isEditMode}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('cohort_year')}</label>
                  <input
                    type="text"
                    value={profileForm.cohortYear}
                    onChange={e => setProfileForm(p => ({ ...p, cohortYear: e.target.value }))}
                    readOnly={!isEditMode}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('gender')}</label>
                  {isEditMode ? (
                    <div className="relative">
                      <select
                        value={profileForm.gender}
                        onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:border-[#FD6825] outline-none cursor-pointer"
                      >
                        <option value="">Pilih...</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={profileForm.gender || '-'}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-500 border-gray-100 text-sm font-medium outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('role')}</label>
                  <input
                    type="text"
                    value={t('mahasiswa')}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-400 border-gray-100 text-sm font-medium outline-none cursor-default"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('bio')}</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value.substring(0, 160) }))}
                    readOnly={!isEditMode}
                    rows={3}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none resize-none transition-all',
                      !isEditMode ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white text-gray-800 border-gray-200 focus:border-[#FD6825]'
                    )}
                  />
                  {isEditMode && (
                    <p className="text-right text-[10px] text-gray-400 font-bold">{profileForm.bio.length} / 160</p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: Preferences */}
          {activeMenu === 'preference' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('preference_section_title')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('app_theme')}</label>
                  <div className="relative">
                    <select
                      value={preferences.theme}
                      onChange={e => handlePreferenceUpdate('theme', e.target.value)}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:border-[#FD6825] outline-none cursor-pointer"
                    >
                      <option value="light">{t('light')}</option>
                      <option value="dark">{t('dark')}</option>
                      <option value="system">{t('system')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('timezone')}</label>
                  <div className="relative">
                    <select
                      value={preferences.timezone}
                      onChange={e => handlePreferenceUpdate('timezone', e.target.value)}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:border-[#FD6825] outline-none cursor-pointer"
                    >
                      <option value="WIB">WIB (GMT+7)</option>
                      <option value="WITA">WITA (GMT+8)</option>
                      <option value="WIT">WIT (GMT+9)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-xs text-gray-400 font-bold mt-1.5 flex items-center gap-1.5">
                    <Clock size={12}/> {t('active_time')}: {formatDateTime(currentTime)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('primary_language')}</label>
                  <div className="relative">
                    <select
                      value={preferences.language}
                      onChange={e => handlePreferenceUpdate('language', e.target.value)}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:border-[#FD6825] outline-none cursor-pointer"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English (US)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Notifications */}
          {activeMenu === 'notif' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('notification_section_title')}</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{t('email_notifications')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('email_notifications_desc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={e => handleNotificationToggle('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-[#FD6825] focus:ring-[#FD6825] border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{t('push_notifications')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('push_notifications_desc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={e => handleNotificationToggle('pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-[#FD6825] focus:ring-[#FD6825] border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Security */}
          {activeMenu === 'security' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('change_password')}</h2>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('current_password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#FD6825]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('new_password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#FD6825]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('confirm_new_password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#FD6825]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#FD6825] hover:bg-[#E85A1D] px-6 py-3 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-[#FD6825]/25 transition-all hover:scale-105 active:scale-95"
                >
                  {t('change_password')}
                </button>
              </form>
            </div>
          )}

          {/* SECTION 5: Privacy */}
          {activeMenu === 'privacy' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('privacy_section_title')}</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{t('save_chatbot_history')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('save_chatbot_history_desc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.chatbotHistoryEnabled}
                    onChange={e => handlePreferenceUpdate('chatbotHistoryEnabled', e.target.checked)}
                    className="w-4 h-4 text-[#FD6825] focus:ring-[#FD6825] border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{t('location_access')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('location_access_desc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.locationAccessEnabled}
                    onChange={e => handlePreferenceUpdate('locationAccessEnabled', e.target.checked)}
                    className="w-4 h-4 text-[#FD6825] focus:ring-[#FD6825] border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{t('anonymous_mode')}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t('anonymous_mode_desc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.privacyMode}
                    onChange={e => handlePreferenceUpdate('privacyMode', e.target.checked)}
                    className="w-4 h-4 text-[#FD6825] focus:ring-[#FD6825] border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div className="border-t border-gray-50 pt-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">{t('clear_history_title')}</h4>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    {t('clear_history_desc')}
                  </p>
                  <button
                    onClick={handleClearHistory}
                    className="px-5 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold transition-all"
                  >
                    {t('clear_history_button')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Language */}
          {activeMenu === 'language' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('language_title')}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('language_desc')}
              </p>
              <div className="relative max-w-xs">
                <select
                  value={preferences.language}
                  onChange={e => handlePreferenceUpdate('language', e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:border-[#FD6825] outline-none cursor-pointer"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English (US)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* SECTION 7: About */}
          {activeMenu === 'about' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('about_title')}</h2>
              <div className="space-y-3.5 text-sm text-gray-600 leading-relaxed">
                <p>
                  {t('about_text')}
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1 text-xs">
                  <div><strong>Application Name:</strong> KawanKampus</div>
                  <div><strong>Version:</strong> MVP 1.0</div>
                  <div><strong>Capstone Project:</strong> Coding Camp 2026 Powered by DBS Foundation</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: Help */}
          {activeMenu === 'help' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">{t('help_title')}</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-800">1. Bagaimana cara memakai Peta Rekomendasi?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Masuk ke halaman Peta, pilih Kampus kamu pada dropdown di pojok kiri atas, aktifkan geolokasi atau gunakan mode demo untuk mencari tempat fotokopi, warteg, atau cafe di dekatmu.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-800">2. Bagaimana cara menyimpan tempat favorit?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Klik tombol bookmark berlogo pita kecil ("Simpan") di kartu lokasi atau panel detail halaman Peta. Lokasi yang disimpan akan langsung sinkron ke halaman Favorit.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-800">3. Ke mana saya bisa menghubungi jika ada kendala sistem?</h4>
                  <p className="text-xs text-gray-500">
                    Kirimkan laporan email kamu melalui: <a href="mailto:support@kawankampus.local" className="text-[#3B82F6] hover:underline font-bold">support@kawankampus.local</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Danger Zone ── */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-soft p-7">
            <h2 className="text-lg font-bold text-red-500 mb-5">{t('danger_zone')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 flex-wrap gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-800">{t('logout_title')}</p>
                  <p className="text-xs text-gray-400">{t('logout_desc')}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-xs font-bold text-red-500 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all shrink-0"
                >
                  {t('logout_button')}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 flex-wrap gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-800">{t('delete_account_title')}</p>
                  <p className="text-xs text-gray-400">{t('delete_account_desc')}</p>
                </div>
                <button
                  onClick={() => {
                    setDeleteConfirmPassword('');
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-xs font-bold text-white bg-red-500 border border-red-500 px-5 py-2.5 rounded-xl hover:bg-red-600 transition-all shrink-0 shadow-sm"
                >
                  {t('delete_account_button')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-medium">
            <h3 className="text-lg font-bold text-gray-900">{t('confirm')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Masukkan kata sandi akun Anda untuk mengonfirmasi penghapusan permanen seluruh data Anda.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                value={deleteConfirmPassword}
                onChange={e => setDeleteConfirmPassword(e.target.value)}
                required
                placeholder="Kata sandi..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!deleteConfirmPassword}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-40"
                >
                  {t('delete')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
