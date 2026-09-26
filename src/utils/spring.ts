/**
 * Simple lerp / spring utilities for smooth cursor tracking
 * and animation interpolation.
 */

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Damped spring interpolation — returns new position */
export function dampedSpring(
  current: number,
  target: number,
  damping: number = 0.08
): number {
  return current + (target - current) * damping;
}

/** 2D position spring */
export function dampedSpring2D(
  current: { x: number; y: number },
  target: { x: number; y: number },
  damping: number = 0.08
): { x: number; y: number } {
  return {
    x: dampedSpring(current.x, target.x, damping),
    y: dampedSpring(current.y, target.y, damping),
  };
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}
