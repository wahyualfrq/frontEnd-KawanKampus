/**
 * Formats dates and times globally based on preferred timezones.
 * Maps:
 * - WIB -> Asia/Jakarta
 * - WITA -> Asia/Makassar
 * - WIT -> Asia/Jayapura
 */
const TIMEZONE_MAP = {
  WIB: 'Asia/Jakarta',
  WITA: 'Asia/Makassar',
  WIT: 'Asia/Jayapura',
};

export function formatDateTimeByPreference(dateInput, tz = 'WIB', options = {}) {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';

    const timeZone = TIMEZONE_MAP[tz] || 'Asia/Jakarta';

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
      ...options,
    };

    const formatted = new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
    
    // Append timezone label if formatting includes time
    if (defaultOptions.hour !== undefined || defaultOptions.minute !== undefined) {
      return `${formatted} ${tz}`;
    }
    
    return formatted;
  } catch (e) {
    console.error('[formatDateTimeByPreference Error]', e);
    return String(dateInput);
  }
}

export function formatTimeByPreference(dateInput, tz = 'WIB') {
  return formatDateTimeByPreference(dateInput, tz, {
    hour: '2-digit',
    minute: '2-digit',
    year: undefined,
    month: undefined,
    day: undefined,
  });
}
