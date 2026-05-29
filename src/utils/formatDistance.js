/**
 * Formats distance dynamically based on user distance preferences.
 * Accepts meters (number), raw texts (like "359 m", "1.2 km", or "📍 Jarak: 250 m"), and translates them.
 * Always handles null, undefined, or invalid inputs cleanly as "-".
 */
export function formatDistanceByPreference(value) {
  if (value == null || value === '') return '-';

  let meters = null;

  if (typeof value === 'number') {
    meters = isNaN(value) || !isFinite(value) ? null : value;
  } else if (typeof value === 'string') {
    const s = value.trim();
    // Match "km"
    const kmMatch = s.match(/(\d+[.,]?\d*)\s*km/i);
    if (kmMatch) {
      const n = parseFloat(kmMatch[1].replace(',', '.'));
      if (!isNaN(n)) meters = Math.round(n * 1000);
    } else {
      // Match "m"
      const mMatch = s.match(/(\d+[.,]?\d*)\s*m\b/i);
      if (mMatch) {
        const n = parseFloat(mMatch[1].replace(',', '.'));
        if (!isNaN(n)) meters = Math.round(n);
      } else {
        const n = parseFloat(s.replace(',', '.'));
        if (!isNaN(n)) meters = n;
      }
    }
  }

  if (meters === null || isNaN(meters)) {
    // If it's a string like "📍 Dekat" or something else not parsable as number, return it as-is
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return '-';
  }

  if (meters >= 1000) {
    const km = meters / 1000;
    if (km < 10) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km)} km`;
  }

  return `${Math.round(meters)} m`;
}
