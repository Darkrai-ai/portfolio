'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

// Simple lerp function
function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

export default function BackgroundFlashlight() {
  const brightRef = useRef<HTMLImageElement>(null);
  
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const reqRef = useRef<number | undefined>(undefined);
  
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  
  useEffect(() => {
    // Initial center position
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    currentPos.current = { ...targetPos.current };

    const showReveal = () => {
      if (!brightRef.current) return;
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      brightRef.current.style.transition = 'opacity 0.2s ease-out';
      brightRef.current.style.opacity = '1';
    };

    const scheduleFadeOut = (delayMs = 850) => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      fadeTimeoutRef.current = setTimeout(() => {
        if (!brightRef.current) return;
        brightRef.current.style.transition = 'opacity 1.1s ease-in-out';
        brightRef.current.style.opacity = '0';
      }, delayMs);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (brightRef.current && brightRef.current.style.opacity === '0') {
        brightRef.current.style.transition = 'opacity 0.25s ease-out';
        brightRef.current.style.opacity = '1';
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!brightRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      targetPos.current = { x: touch.clientX, y: touch.clientY };
      currentPos.current = { ...targetPos.current };
      showReveal();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!brightRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      targetPos.current = { x: touch.clientX, y: touch.clientY };
      showReveal();
    };

    const handleTouchEnd = () => {
      scheduleFadeOut(850);
    };

    const handleKeyDown = () => {
      if (!brightRef.current) return;
      showReveal();
      scheduleFadeOut(950);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    const update = () => {
      if (!brightRef.current) {
        reqRef.current = requestAnimationFrame(update);
        return;
      }
      
      if (reducedMotion) {
        currentPos.current = { ...targetPos.current };
      } else {
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);
      }

      const mask = `radial-gradient(circle 300px at ${currentPos.current.x}px ${currentPos.current.y}px, black 0%, transparent 80%)`;
      brightRef.current.style.maskImage = mask;
      brightRef.current.style.setProperty('-webkit-mask-image', mask);

      reqRef.current = requestAnimationFrame(update);
    };

    reqRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (reqRef.current) {
        cancelAnimationFrame(reqRef.current);
      }
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05070D]">
      {/* Dark layer */}
      <img
        src="/backgrounds/dark.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Bright layer */}
      <img
        ref={brightRef}
        src="/backgrounds/bright.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1.2s]"
      />
    </div>
  );
}
