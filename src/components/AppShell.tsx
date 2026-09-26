'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '../store/useAppStore';
import { detectIsMobile, detectReducedMotion } from '../utils/detectMobile';

// Dynamic imports for client-only components
const BackgroundFlashlight = dynamic(() => import('./BackgroundFlashlight'), { ssr: false });
const SceneManager = dynamic(() => import('./SceneManager'), { ssr: false });
const IntroSequence = dynamic(() => import('./IntroSequence'), { ssr: false });
const Wordmark = dynamic(() => import('./Wordmark'), { ssr: false });
const HudReadout = dynamic(() => import('./HudReadout'), { ssr: false });
const MuteControl = dynamic(() => import('./MuteControl'), { ssr: false });
const SkillPanel = dynamic(() => import('./SkillPanel'), { ssr: false });
const ProjectList = dynamic(() => import('./ProjectList'), { ssr: false });
const ProjectPanel = dynamic(() => import('./ProjectPanel'), { ssr: false });
const AboutMeView = dynamic(() => import('./AboutMeView'), { ssr: false });
const MobileInterstitial = dynamic(() => import('./MobileInterstitial'), { ssr: false });

export default function AppShell() {
  const setIsMobile = useAppStore((s) => s.setIsMobile);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  useEffect(() => {
    // Detect mobile and reduced motion on mount
    setIsMobile(detectIsMobile());
    setReducedMotion(detectReducedMotion());

    // Listen for reduced motion changes
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);

    // Listen for resize
    const resizeHandler = () => setIsMobile(detectIsMobile());
    window.addEventListener('resize', resizeHandler);

    return () => {
      mql.removeEventListener('change', handler);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [setIsMobile, setReducedMotion]);

  return (
    <>
      {/* Background: always visible, behind everything */}
      <BackgroundFlashlight />

      {/* 3D Scene: single persistent canvas */}
      <SceneManager />

      {/* Intro overlay */}
      <IntroSequence />

      {/* Persistent UI elements */}
      <Wordmark />
      <HudReadout />
      <MuteControl />

      {/* View-specific DOM overlays */}
      <SkillPanel />
      <ProjectList />
      <ProjectPanel />
      <AboutMeView />

      {/* Mobile interstitial */}
      <MobileInterstitial />
    </>
  );
}
