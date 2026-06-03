import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 z-[9999] flex flex-col gap-2.5 max-w-[90vw] sm:max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let Icon = Info;
            let iconColor = 'text-blue-500 bg-blue-50 border-blue-100/50';

            if (toast.type === 'success') {
              iconColor = 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
              Icon = CheckCircle2;
            } else if (toast.type === 'error') {
              iconColor = 'text-red-600 bg-red-50 border-red-100/50';
              Icon = AlertCircle;
            } else if (toast.type === 'warning') {
              iconColor = 'text-amber-600 bg-amber-50 border-amber-100/50';
              Icon = AlertCircle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="pointer-events-auto flex items-start gap-3 p-4.5 rounded-2xl bg-white border border-gray-100 shadow-md w-full"
              >
                <div className={`shrink-0 p-1.5 rounded-xl border flex items-center justify-center ${iconColor}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-800 leading-relaxed pt-0.5 text-left">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50 mt-0.5 cursor-pointer"
                  aria-label="Close notification"
                >
                  <X size={12} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
