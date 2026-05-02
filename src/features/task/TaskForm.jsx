import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskForm({ isOpen, onClose, onSubmit, initialStatus = 'TODO' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, status });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[24px] shadow-medium border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Tambah Tugas Baru</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Judul Tugas</label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Riset topik tugas akhir"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambahkan detail tugas..."
                  rows={3}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      status === s 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover py-4 rounded-[16px] text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                <Send size={18} />
                Simpan Tugas
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
