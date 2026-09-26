'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { createScrambleState, updateScramble } from '../utils/scramble';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const IntroSequence: React.FC = () => {
  const [isDone, setIsDone] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const completeIntro = useAppStore((s) => s.completeIntro);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const wordSpanRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rafRef = useRef<number | null>(null);
  const dockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedDockRef = useRef(false);

  // Play the full intro every time the page is opened, using a single 60fps rAF loop (zero React state re-renders)
  useEffect(() => {
    if (isDone) return;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('utsaphire-intro-done');
    }

    const scrambleState = createScrambleState('Utsaphire');
    if (wordSpanRef.current) {
      wordSpanRef.current.textContent = updateScramble(scrambleState, 0);
    }

    const scrambleDuration = 1650; // ms for "Utsaphire" text scramble
    const starFlightDuration = 580; // ms for shooting star to streak across and land as the '.'
    const tailAbsorbDuration = 420; // ms for tail absorption + impact sparks after becoming the '.'
    const totalTimeline = scrambleDuration + starFlightDuration + tailAbsorbDuration;

    let skipShown = false;
    let starInitialized = false;
    let dotLockedIn = false;

    // Shooting star geometry state (initialized right when scramble completes)
    let width = window.innerWidth;
    let height = window.innerHeight;
    let ctx: CanvasRenderingContext2D | null = null;
    let startX = 0;
    let startY = 0;
    let ctrlX = 0;
    let ctrlY = 0;
    let targetX = 0;
    let targetY = 0;
    let dotRadius = 5;

    const trailPoints: Array<{ x: number; y: number }> = [];
    const sparks: Spark[] = [];

    const getQuadBezierPoint = (t: number) => {
      const inv = 1 - t;
      return {
        x: inv * inv * startX + 2 * inv * t * ctrlX + t * t * targetX,
        y: inv * inv * startY + 2 * inv * t * ctrlY + t * t * targetY,
      };
    };

    const initShootingStar = () => {
      const canvas = canvasRef.current;
      const dotEl = dotRef.current;
      if (!canvas || !dotEl) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Exact screen coordinates of the '.' glyph at the end of "Utsaphire."
      const rect = dotEl.getBoundingClientRect();
      targetX = rect.left + rect.width * 0.46;
      targetY = rect.top + rect.height * 0.75;
      dotRadius = Math.max(4.5, rect.width * 0.24);

      // Sweeping diagonal arc from upper-left sky directly into the '.' position
      const spanX = Math.max(width * 0.54, 560);
      const spanY = Math.max(height * 0.38, 270);
      startX = targetX - spanX;
      startY = targetY - spanY;
      ctrlX = targetX - spanX * 0.28;
      ctrlY = targetY - spanY * 0.64;
    };

    const spawnImpactSparks = (ix: number, iy: number) => {
      const palette = ['#FFFFFF', '#4FC3F7', '#FFC857', '#8B6BF2'];
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.25;
        const speed = 1.1 + Math.random() * 3.4;
        sparks.push({
          x: ix,
          y: iy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          life: 0,
          maxLife: 20 + Math.random() * 14,
          size: 1.4 + Math.random() * 1.6,
          color: palette[i % palette.length],
        });
      }
    };

    const animStart = performance.now();

    const tick = (now: number) => {
      const elapsed = now - animStart;

      if (!skipShown && elapsed >= 550) {
        skipShown = true;
        setSkipVisible(true);
      }

      // PHASE 1: Scramble "Utsaphire" directly in DOM (zero React re-renders)
      if (elapsed <= scrambleDuration) {
        const prog = Math.min(elapsed / scrambleDuration, 1);
        if (wordSpanRef.current) {
          wordSpanRef.current.textContent = updateScramble(scrambleState, prog);
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Ensure final clean text is locked in
      if (!starInitialized) {
        starInitialized = true;
        if (wordSpanRef.current) {
          wordSpanRef.current.textContent = 'Utsaphire';
        }
        initShootingStar();
      }

      // PHASE 2: Shooting Star streaks in and BECOMES the '.' itself
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        const starElapsed = elapsed - scrambleDuration;
        const rawFlightT = Math.min(starElapsed / starFlightDuration, 1);
        // Smooth easeOutQuad so it streaks fast across the sky and lands directly into the '.' slot
        const flightT = 1 - Math.pow(1 - rawFlightT, 1.65);

        const headPt = getQuadBezierPoint(flightT);
        trailPoints.unshift(headPt);
        const maxTrail = rawFlightT < 1 ? 16 : Math.max(0, Math.round(16 * (1 - (starElapsed - starFlightDuration) / 160)));
        while (trailPoints.length > maxTrail) {
          trailPoints.pop();
        }

        // Draw layered hardware-accelerated meteor tail (no slow ctx.shadowBlur!)
        if (trailPoints.length > 1) {
          const tailEnd = trailPoints[trailPoints.length - 1];
          const tailAlpha = rawFlightT < 1 ? 1 : Math.max(0, 1 - (starElapsed - starFlightDuration) / 160);

          // Soft outer cyan-violet aura stroke
          const outerGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailEnd.x, tailEnd.y);
          outerGrad.addColorStop(0, `rgba(79, 195, 247, ${0.42 * tailAlpha})`);
          outerGrad.addColorStop(0.5, `rgba(139, 107, 242, ${0.18 * tailAlpha})`);
          outerGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');

          ctx.beginPath();
          ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
          for (let i = 1; i < trailPoints.length; i++) {
            ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
          }
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Bright inner white-cyan core stroke
          const coreGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailEnd.x, tailEnd.y);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.96 * tailAlpha})`);
          coreGrad.addColorStop(0.35, `rgba(79, 195, 247, ${0.82 * tailAlpha})`);
          coreGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');

          ctx.beginPath();
          ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
          for (let i = 1; i < trailPoints.length; i++) {
            ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
          }
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw blazing shooting star head mientras in flight (condensing into the exact '.' size as it arrives)
        if (rawFlightT < 1) {
          const glowRadius = 20 * (1 - rawFlightT * 0.35);
          const headGlow = ctx.createRadialGradient(
            headPt.x,
            headPt.y,
            0,
            headPt.x,
            headPt.y,
            glowRadius
          );
          headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
          headGlow.addColorStop(0.3, 'rgba(79, 195, 247, 0.88)');
          headGlow.addColorStop(1, 'rgba(79, 195, 247, 0)');
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Solid bright core that matches the '.' radius upon arrival
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, dotRadius * (0.85 + 0.3 * (1 - rawFlightT)), 0, Math.PI * 2);
          ctx.fill();
        } else if (!dotLockedIn) {
          // The shooting star has arrived at (targetX, targetY) and BECOMES the '.' itself!
          dotLockedIn = true;
          spawnImpactSparks(targetX, targetY);

          if (dotRef.current) {
            gsap.fromTo(
              dotRef.current,
              {
                opacity: 1,
                scale: 1.55,
                color: '#FFFFFF',
                textShadow: '0 0 28px #4FC3F7, 0 0 54px #FFFFFF',
              },
              {
                opacity: 1,
                scale: 1,
                color: '#E8ECF4',
                textShadow: '0 0 14px rgba(79, 195, 247, 0.45)',
                duration: 0.38,
                ease: 'back.out(2.4)',
              }
            );
          }
        }

        // Draw impact shockwave ring & stardust sparks around the newly formed '.'
        if (dotLockedIn) {
          const sinceLand = starElapsed - starFlightDuration;
          if (sinceLand >= 0 && sinceLand < 380) {
            const ringT = sinceLand / 380;
            const ringRadius = dotRadius + ringT * 42;
            const ringAlpha = (1 - ringT) * 0.65;
            ctx.strokeStyle = `rgba(79, 195, 247, ${ringAlpha})`;
            ctx.lineWidth = 1.6 * (1 - ringT);
            ctx.beginPath();
            ctx.arc(targetX, targetY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          for (let i = sparks.length - 1; i >= 0; i--) {
            const sp = sparks[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.06;
            sp.life += 1;

            if (sp.life >= sp.maxLife) {
              sparks.splice(i, 1);
              continue;
            }

            const alpha = 1 - sp.life / sp.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = sp.color;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }

      if (elapsed < totalTimeline) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (ctx) ctx.clearRect(0, 0, width, height);
        runDockToCorner();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    };
  }, [isDone]);

  // Phase 3: GPU-accelerated transform (x, y, scale) from center to top-left Wordmark (zero layout reflow!)
  const runDockToCorner = () => {
    if (isDone || hasStartedDockRef.current) return;
    hasStartedDockRef.current = true;

    dockTimeoutRef.current = setTimeout(() => {
      const containerEl = containerRef.current;
      const textEl = textRef.current;
      if (!containerEl || !textEl) {
        completeIntro();
        setIsDone(true);
        return;
      }

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          textShadow: '0 0 0px rgba(79, 195, 247, 0)',
          duration: 0.5,
        });
      }

      // Compute exact GPU scale & translation to land on top-7 left-7 (28px, 28px) at 20px (1.25rem) font size
      const rect = textEl.getBoundingClientRect();
      const computedFontSize = parseFloat(window.getComputedStyle(textEl).fontSize) || 80;
      const targetScale = 20 / computedFontSize;

      // With transformOrigin: 'center center', the scaled top-left corner will be at:
      // centerX + dx - (rect.width * targetScale) / 2 = 28
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const targetCenterX = 28 + (rect.width * targetScale) / 2;
      const targetCenterY = 28 + (rect.height * targetScale) / 2;

      const dx = targetCenterX - centerX;
      const dy = targetCenterY - centerY;

      gsap.to(textEl, {
        x: dx,
        y: dy,
        scale: targetScale,
        duration: 1.05,
        ease: 'power3.inOut',
        force3D: true,
      });

      gsap.to(containerEl, {
        backgroundColor: 'rgba(5, 7, 13, 0)',
        duration: 1.05,
        ease: 'power2.inOut',
        onComplete: () => {
          completeIntro();
          setIsDone(true);
        },
      });
    }, 180);
  };

  const handleSkip = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    completeIntro();
    setIsDone(true);
  };

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-void flex items-center justify-center overflow-hidden"
    >
      {/* 60fps Hardware-Accelerated Shooting Star Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[102]"
      />

      {/* Center Wordmark ("Utsaphire" scrambles first, then the shooting star flies in and becomes the ".") */}
      <div
        ref={textRef}
        className="text-metal-100 font-display text-6xl md:text-8xl whitespace-nowrap select-none z-[101] will-change-transform"
      >
        <span ref={wordSpanRef}>Utsaphire</span>
        <span
          ref={dotRef}
          className="inline-block opacity-0 origin-center"
          aria-hidden="true"
        >
          .
        </span>
      </div>

      {skipVisible && (
        <button
          onClick={handleSkip}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 font-hud text-[10px] tracking-[0.28em] uppercase text-text-dim hover:text-accent-blue transition-colors z-[103] cursor-pointer"
        >
          SKIP // INTRO &rarr;
        </button>
      )}
    </div>
  );
};

export default IntroSequence;


