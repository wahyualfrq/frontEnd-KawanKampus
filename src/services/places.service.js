import api from './api';

// ── Distance helpers ─────────────────────────────────────────────────────────

/**
 * Parse any distance representation → metres (number) | null.
 * Handles: 120 | "120" | "120 m" | "1.2 km" | "📍 Jarak: 120 m" | "1,2 km"
 * NEVER calls Math.round on undefined/null/NaN.
 */
export function parseDistanceToMeters(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    return (!isFinite(value) || isNaN(value)) ? null : value;
  }
  if (typeof value === 'string') {
    const s = value.trim();
    const kmMatch = s.match(/(\d+[.,]?\d*)\s*km/i);
    if (kmMatch) {
      const n = parseFloat(kmMatch[1].replace(',', '.'));
      return isNaN(n) ? null : Math.round(n * 1000);
    }
    const mMatch = s.match(/(\d+[.,]?\d*)\s*m\b/i);
    if (mMatch) {
      const n = parseFloat(mMatch[1].replace(',', '.'));
      return isNaN(n) ? null : Math.round(n);
    }
    const n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  return null;
}

/** Format metres → "120 m" / "1.2 km". Returns "-" on invalid input. */
export function formatDistance(meters) {
  if (meters == null || typeof meters !== 'number' || isNaN(meters)) return '-';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

/**
 * Normalise a raw AI/backend place object into the standard frontend shape.
 * All known field-name variants from the real CSV are handled.
 * distanceText is GUARANTEED to never be "NaN m".
 */
export function normalizePlace(item, idx = 0, fallbackCategory = '') {
  if (!item || typeof item !== 'object') {
    return {
      id: String(idx + 1), rank: idx + 1,
      name: `Tempat ${idx + 1}`, category: fallbackCategory,
      distanceMeters: null, distanceText: '-',
      address: '', description: '', mapLink: '', rating: null, reviews: null, lat: null, lon: null,
    };
  }

  const name     = item.name     || item.Nama_Tempat || item.nama || item.Nama || `Tempat ${idx + 1}`;
  const category = item.category || item.Kategori_Awal || item.kategori || item.Kategori || fallbackCategory || '';
  const mapLink  = item.mapLink  || item.Google_Maps_Link || item.map_link || item.googleMapsUrl || item.google_maps_url || item.maps_url || item.url || item.link || '';

  // Parse coordinates if they are provided, otherwise extract from mapLink query
  let lat = item.lat || item.Latitude  || item.latitude  || null;
  let lon = item.lon || item.Longitude || item.lng       || item.longitude || null;

  let parsedLat = lat !== null ? parseFloat(lat) : null;
  let parsedLon = lon !== null ? parseFloat(lon) : null;

  if ((parsedLat === null || parsedLon === null || isNaN(parsedLat) || isNaN(parsedLon)) && mapLink) {
    const coordsMatch = mapLink.match(/(?:query|q|search\/|@)(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i) ||
                        mapLink.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordsMatch) {
      const latVal = parseFloat(coordsMatch[1]);
      const lonVal = parseFloat(coordsMatch[2]);
      if (!isNaN(latVal) && !isNaN(lonVal)) {
        parsedLat = latVal;
        parsedLon = lonVal;
      }
    }
  }

  const address  = item.address  || item.alamat || item.Alamat || '';
  const description = item.description || item.deskripsi || item.Deskripsi || item.Tags || '';

  // Distance — Jarak_KM is km in the CSV (handle it first)
  let distanceMeters = null;
  if (item.distanceMeters != null) {
    distanceMeters = parseDistanceToMeters(item.distanceMeters); // already normalised by backend
  } else if (item.Jarak_KM != null) {
    const km = parseFloat(item.Jarak_KM);
    distanceMeters = isNaN(km) ? null : Math.round(km * 1000);
  } else {
    const raw =
      item.distance_m ?? item.distance_meter ?? item.distance ??
      item.jarak      ?? item.Jarak          ?? item.distance_km ??
      item.Jarak_km   ?? item.distanceText   ?? null;
    distanceMeters = parseDistanceToMeters(raw);
    // If field is a km field and value looks like km (<50), convert
    const isKmField = ['distance_km', 'Jarak_km'].some(k => item[k] != null);
    if (isKmField && typeof raw === 'number' && raw < 50) {
      distanceMeters = Math.round(raw * 1000);
    }
  }

  const rawRating = item.rating ?? item.Rating;
  const rawReviews = item.reviews ?? item.Total_Reviews ?? item.total_reviews ?? item.reviewCount;
  const reviews = rawReviews != null && !isNaN(parseInt(rawReviews, 10)) ? parseInt(rawReviews, 10) : null;

  return {
    id:            item.id || item.rank?.toString() || String(idx + 1),
    rank:          item.rank || idx + 1,
    name,
    category,
    distanceMeters,
    distanceText:  formatDistance(distanceMeters),   // ← never "NaN m"
    address,
    description,
    mapLink,
    rating:        rawRating != null && !isNaN(parseFloat(rawRating)) ? parseFloat(rawRating) : null,
    reviews,
    lat:           parsedLat && !isNaN(parsedLat) ? parsedLat : null,
    lon:           parsedLon && !isNaN(parsedLon) ? parsedLon : null,
    googleCategory: item.googleCategory || null,
    trustScore: item.trustScore || null,
    tags: item.tags || null,
    popularityCategory: item.popularityCategory || null,
    distanceCategory: item.distanceCategory || null,
    recommendationScore: item.recommendationScore || null,
  };
}

// ── Fallback config (mirrors backend FALLBACK_CONFIG) ────────────────────────
const _LAINNYA = [
  'Apotek', 'Kedai', 'Kedai Kopi', 'Minimarket', 'Perhentian Bus',
  'Pizza', 'Restoran', 'Restoran Padang', 'Tempat Fitness',
  'Toko Es Krim', 'Warteg',
];

export const FALLBACK_CONFIG = {
  source: 'frontend-fallback',
  campuses: [
    { name: 'Universitas Gadjah Mada',                         lat: -7.7733153,  lon: 110.3892489  },
    { name: 'Universitas Airlangga - B',                        lat: -7.2729075,  lon: 112.7560403  },
    { name: 'Universitas Bina Nusantara @Anggrek',              lat: -6.1950023,  lon: 106.7764187  },
    { name: 'Universitas Institut Teknologi Bandung - Ganesha', lat: -6.8950712,  lon: 107.6099105  },
    { name: 'Universitas Brawijaya',                            lat: -7.9508146,  lon: 112.6132311  },
    { name: 'STMIK IKMI CIREBON',                               lat: -6.7357684,  lon: 108.5397939  },
    { name: 'UNIVERSITAS MULTI DATA PALEMBANG',                 lat: -2.9737715,  lon: 104.75612    },
    { name: 'Universitas Indonesia',                             lat: -6.3689479,  lon: 106.8300839  },
    { name: 'Universitas Pendidikan Indonesia Bandung',          lat: -6.8817098,  lon: 107.5954963  },
  ],
  // Flat list of all Lainnya sub-categories shown in the dropdown
  lainnyaCategories: _LAINNYA,
  // Maps display group → raw Kategori_Awal values (for reference)
  categoryGroups: {
    Fotokopi: ['Fotokopi', 'Fotokopi.Csv', 'Fotocopy.Csv', 'Print', 'Print.Csv'],
    Makanan:  ['Makanan', 'Makanan.Csv', 'Makanan Siap Saji', 'Makanan Siap Saji.Csv',
               'Restoran', 'Restoran.Csv', 'Restoran Padang', 'Restoran Padang.Csv',
               'Restaurant.Csv', 'Pizza', 'Pizza.Csv', 'Warteg', 'Warteg.Csv'],
    Minuman:  ['Cafe', 'Cafe.Csv', 'Kedai Kopi', 'Kedai', 'Kedai.Csv',
               'Toko Es Krim', 'Toko Es Krim.Csv', 'Toko Eskrim.Csv'],
    ATK:      ['Print', 'Print.Csv', 'Fotokopi', 'Fotokopi.Csv'],
    Lainnya:  _LAINNYA,
  },
  // Primary API value sent to Flask AI per chip
  categoryApiValue: {
    fotokopi: 'Fotokopi',
    makanan:  'Makanan',
    minuman:  'Cafe',
    atk:      'Print',
    all:      'Semua',
  },
  // Campus name → coordinates for demo mode
  campusCenters: {
    'Universitas Gadjah Mada':                         { lat: -7.7733153,  lon: 110.3892489  },
    'Universitas Airlangga - B':                        { lat: -7.2729075,  lon: 112.7560403  },
    'Universitas Bina Nusantara @Anggrek':              { lat: -6.1950023,  lon: 106.7764187  },
    'Universitas Institut Teknologi Bandung - Ganesha': { lat: -6.8950712,  lon: 107.6099105  },
    'Universitas Brawijaya':                            { lat: -7.9508146,  lon: 112.6132311  },
    'STMIK IKMI CIREBON':                               { lat: -6.7357684,  lon: 108.5397939  },
    'UNIVERSITAS MULTI DATA PALEMBANG':                 { lat: -2.9737715,  lon: 104.75612    },
    'Universitas Indonesia':                             { lat: -6.3689479,  lon: 106.8300839  },
    'Universitas Pendidikan Indonesia Bandung':          { lat: -6.8817098,  lon: 107.5954963  },
  },
};

// ── Service ──────────────────────────────────────────────────────────────────

const placesService = {
  /**
   * GET /places/config — public endpoint.
   * Tries the backend first; if unavailable falls back to FALLBACK_CONFIG.
   * Called by Places.jsx as getPlacesConfig().
   */
  getPlacesConfig: async () => {
    try {
      const response = await api.get('/places/config');
      const data = response.data?.data || response.data;
      if (data && Array.isArray(data.campuses)) {
        // Merge backend data with frontend fallback for any missing fields
        return {
          ...FALLBACK_CONFIG,
          ...data,
          campusCenters: data.campusCenters || FALLBACK_CONFIG.campusCenters,
          lainnyaCategories: data.lainnyaCategories || FALLBACK_CONFIG.lainnyaCategories,
        };
      }
      return FALLBACK_CONFIG;
    } catch {
      return FALLBACK_CONFIG;
    }
  },

  /** Alias for backwards compatibility */
  getConfig: async function() { return this.getPlacesConfig(); },

  /**
   * POST /places/recommend
   * selected_cat must be a valid Kategori_Awal value (e.g. "Fotokopi", "Makanan", "Cafe").
   * Returns { recommendations, totalBeforeLimit, returnedCount, fetchLimit }.
   * distanceText is NEVER "NaN m".
   */
  getRecommendations: async ({ selected_uni, selected_cat, lat, lon, session_id, actual_category }) => {
    const response = await api.post('/places/recommend', {
      selected_uni,
      selected_cat,
      lat,
      lon,
      ...(session_id     && { session_id }),
      ...(actual_category && { actual_category }),
    });

    const resData = response.data;

    // Service not configured
    if (resData && resData.success === false && resData.code === 'PLACE_RECOMMENDER_NOT_CONFIGURED') {
      return resData;
    }
    if (resData && resData.data && resData.data.success === false && resData.data.code === 'PLACE_RECOMMENDER_NOT_CONFIGURED') {
      return resData.data;
    }

    // Extract recommendations array from any shape the backend returns
    let list = [];
    let totalBeforeLimit = null;
    let returnedCount = null;
    let fetchLimit = null;

    if (resData) {
      // Try to extract metadata from backend response
      const innerData = resData.data || resData;
      if (typeof innerData === 'object' && !Array.isArray(innerData)) {
        totalBeforeLimit = innerData.totalBeforeLimit ?? resData.totalBeforeLimit ?? null;
        returnedCount    = innerData.returnedCount    ?? resData.returnedCount    ?? null;
        fetchLimit       = innerData.fetchLimit       ?? resData.fetchLimit       ?? null;
      }

      if (resData.data && Array.isArray(resData.data.recommendations)) {
        list = resData.data.recommendations;
      } else if (Array.isArray(resData.recommendations)) {
        list = resData.recommendations;
      } else if (resData.data && Array.isArray(resData.data)) {
        list = resData.data;
      } else if (Array.isArray(resData)) {
        list = resData;
      } else if (resData.data && resData.data.data && Array.isArray(resData.data.data.recommendations)) {
        list = resData.data.data.recommendations;
      } else if (resData.data && resData.data.data && Array.isArray(resData.data.data.results)) {
        list = resData.data.data.results;
      } else if (resData.data && Array.isArray(resData.data.results)) {
        list = resData.data.results;
      } else if (Array.isArray(resData.results)) {
        list = resData.results;
      }
    }

    // Client-side normalisation as a second safety net (never NaN distanceText)
    const recommendations = list.map((item, idx) => {
      const normalized = normalizePlace(item, idx, selected_cat);
      // Preserve rawCategory for search filtering
      normalized.rawCategory = item.Kategori_Awal || item.kategori || item.category || selected_cat || '';
      return normalized;
    });

    return {
      recommendations,
      totalBeforeLimit: totalBeforeLimit ?? recommendations.length,
      returnedCount:    returnedCount    ?? recommendations.length,
      fetchLimit:       fetchLimit       ?? recommendations.length,
    };
  },

  /**
   * GET /places/nearby — existing endpoint (kept for backward compat)
   */
  getNearby: async ({ lat, lng, category }) => {
    const response = await api.get('/places/nearby', { params: { lat, lng, category } });
    return response.data.data || response.data;
  },
};

export default placesService;
