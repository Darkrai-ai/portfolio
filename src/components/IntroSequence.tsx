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

  // Play the full intro every time the page is opened, using clamped frame-delta timing
  // so network/asset loads on production never skip the shooting star or cause frame jumps
  useEffect(() => {
    if (isDone) return;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('utsaphire-intro-done');
    }

    const scrambleState = createScrambleState('Utsaphire');
    if (wordSpanRef.current) {
      wordSpanRef.current.textContent = updateScramble(scrambleState, 0);
    }

    const scrambleDuration = 1550; // ms for "Utsaphire" text scramble
    const starFlightDuration = 760; // ms for shooting star to streak across and land as the '.'
    const tailAbsorbDuration = 440; // ms for tail absorption + impact sparks after becoming the '.'
    const totalTimeline = scrambleDuration + starFlightDuration + tailAbsorbDuration;

    let skipShown = false;
    let starInitialized = false;
    let dotLockedIn = false;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ctx: CanvasRenderingContext2D | null = null;
    let startX = 0;
    let startY = 0;
    let ctrlX = 0;
    let ctrlY = 0;
    let targetX = 0;
    let targetY = 0;
    let dotRadius = 5.5;

    const sparks: Spark[] = [];

    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const updateStarTrajectory = () => {
      const dotEl = dotRef.current;
      const wordEl = wordSpanRef.current;
      if (!dotEl) return;

      const rect = dotEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetX = rect.left + rect.width * 0.46;
        targetY = rect.top + rect.height * 0.75;
        dotRadius = Math.max(5, rect.width * 0.24);
      } else if (wordEl) {
        const wRect = wordEl.getBoundingClientRect();
        targetX = wRect.right + 12;
        targetY = wRect.top + wRect.height * 0.75;
        dotRadius = 6;
      }

      // Start well inside the upper-left viewport so the entire shooting star arc is 100% visible on every screen
      startX = Math.max(width * 0.12, targetX - Math.min(width * 0.5, 540));
      startY = Math.max(height * 0.12, targetY - Math.min(height * 0.36, 280));
      ctrlX = startX + (targetX - startX) * 0.58;
      ctrlY = Math.max(height * 0.06, Math.min(startY, targetY) - Math.min(height * 0.12, 95));
    };

    setupCanvas();

    const getQuadBezierPoint = (t: number) => {
      const inv = 1 - t;
      return {
        x: inv * inv * startX + 2 * inv * t * ctrlX + t * t * targetX,
        y: inv * inv * startY + 2 * inv * t * ctrlY + t * t * targetY,
      };
    };

    const spawnImpactSparks = (ix: number, iy: number) => {
      const palette = ['#FFFFFF', '#4FC3F7', '#FFC857', '#8B6BF2'];
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.25;
        const speed = 1.2 + Math.random() * 3.6;
        sparks.push({
          x: ix,
          y: iy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          life: 0,
          maxLife: 22 + Math.random() * 14,
          size: 1.5 + Math.random() * 1.7,
          color: palette[i % palette.length],
        });
      }
    };

    let lastNow = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      // Clamp frame delta to at most 28ms so background texture/font loads NEVER skip animation frames!
      const dt = Math.min(Math.max(now - lastNow, 0), 28);
      lastNow = now;
      elapsed += dt;

      if (!skipShown && elapsed >= 500) {
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

      // Ensure final clean text is locked in and measure '.' coordinates
      if (!starInitialized) {
        starInitialized = true;
        if (wordSpanRef.current) {
          wordSpanRef.current.textContent = 'Utsaphire';
        }
        setupCanvas();
        updateStarTrajectory();
      }

      // PHASE 2: Shooting Star streaks in and BECOMES the '.' itself
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        const starElapsed = elapsed - scrambleDuration;
        const rawFlightT = Math.min(starElapsed / starFlightDuration, 1);
        // Smooth ease-out curve so the shooting star is clearly visible across its whole arc
        const flightT = 1 - Math.pow(1 - rawFlightT, 1.85);

        if (rawFlightT < 1) {
          updateStarTrajectory();
        }

        const headPt = getQuadBezierPoint(flightT);
        const tailFade =
          rawFlightT < 1
            ? 1
            : Math.max(0, 1 - (starElapsed - starFlightDuration) / 190);

        // Compute analytic curved meteor tail along the Bezier trajectory (always smooth regardless of FPS)
        const tailSpanT = 0.34 * tailFade;
        const tailStartT = Math.max(0, flightT - tailSpanT);

        if (flightT > tailStartT + 0.004 && tailFade > 0.01) {
          const tailEndPt = getQuadBezierPoint(tailStartT);
          const steps = 22;

          const traceTailPath = () => {
            if (!ctx) return;
            ctx.beginPath();
            for (let s = 0; s <= steps; s++) {
              const u = s / steps;
              const sampleT = flightT - u * (flightT - tailStartT);
              const pt = getQuadBezierPoint(sampleT);
              if (s === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          };

          // 1. Wide outer cyan-violet atmospheric glow
          const outerGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailEndPt.x, tailEndPt.y);
          outerGrad.addColorStop(0, `rgba(79, 195, 247, ${0.52 * tailFade})`);
          outerGrad.addColorStop(0.45, `rgba(139, 107, 242, ${0.26 * tailFade})`);
          outerGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');
          traceTailPath();
          ctx.strokeStyle = outerGrad;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 2. Mid electric-cyan plasma streak
          const midGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailEndPt.x, tailEndPt.y);
          midGrad.addColorStop(0, `rgba(140, 225, 255, ${0.85 * tailFade})`);
          midGrad.addColorStop(0.5, `rgba(79, 195, 247, ${0.45 * tailFade})`);
          midGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');
          traceTailPath();
          ctx.strokeStyle = midGrad;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 3. Brilliant white-hot inner core
          const coreGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailEndPt.x, tailEndPt.y);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * tailFade})`);
          coreGrad.addColorStop(0.4, `rgba(190, 240, 255, ${0.88 * tailFade})`);
          coreGrad.addColorStop(1, 'rgba(79, 195, 247, 0)');
          traceTailPath();
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw blazing shooting star head + 4-pointed star flare while in flight
        if (rawFlightT < 1) {
          const glowRadius = 26 * (1 - rawFlightT * 0.28);
          const headGlow = ctx.createRadialGradient(
            headPt.x,
            headPt.y,
            0,
            headPt.x,
            headPt.y,
            glowRadius
          );
          headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
          headGlow.addColorStop(0.32, 'rgba(79, 195, 247, 0.92)');
          headGlow.addColorStop(0.68, 'rgba(139, 107, 242, 0.35)');
          headGlow.addColorStop(1, 'rgba(79, 195, 247, 0)');
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Crisp 4-point celestial star flare crosshairs
          const flareLen = 16 * (1 - rawFlightT * 0.35);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(headPt.x - flareLen, headPt.y);
          ctx.lineTo(headPt.x + flareLen, headPt.y);
          ctx.moveTo(headPt.x, headPt.y - flareLen);
          ctx.lineTo(headPt.x, headPt.y + flareLen);
          ctx.stroke();

          // Solid bright core that condenses into the '.' radius upon arrival
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, dotRadius * (0.9 + 0.35 * (1 - rawFlightT)), 0, Math.PI * 2);
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
            const ringRadius = dotRadius + ringT * 44;
            const ringAlpha = (1 - ringT) * 0.7;
            ctx.strokeStyle = `rgba(79, 195, 247, ${ringAlpha})`;
            ctx.lineWidth = 1.8 * (1 - ringT);
            ctx.beginPath();
            ctx.arc(targetX, targetY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          const stepFactor = dt / 16.66;
          for (let i = sparks.length - 1; i >= 0; i--) {
            const sp = sparks[i];
            sp.x += sp.vx * stepFactor;
            sp.y += sp.vy * stepFactor;
            sp.vy += 0.06 * stepFactor;
            sp.life += stepFactor;

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

      // Compute exact GPU scale & translation to land on top-4 left-4 (16px) on mobile or top-7 left-7 (28px) on PC
      const isMobileViewport = window.innerWidth < 768;
      const targetFontSize = isMobileViewport ? 16 : 20;
      const targetCornerOffset = isMobileViewport ? 16 : 28;

      const rect = textEl.getBoundingClientRect();
      const computedFontSize = parseFloat(window.getComputedStyle(textEl).fontSize) || 80;
      const targetScale = targetFontSize / computedFontSize;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const targetCenterX = targetCornerOffset + (rect.width * targetScale) / 2;
      const targetCenterY = targetCornerOffset + (rect.height * targetScale) / 2;

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
        className="text-metal-100 font-display text-4xl sm:text-6xl md:text-8xl whitespace-nowrap select-none z-[101] will-change-transform"
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


