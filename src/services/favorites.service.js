import api from './api';

const favoritesService = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data?.data || response.data || [];
  },

  addFavorite: async (place) => {
    // Normalise fields to match backend requirements
    const payload = {
      name: place.name,
      category: place.category,
      address: place.address || '',
      lat: place.lat || 0.0,
      lng: place.lon || place.lng || 0.0,
      mapLink: place.mapLink || ''
    };

    const response = await api.post('/favorites', payload);
    return response.data?.data || response.data;
  },

  removeFavorite: async (placeId) => {
    const response = await api.delete(`/favorites/${placeId}`);
    return response.data;
  }
};

export default favoritesService;
