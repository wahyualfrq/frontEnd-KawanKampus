import { createContext, useContext, useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import settingsService from '../services/settings.service';
import { translations } from '../i18n/translations';
import { formatDistanceByPreference } from '../utils/formatDistance';
import { formatDateTimeByPreference, formatTimeByPreference } from '../utils/formatDateTime';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const { isAuthenticated } = useAuthStore();

  const [preferences, setPreferences] = useState(() => {
    const local = localStorage.getItem('preferences');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    return {
      theme: localStorage.getItem('theme') || 'light',
      language: 'id',
      distanceUnit: 'meter',
      timezone: 'WIB',
      emailNotifications: true,
      pushNotifications: true,
      chatbotHistoryEnabled: true,
      locationAccessEnabled: true,
      privacyMode: false,
    };
  });

  const loadPreferences = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await settingsService.getPreferences();
      const newPrefs = {
        theme: data.theme || 'light',
        language: data.language || 'id',
        distanceUnit: data.distanceUnit || 'meter',
        timezone: data.timezone || 'WIB',
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
        chatbotHistoryEnabled: data.chatbotHistoryEnabled ?? true,
        locationAccessEnabled: data.locationAccessEnabled ?? true,
        privacyMode: data.privacyMode ?? false,
      };
      setPreferences(newPrefs);
      localStorage.setItem('preferences', JSON.stringify(newPrefs));
      localStorage.setItem('theme', newPrefs.theme);
      applyTheme(newPrefs.theme);
    } catch (e) {
      console.warn('[PreferencesContext] Failed to load preferences from backend, using cache.', e.message);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [isAuthenticated]);

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  // Listen to system theme changes in real time if theme is system
  useEffect(() => {
    if (preferences.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preferences.theme]);

  const updatePreference = async (field, value) => {
    const nextPrefs = { ...preferences, [field]: value };
    setPreferences(nextPrefs);
    localStorage.setItem('preferences', JSON.stringify(nextPrefs));
    
    if (field === 'theme') {
      localStorage.setItem('theme', value);
      applyTheme(value);
    }

    if (isAuthenticated) {
      try {
        await settingsService.updatePreferences({ [field]: value });
      } catch (e) {
        console.warn('[PreferencesContext] Failed to sync preference to backend:', e.message);
      }
    }
  };

  const t = (key, interpolations = {}) => {
    const lang = preferences.language || 'id';
    let text = translations[lang]?.[key] || translations['id']?.[key] || key;
    Object.entries(interpolations).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const formatDistance = (meters, textFallback) => {
    return formatDistanceByPreference(meters !== null && meters !== undefined ? meters : textFallback);
  };

  const formatDateTime = (date) => {
    return formatDateTimeByPreference(date, preferences.timezone);
  };

  const formatTime = (date) => {
    return formatTimeByPreference(date, preferences.timezone);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        t,
        formatDistance,
        formatDateTime,
        formatTime,
        loadPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
