/**
 * Core scramble-text algorithm.
 * Each character slot cycles through random chars and probabilistically
 * locks to its final value as progress increases.
 */

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>[]{}';

export interface ScrambleState {
  /** The target text to resolve to */
  target: string;
  /** Per-character lock state: true = locked to final char */
  locked: boolean[];
  /** The currently displayed text */
  display: string;
  /** Random order in which characters will lock */
  lockOrder: number[];
}

export function createScrambleState(target: string): ScrambleState {
  const indices = Array.from({ length: target.length }, (_, i) => i);
  // Shuffle for random lock order
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    target,
    locked: new Array(target.length).fill(false),
    display: target
      .split('')
      .map((ch) => (ch === ' ' || ch === '•' ? ch : randomChar()))
      .join(''),
    lockOrder: indices,
  };
}

export function randomChar(charset: string = DEFAULT_CHARSET): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

/**
 * Update the scramble state given a progress value (0 to 1).
 * Returns a new display string.
 */
export function updateScramble(
  state: ScrambleState,
  progress: number,
  charset: string = DEFAULT_CHARSET
): string {
  const { target, locked, lockOrder } = state;
  // How many chars should be locked at this progress
  const numToLock = Math.floor(progress * target.length);

  // Lock characters in the predetermined random order
  for (let i = 0; i < numToLock && i < lockOrder.length; i++) {
    locked[lockOrder[i]] = true;
  }

  // Build display string
  const chars: string[] = [];
  for (let i = 0; i < target.length; i++) {
    if (target[i] === ' ' || target[i] === '•') {
      chars.push(target[i]);
    } else if (locked[i]) {
      chars.push(target[i]);
    } else {
      chars.push(randomChar(charset));
    }
  }

  const display = chars.join('');
  state.display = display;
  return display;
}

/**
 * For perpetual scramble (HUD readout): generates a display that's always
 * partially scrambled, never fully resolving.
 */
export function perpetualScramble(
  text: string,
  revealRatio: number = 0.4,
  charset: string = DEFAULT_CHARSET
): string {
  return text
    .split('')
    .map((ch) => {
      if (ch === ' ') return ' ';
      return Math.random() < revealRatio ? ch : randomChar(charset);
    })
    .join('');
}
