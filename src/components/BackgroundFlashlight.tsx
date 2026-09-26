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
  
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  
  useEffect(() => {
    // Initial center position
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    currentPos.current = { ...targetPos.current };

    const handlePointerMove = (e: PointerEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Touch devices pulse reveal logic
      if (!brightRef.current) return;
      const touch = e.touches[0];
      targetPos.current = { x: touch.clientX, y: touch.clientY };
      currentPos.current = { ...targetPos.current };
      
      const el = brightRef.current;
      el.style.transition = 'mask-size 0.2s ease-out, opacity 1.2s ease-in-out';
      el.style.maskImage = `radial-gradient(circle 300px at ${currentPos.current.x}px ${currentPos.current.y}px, black 0%, transparent 80%)`;
      el.style.opacity = '1';
      
      setTimeout(() => {
        el.style.opacity = '0';
      }, 200);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

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
