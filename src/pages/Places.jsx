import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, Navigation } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

export default function PlacesPage() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [searchParams, setSearchParams] = useState(null);

  const { data: places, isLoading, error } = useQuery({
    queryKey: ['places', searchParams],
    queryFn: async () => {
      if (!searchParams) return null;
      try {
        const response = await api.get(`/places/nearby?lat=${searchParams.lat}&lng=${searchParams.lng}`);
        return response.data;
      } catch (err) {
        console.warn("API failed, returning mock data", err);
        return [
          { id: 1, name: 'Campus Library', address: 'Main Building, 1st Floor', type: 'library', distance: '120m' },
          { id: 2, name: 'Student Center Cafe', address: 'Student Union, 2nd Floor', type: 'cafe', distance: '300m' },
          { id: 3, name: 'Engineering Hall', address: 'North Campus', type: 'academic', distance: '450m' },
          { id: 4, name: 'University Sports Complex', address: 'West Campus', type: 'sports', distance: '800m' }
        ];
      }
    },
    enabled: !!searchParams,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (lat && lng) {
      setSearchParams({ lat, lng });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
      }, (error) => {
        alert("Error getting location: " + error.message);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Nearby Places</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Discover campus facilities around your location</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Latitude</label>
            <input
              type="text"
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-6.200000"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
          
          <div className="flex-1 w-full space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Longitude</label>
            <input
              type="text"
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="106.816666"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="p-2.5 text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Get current location"
            >
              <Navigation className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/20">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Results</h2>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/50 dark:bg-black/10">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
            </div>
          ) : !places ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <MapPin className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-700" />
              <p>Enter coordinates and click search</p>
            </div>
          ) : places.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <p>No places found nearby.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={place.id}
                  className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">
                      {place.distance}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-1">
                    {place.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {place.address}
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-400 capitalize">
                      {place.type}
                    </span>
                    <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
