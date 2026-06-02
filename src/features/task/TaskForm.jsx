import { useState, useEffect } from 'react';
import { X, Send, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';

const CATEGORIES = ['Akademik', 'Proyek', 'Organisasi', 'Pengembangan Diri', 'Lainnya'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES   = [
  { id: 'TODO',        label: 'To Do'       },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE',        label: 'Done'        },
];

const PRIORITY_COLORS = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
};

export default function TaskForm({ isOpen, onClose, onSubmit, initialStatus = 'TODO', editTask = null }) {
  const { t } = usePreferences();
  const isEditing = Boolean(editTask);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [status,      setStatus]      = useState(initialStatus);
  const [category,    setCategory]    = useState('Akademik');
  const [priority,    setPriority]    = useState('Medium');
  const [dueDate,     setDueDate]     = useState('');
  const [titleError,  setTitleError]  = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setStatus(editTask.status || 'TODO');
      setCategory(editTask.category || 'Akademik');
      setPriority(editTask.priority || 'Medium');
      // Format dueDate to datetime-local string if present
      if (editTask.dueDate) {
        const d = new Date(editTask.dueDate);
        const pad = (n) => String(n).padStart(2, '0');
        setDueDate(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        );
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setCategory('Akademik');
      setPriority('Medium');
      setDueDate('');
    }
    setTitleError('');
  }, [editTask, initialStatus, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setTitleError('Judul wajib diisi.'); return; }
    if (trimmed.length < 3) { setTitleError('Judul minimal 3 karakter.'); return; }

    const payload = {
      title:       trimmed,
      description: description.trim() || undefined,
      status,
      category,
      priority,
      dueDate:     dueDate ? new Date(dueDate).toISOString() : null,
    };

    onSubmit(payload, editTask?.id);
    onClose();
  };

  const handleClose = () => {
    setTitleError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isEditing ? 'bg-[#7C3AED]/10' : 'bg-[#FD6825]/10'}`}>
                  {isEditing ? <Pencil size={15} className="text-[#7C3AED]" /> : <Send size={15} className="text-[#FD6825]" />}
                </div>
                <h3 className="text-base font-black text-gray-900">
                  {isEditing ? 'Edit Tugas' : t('add_new_task') || 'Tambah Tugas'}
                </h3>
              </div>
              <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Judul Tugas <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
                  placeholder="Contoh: Kerjakan laporan praktikum"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none transition-all text-sm font-semibold text-gray-900 placeholder:font-normal
                    ${titleError ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825]'}`}
                />
                {titleError && <p className="text-xs text-red-500 font-medium">{titleError}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opsional — catatan tambahan..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825] outline-none transition-all text-sm font-medium text-gray-900 resize-none"
                />
              </div>

              {/* Category + Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-semibold text-gray-900 focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825] transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Prioritas</label>
                  <div className="flex gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          priority === p
                            ? PRIORITY_COLORS[p] + ' shadow-sm'
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        status === s.id
                          ? 'bg-[#FD6825] text-white border-[#FD6825] shadow-md shadow-[#FD6825]/20'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {s.id === 'TODO' ? (t('todo') || 'To Do') : s.id === 'IN_PROGRESS' ? (t('in_progress') || 'In Progress') : (t('done') || 'Done')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Deadline</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-medium text-gray-900 focus:ring-4 focus:ring-[#FD6825]/8 focus:border-[#FD6825] transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#FD6825] hover:bg-[#E85A1D] py-3.5 rounded-[16px] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#FD6825]/25 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
              >
                {isEditing ? <><Pencil size={16} /> Simpan Perubahan</> : <><Send size={16} /> {t('save_task') || 'Simpan Tugas'}</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
