import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle, Trash2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  // Focus trap and accessibility
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  let Icon = HelpCircle;
  let iconBgColor = 'bg-gray-50';
  let iconColor = 'text-gray-500';
  let confirmBtnColor = 'bg-gray-900 hover:bg-gray-800 text-white';

  if (variant === 'danger') {
    Icon = Trash2;
    iconBgColor = 'bg-red-50';
    iconColor = 'text-red-600';
    confirmBtnColor = 'bg-red-600 hover:bg-red-700 text-white';
  } else if (variant === 'warning') {
    Icon = AlertCircle;
    iconBgColor = 'bg-amber-50';
    iconColor = 'text-amber-600';
    confirmBtnColor = 'bg-amber-500 hover:bg-amber-600 text-white';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
        />

        {/* Dialog card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="relative w-full max-w-md bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 z-10 flex flex-col gap-4 overflow-hidden"
        >
          {/* Header row with Icon & Close */}
          <div className="flex items-start justify-between gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", iconBgColor, iconColor)}>
              <Icon size={22} />
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 text-left">
            <h3 id="confirm-dialog-title" className="text-lg font-black text-gray-900 leading-snug">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-xs text-gray-400 font-medium leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer active:scale-98"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
                confirmBtnColor
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
