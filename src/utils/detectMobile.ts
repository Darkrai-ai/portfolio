/**
 * Mobile / touch device detection utilities.
 */

export function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  const isNarrow = window.innerWidth < 768;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  return isNarrow || isCoarsePointer;
}

export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
