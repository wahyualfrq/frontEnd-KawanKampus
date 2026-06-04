import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Compact pagination component styled like the reference design:
 * - Large square rounded buttons
 * - White background, soft shadow
 * - Active page: dark charcoal (#111827) background, white text
 * - Prev/Next: chevron icons
 * - Ellipsis for large page counts
 * - Mobile-friendly (min 44px tap targets)
 */

function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    // Show all page numbers
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Compact mode with ellipsis
  const pages = [];
  const delta = 1; // pages to show around current

  // Always show first page
  pages.push(1);

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

  // Left ellipsis
  if (rangeStart > 2) pages.push('...');

  // Range around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (rangeEnd < totalPages - 1) pages.push('...');

  // Always show last page
  pages.push(totalPages);

  return pages;
}

export default function PlacesPagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  const btnBase =
    'flex items-center justify-center font-bold text-sm transition-all duration-200 select-none rounded-[16px] w-[52px] h-[52px] shrink-0 border';

  const btnActive =
    'bg-[#111827] text-white border-[#111827] shadow-lg shadow-[#111827]/20 scale-105';

  const btnInactive =
    'bg-white text-gray-600 border-gray-100 shadow-soft hover:border-gray-300 hover:text-gray-900 hover:shadow-md active:scale-95';

  const btnDisabled =
    'bg-white text-gray-300 border-gray-100 shadow-soft opacity-50 cursor-not-allowed';

  const btnNav =
    'bg-white text-gray-600 border-gray-100 shadow-soft hover:border-gray-300 hover:text-[#FD6825] hover:shadow-md active:scale-95';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-center flex-wrap gap-2 pt-4 pb-2"
    >
      {/* Previous */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className={cn(btnBase, currentPage === 1 ? btnDisabled : btnNav)}
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center w-[52px] h-[52px] text-gray-400 font-bold text-sm shrink-0"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(btnBase, page === currentPage ? btnActive : btnInactive)}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className={cn(btnBase, currentPage === totalPages ? btnDisabled : btnNav)}
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
