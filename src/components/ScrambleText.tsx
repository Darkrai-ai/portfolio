'use client';

import React, { useEffect, useRef } from 'react';
import {
  createScrambleState,
  updateScramble,
  type ScrambleState,
} from '../utils/scramble';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  progress?: number;
  charSet?: string;
  revealOrder?: 'random' | 'ltr';
  perpetual?: boolean;
  scrambling?: boolean;
  cycleTexts?: string[];
  cycleInterval?: number;
  onComplete?: () => void;
  className?: string;
}

export function ScrambleText({
  text,
  duration = 1100,
  progress,
  charSet,
  perpetual = false,
  scrambling = false,
  cycleTexts,
  cycleInterval = 4000,
  onComplete,
  className = '',
}: ScrambleTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const stateRef = useRef<ScrambleState>(createScrambleState(text));
  const cycleIndexRef = useRef(0);
  const lastCycleTimeRef = useRef(0);
  const lastGlitchTimeRef = useRef(0);
  const lastScrambleStepRef = useRef(0);

  // Whenever target text changes or scrambling stops, reset scramble state so it decrypts into the target text
  useEffect(() => {
    if (!cycleTexts) {
      stateRef.current = createScrambleState(text);
      startTimeRef.current = null;
    }
  }, [text, scrambling, cycleTexts]);

  useEffect(() => {
    // External progress mode — driven by caller (e.g. IntroSequence)
    if (progress !== undefined) {
      if (elementRef.current) {
        elementRef.current.textContent = updateScramble(
          stateRef.current,
          progress,
          charSet
        );
      }
      if (progress >= 1 && onComplete) {
        onComplete();
      }
      return;
    }

    const animate = (time: number) => {
      if (scrambling) {
        // Continuously scramble while the carousel is spinning
        startTimeRef.current = null;
        if (elementRef.current && time - lastScrambleStepRef.current > 38) {
          lastScrambleStepRef.current = time;
          stateRef.current.locked.fill(false);
          elementRef.current.textContent = updateScramble(
            stateRef.current,
            0,
            charSet
          );
        }
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = time;
        lastCycleTimeRef.current = time;
      }

      if (perpetual && cycleTexts && cycleTexts.length > 0) {
        const elapsed = time - lastCycleTimeRef.current;

        if (elapsed > cycleInterval) {
          lastCycleTimeRef.current = time;
          cycleIndexRef.current =
            (cycleIndexRef.current + 1) % cycleTexts.length;
          stateRef.current = createScrambleState(
            cycleTexts[cycleIndexRef.current]
          );
        }

        const cycleProgress = Math.min(elapsed / (cycleInterval * 0.45), 1);
        if (elementRef.current) {
          elementRef.current.textContent = updateScramble(
            stateRef.current,
            cycleProgress,
            charSet
          );
        }
        rafRef.current = requestAnimationFrame(animate);
      } else {
        const elapsed = time - startTimeRef.current;
        const currentProgress = Math.min(elapsed / duration, 1);

        if (currentProgress < 1) {
          // Actively scrambling into the new target text (update glyphs every ~32ms for crisp readability)
          if (elementRef.current && time - lastScrambleStepRef.current > 32) {
            lastScrambleStepRef.current = time;
            elementRef.current.textContent = updateScramble(
              stateRef.current,
              currentProgress,
              charSet
            );
          }
          rafRef.current = requestAnimationFrame(animate);
        } else if (perpetual) {
          // Text has resolved — keep it readable with a subtle sci-fi single-char telemetry flicker
          if (elementRef.current && time - lastGlitchTimeRef.current > 140) {
            lastGlitchTimeRef.current = time;
            if (Math.random() < 0.28 && text.length > 2) {
              const glitchChars = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';
              const chars = text.split('');
              const idx = Math.floor(Math.random() * chars.length);
              if (chars[idx] !== ' ' && chars[idx] !== ',') {
                chars[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }
              elementRef.current.textContent = chars.join('');
            } else {
              elementRef.current.textContent = text;
            }
          }
          rafRef.current = requestAnimationFrame(animate);
        } else {
          if (elementRef.current) {
            elementRef.current.textContent = text;
          }
          if (onComplete) onComplete();
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    progress,
    duration,
    perpetual,
    scrambling,
    cycleTexts,
    cycleInterval,
    text,
    charSet,
    onComplete,
  ]);

  return (
    <span ref={elementRef} className={className}>
      {text}
    </span>
  );
}

export default ScrambleText;
