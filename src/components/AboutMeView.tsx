'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { aboutMe } from '../data/aboutMe';
import { audioManager } from '../audio/AudioManager';
import { ScrambleText } from './ScrambleText';

const SECTIONS = [
  { id: 'about-overview', code: '01', label: 'OVERVIEW' },
  { id: 'about-experience', code: '02', label: 'EXPERIENCE' },
  { id: 'about-education', code: '03', label: 'EDUCATION' },
  { id: 'about-beyond', code: '04', label: 'BEYOND' },
  { id: 'about-contact', code: '05', label: 'TRANSMISSION' },
] as const;

export default function AboutMeView() {
  const { view, exitAboutMe } = useAppStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleUserInteraction = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'about') return;
      if (e.key === 'Escape') {
        audioManager.play('click');
        exitAboutMe();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleUserInteraction();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ top: 160, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUserInteraction();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ top: -160, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitAboutMe, view]);

  // Auto-scroll loop + active section tracking
  useEffect(() => {
    if (view !== 'about') return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const container = scrollContainerRef.current;
      if (container) {
        if (!isPaused) {
          const scrollAmount = (delta / 16.66) * 0.75;
          container.scrollTop += scrollAmount;

          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
            exitAboutMe();
            return;
          }
        }

        // Update active section indicator based on scroll position
        const viewportCenter = container.scrollTop + container.clientHeight * 0.42;
        for (let i = SECTIONS.length - 1; i >= 0; i--) {
          const el = document.getElementById(SECTIONS[i].id);
          if (el && el.offsetTop <= viewportCenter) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, view, exitAboutMe]);

  const scrollToSection = (sectionId: string) => {
    audioManager.play('tab');
    handleUserInteraction();
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    const container = scrollContainerRef.current;
    if (el && container) {
      const targetTop =
        sectionId === 'about-overview'
          ? 0
          : Math.max(0, el.offsetTop - container.clientHeight * 0.14);
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const {
    name,
    title,
    headshotPath,
    bio,
    education,
    experience,
    funFacts,
    contactEmail,
    socialLinks,
    resumePath,
  } = aboutMe;

  const monogram = name.slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      {view === 'about' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="fixed inset-0 z-[60] bg-gradient-to-b from-void/75 via-void/25 to-void/80 overflow-y-auto"
          ref={scrollContainerRef}
          onWheel={handleUserInteraction}
          onTouchMove={handleUserInteraction}
        >
          {/* Subtle Top & Bottom Viewport Vignette Masks so scrolling content fades cleanly */}
          <div className="fixed top-0 inset-x-0 h-20 bg-gradient-to-b from-void/90 via-void/45 to-transparent z-[65] pointer-events-none" />
          <div className="fixed bottom-0 inset-x-0 h-24 bg-gradient-to-t from-void/95 via-void/55 to-transparent z-[65] pointer-events-none" />

          {/* Scrollable Architectural Dossier Stream over the 3D Celestial Orrery */}
          <div className="min-h-screen w-full flex flex-col items-center pt-16 md:pt-16 pb-[42vh] px-4 md:px-6">
            {/* Dossier Header (Scrolls naturally with the dossier so it never overlaps content) */}
            <header className="w-full max-w-4xl mx-auto mb-12 md:mb-16 flex flex-col items-center text-center pointer-events-none select-none">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="w-8 md:w-14 h-[1px] bg-gradient-to-r from-transparent to-metal-100/35" />
                <span className="font-hud text-[10px] md:text-[11px] tracking-[0.34em] uppercase text-metal-400/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  <ScrambleText
                    text="FILE 00  //  COMMAND DOSSIER"
                    duration={450}
                    charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/"
                  />
                </span>
                <span className="w-8 md:w-14 h-[1px] bg-gradient-to-l from-transparent to-metal-100/35" />
              </div>

              <h1 className="mt-2 font-display text-3xl md:text-[3.2rem] leading-none tracking-[0.14em] md:tracking-[0.2em] uppercase text-metal-100 drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
                <ScrambleText
                  text={name.toUpperCase()}
                  duration={520}
                  charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                />
              </h1>

              <div className="w-28 md:w-44 h-[1px] bg-gradient-to-r from-transparent via-accent-blue/45 to-transparent my-2.5" />

              <div className="font-hud text-xs md:text-sm tracking-[0.26em] uppercase text-accent-blue drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                <ScrambleText
                  text={title.toUpperCase()}
                  duration={580}
                  charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&"
                />
              </div>
            </header>

            <div className="w-full max-w-4xl mx-auto flex flex-col gap-y-24">
              {/* SECTION 01: IDENTITY & BIO OVERVIEW */}
              <section
                id="about-overview"
                className="relative w-full border-y border-metal-100/15 bg-gradient-to-r from-void/40 via-void/70 to-void/40 backdrop-blur-[5px] px-6 md:px-12 py-10"
              >
                {/* Architectural Corner Ticks */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent-blue/60" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent-blue/60" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent-blue/60" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent-blue/60" />

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Orbital Astrolabe Portrait */}
                  <div className="relative shrink-0 w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-dashed border-accent-blue/35 animate-spin [animation-duration:18s]" />
                    <span className="absolute inset-2 rounded-full border border-metal-100/20" />
                    <span className="absolute -inset-2 rounded-full border border-accent-gold/20 animate-spin [animation-duration:28s] [animation-direction:reverse]" />
                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-accent-blue/15 via-void/90 to-accent-violet/15 border border-accent-blue/45 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(79,195,247,0.25)]">
                      {headshotPath && !imgError ? (
                        <img
                          src={headshotPath}
                          alt={name}
                          onError={() => setImgError(true)}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <>
                          <span className="font-display text-2xl tracking-widest text-metal-100">
                            {monogram}
                          </span>
                          <span className="font-hud text-[8px] tracking-[0.28em] text-accent-blue/80 mt-0.5">
                            ORBIT // 00
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Editorial Bio & Core Specifications */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#4FC3F7]" />
                      <span className="font-hud text-[10px] tracking-[0.32em] uppercase text-accent-blue">
                        01 // ARCHITECTURAL SUMMARY
                      </span>
                    </div>

                    <p className="font-body text-metal-100/90 text-base md:text-lg leading-relaxed">
                      {bio}
                    </p>

                    <div className="mt-6 pt-5 border-t border-metal-100/10 flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-2 font-hud text-[10px] tracking-[0.24em] uppercase text-metal-400/75">
                      <span>{`ROLE // ${title.toUpperCase()}`}</span>
                      {education?.[0]?.title && (
                        <span>{`TRACK // ${education[0].title.toUpperCase()}`}</span>
                      )}
                      <span>ORIGIN // SOL-03</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 02: EXPERIENCE LEDGER */}
              {experience && experience.length > 0 && (
                <section id="about-experience" className="w-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-hud text-[10px] tracking-[0.34em] uppercase text-accent-gold">
                      02 // MISSION LOG
                    </span>
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-accent-gold/35 to-transparent" />
                    <span className="font-display text-lg md:text-xl tracking-[0.16em] uppercase text-metal-100">
                      EXPERIENCE
                    </span>
                  </div>

                  <div className="flex flex-col divide-y divide-metal-100/10 border-y border-metal-100/15 bg-gradient-to-b from-void/55 via-void/40 to-void/55 backdrop-blur-[4px]">
                    {experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="group relative px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10 hover:bg-metal-100/[0.03] transition-colors"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-gold/0 group-hover:bg-accent-gold group-hover:shadow-[0_0_12px_#FFC857] transition-all duration-300" />

                        <div className="md:w-48 shrink-0 flex items-center gap-2.5">
                          <span className="font-hud text-[10px] tracking-[0.24em] text-accent-gold/70">
                            {`0${idx + 1}`}
                          </span>
                          <span className="font-hud text-xs tracking-[0.2em] uppercase text-accent-gold">
                            {exp.period}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-display text-lg md:text-xl tracking-[0.08em] uppercase text-metal-100 group-hover:text-accent-blue transition-colors">
                            {exp.title}
                          </h3>
                          <p className="mt-2 font-body text-sm md:text-base text-metal-400/90 leading-relaxed">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 03: EDUCATION LEDGER */}
              {education && education.length > 0 && (
                <section id="about-education" className="w-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-hud text-[10px] tracking-[0.34em] uppercase text-accent-blue">
                      03 // ACADEMYARCHIVE
                    </span>
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-accent-blue/35 to-transparent" />
                    <span className="font-display text-lg md:text-xl tracking-[0.16em] uppercase text-metal-100">
                      EDUCATION
                    </span>
                  </div>

                  <div className="flex flex-col divide-y divide-metal-100/10 border-y border-metal-100/15 bg-gradient-to-b from-void/55 via-void/40 to-void/55 backdrop-blur-[4px]">
                    {education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="group relative px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10 hover:bg-metal-100/[0.03] transition-colors"
                      >
                        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-blue/0 group-hover:bg-accent-blue group-hover:shadow-[0_0_12px_#4FC3F7] transition-all duration-300" />

                        <div className="md:w-48 shrink-0 flex items-center gap-2.5">
                          <span className="font-hud text-[10px] tracking-[0.24em] text-accent-blue/70">
                            {`0${idx + 1}`}
                          </span>
                          <span className="font-hud text-xs tracking-[0.2em] uppercase text-accent-blue">
                            {edu.period}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-display text-lg md:text-xl tracking-[0.08em] uppercase text-metal-100 group-hover:text-accent-blue transition-colors">
                            {edu.title}
                          </h3>
                          <p className="mt-2 font-body text-sm md:text-base text-metal-400/90 leading-relaxed">
                            {edu.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 04: BEYOND THE CODE (ARCHITECTURAL TELEMETRY GRID) */}
              {funFacts && funFacts.length > 0 && (
                <section id="about-beyond" className="w-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-hud text-[10px] tracking-[0.34em] uppercase text-accent-violet">
                      04 // PERSONAL TELEMETRY
                    </span>
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-accent-violet/35 to-transparent" />
                    <span className="font-display text-lg md:text-xl tracking-[0.16em] uppercase text-metal-100">
                      BEYOND THE CODE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {funFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="relative px-6 py-4 bg-gradient-to-t from-void/65 via-void/40 to-transparent border-b border-metal-100/15 hover:border-accent-blue/50 backdrop-blur-[4px] transition-colors flex items-start gap-4"
                      >
                        <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-metal-100/30" />
                        <span className="font-hud text-[10px] tracking-[0.25em] text-accent-blue/80 pt-1 shrink-0">
                          {`0${idx + 1} //`}
                        </span>
                        <p className="font-body text-sm text-metal-100/85 leading-relaxed">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 05: ESTABLISH TRANSMISSION (FLAT PERSPECTIVE COMMS DECK) */}
              <section id="about-contact" className="w-full flex flex-col items-center text-center">
                <div className="w-full flex items-center gap-4 mb-8">
                  <span className="font-hud text-[10px] tracking-[0.34em] uppercase text-accent-blue">
                    05 // SUBSPACE FREQUENCY
                  </span>
                  <span className="flex-1 h-[1px] bg-gradient-to-r from-accent-blue/35 to-transparent" />
                  <span className="font-display text-lg md:text-xl tracking-[0.16em] uppercase text-metal-100">
                    TRANSMISSION
                  </span>
                </div>

                {/* Direct Email Frequency Banner */}
                <a
                  href={`mailto:${contactEmail}`}
                  onMouseEnter={() => audioManager.play('hover')}
                  onClick={() => audioManager.play('click')}
                  className="group relative w-full py-6 md:py-8 px-4 md:px-6 border-y border-metal-100/15 bg-gradient-to-r from-transparent via-void/65 to-transparent backdrop-blur-[4px] hover:border-accent-blue/50 transition-all"
                >
                  <span className="block font-hud text-[10px] tracking-[0.34em] uppercase text-metal-400/70 mb-2">
                    DIRECT CHANNEL // CLICK TO DISPATCH
                  </span>
                  <span className="font-display text-base sm:text-2xl md:text-3xl tracking-[0.06em] md:tracking-[0.12em] uppercase text-metal-100 group-hover:text-accent-blue group-hover:[text-shadow:0_0_20px_rgba(79,195,247,0.45)] transition-all break-all sm:break-normal">
                    {contactEmail}
                  </span>
                </a>

                {/* Flat Perspective Social & Resume Plates (Matching Main Menu Flat Projects) */}
                <div className="w-full mt-8 flex flex-wrap items-end justify-center gap-3 md:gap-6 [perspective:950px]">
                  {socialLinks &&
                    socialLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => audioManager.play('hover')}
                        onClick={() => audioManager.play('click')}
                        className="group relative text-left px-4 md:px-6 py-3 md:py-3.5 min-w-[145px] md:min-w-[205px]
                                   bg-gradient-to-t from-metal-100/[0.07] via-metal-100/[0.02] to-transparent
                                   hover:from-accent-blue/[0.15] hover:via-accent-blue/[0.04]
                                   backdrop-blur-[3px]
                                   [transform:rotateX(22deg)] hover:[transform:rotateX(0deg)_translateY(-4px)]
                                   origin-bottom transition-all duration-300 ease-out"
                      >
                        <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-metal-100/35 group-hover:border-accent-blue transition-colors" />
                        <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-metal-100/35 group-hover:border-accent-blue transition-colors" />
                        <span className="absolute bottom-0 inset-x-2 h-[1.5px] bg-gradient-to-r from-transparent via-metal-100/35 to-transparent group-hover:via-accent-blue group-hover:shadow-[0_0_16px_#4FC3F7] transition-all duration-300" />

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="font-hud text-[9px] tracking-[0.28em] uppercase text-accent-blue/75">
                              {`NODE // 0${idx + 1}`}
                            </span>
                            <span className="mt-0.5 font-display text-sm md:text-base tracking-[0.1em] uppercase text-metal-100 group-hover:text-accent-blue transition-colors">
                              {link.platform}
                            </span>
                          </div>
                          <span className="text-metal-400/60 group-hover:text-accent-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sm">
                            ↗
                          </span>
                        </div>
                      </a>
                    ))}

                  {resumePath && (
                    <div
                      role="status"
                      aria-disabled="true"
                      title="Resume currently locked"
                      className="group relative text-left px-4 md:px-6 py-3 md:py-3.5 min-w-[145px] md:min-w-[225px]
                                 bg-gradient-to-t from-metal-100/[0.04] via-metal-100/[0.01] to-transparent
                                 backdrop-blur-[3px] opacity-65 cursor-not-allowed select-none
                                 [transform:rotateX(22deg)]
                                 origin-bottom transition-all duration-300 ease-out"
                    >
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-accent-gold/35" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-accent-gold/35" />
                      <span className="absolute bottom-0 inset-x-2 h-[1.5px] bg-gradient-to-r from-transparent via-accent-gold/35 to-transparent" />

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-hud text-[9px] tracking-[0.28em] uppercase text-accent-gold/70">
                            DOSSIER // LOCKED
                          </span>
                          <span className="mt-0.5 font-display text-sm md:text-base tracking-[0.1em] uppercase text-metal-400">
                            RESUME
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-accent-gold/65 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Fixed Bottom-Center Dossier Navigation & Telemetry Rail (Matches Main Menu Rail) */}
          <nav
            aria-label="Dossier section navigation"
            className="fixed bottom-4 md:bottom-7 left-1/2 md:left-[48.5%] -translate-x-1/2 z-[70] max-w-[calc(100vw-16px)] md:max-w-none px-2 md:px-4 py-1.5 md:py-2 bg-void/65 backdrop-blur-[6px] border-t border-metal-100/15 flex items-center justify-center gap-0.5 sm:gap-4 select-none"
          >
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  onMouseEnter={() => audioManager.play('hover')}
                  className={`relative px-1.5 md:px-2 py-1 font-hud text-[8.5px] md:text-[10px] tracking-[0.08em] md:tracking-[0.2em] uppercase transition-colors cursor-pointer focus:outline-none ${
                    isActive
                      ? 'text-metal-100'
                      : 'text-metal-400/50 hover:text-metal-100/85'
                  }`}
                >
                  <span className="hidden md:inline text-[9px] text-accent-blue/65 mr-1">
                    {sec.code}
                  </span>
                  <span>{sec.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="aboutSectionActiveBar"
                      className="absolute bottom-0 inset-x-1 h-[1.5px] bg-accent-blue shadow-[0_0_10px_#4FC3F7]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            <span className="h-3 w-[1px] bg-metal-100/15 mx-0.5 md:mx-1" />

            <button
              type="button"
              onClick={() => {
                audioManager.play('click');
                exitAboutMe();
              }}
              onMouseEnter={() => audioManager.play('hover')}
              className="px-1.5 md:px-2 py-1 font-hud text-[8.5px] md:text-[10px] tracking-[0.1em] md:tracking-[0.22em] uppercase text-accent-blue hover:text-metal-100 transition-colors cursor-pointer focus:outline-none shrink-0"
            >
              <span className="md:hidden">ORBIT</span>
              <span className="hidden md:inline">ESC // ORBIT</span>
            </button>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

