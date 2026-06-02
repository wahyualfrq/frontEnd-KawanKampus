/**
 * BrandLogo — reusable KawanKampus brand identity component.
 *
 * Props:
 *  variant   "full" | "mark"   — "full" = mark + wordmark, "mark" = icon only
 *  size      "xs" | "sm" | "md" | "lg" | "xl"
 *  dark      boolean            — use dark-mode safe version (e.g. in sidebar)
 *  className string             — extra Tailwind / CSS classes
 */
import logoMark from '../../assets/brand/kawan-kampus-mark.png';
import logoTextLight from '../../assets/brand/kawan-kampus-text.png';
import logoTextDark from '../../assets/brand/kawan-kampus-text-dark.png';

// Size config: [markSize, textSize (rem), gap (rem)]
const SIZE_CONFIG = {
  xs: { img: 24, text: '0.85rem', gap: '6px' },
  sm: { img: 32, text: '1.05rem', gap: '8px' },
  md: { img: 40, text: '1.3rem',  gap: '10px' },
  lg: { img: 52, text: '1.6rem',  gap: '12px' },
  xl: { img: 72, text: '2.2rem',  gap: '16px' },
};

export default function BrandLogo({
  variant   = 'full',
  size      = 'md',
  dark      = false,
  className = '',
}) {
  const cfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  /* ── Mark only ── */
  if (variant === 'mark') {
    return (
      <img
        src={logoMark}
        alt="KawanKampus"
        style={{
          display: 'block',
          flexShrink: 0,
          height: cfg.img,
          width: 'auto',
        }}
        draggable={false}
        className={className}
      />
    );
  }

  /* ── Full (mark + wordmark) ── */
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: cfg.gap }}
      aria-label="KawanKampus"
    >
      <img
        src={logoMark}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          display: 'block',
          flexShrink: 0,
          height: cfg.img,
          width: 'auto',
        }}
      />
      <img
        src={dark ? logoTextDark : logoTextLight}
        alt="KawanKampus"
        draggable={false}
        style={{
          display: 'block',
          flexShrink: 0,
          height: cfg.text,
          width: 'auto',
        }}
      />
    </div>
  );
}
