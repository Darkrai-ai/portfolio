'use client';

import React, { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../audio/AudioManager';
import { ScrambleText } from './ScrambleText';

export default function ProjectPanel() {
  const view = useAppStore((state) => state.view);
  const focusedProjectId = useAppStore((state) => state.focusedProjectId);
  const closeProject = useAppStore((state) => state.closeProject);
  const openProject = useAppStore((state) => state.openProject);
  const focusPlanet = useAppStore((state) => state.focusPlanet);

  const projectIndex = projects.findIndex((p) => p.id === focusedProjectId);
  const project = projectIndex >= 0 ? projects[projectIndex] : null;

  const handleNext = useCallback(() => {
    if (projectIndex < 0) return;
    audioManager.play('click');
    audioManager.play('scroll');
    const nextIndex = (projectIndex + 1) % projects.length;
    openProject(projects[nextIndex].id);
  }, [projectIndex, openProject]);

  const handlePrev = useCallback(() => {
    if (projectIndex < 0) return;
    audioManager.play('click');
    audioManager.play('scroll');
    const prevIndex = (projectIndex - 1 + projects.length) % projects.length;
    openProject(projects[prevIndex].id);
  }, [projectIndex, openProject]);

  const handleClose = useCallback(() => {
    audioManager.play('click');
    closeProject();
  }, [closeProject]);

  // Keyboard arrow + mouse wheel scroll navigation in Projects Mode
  useEffect(() => {
    if (view !== 'ring' || !focusedProjectId) return;

    let lastWheelSwitch = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelSwitch < 480) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 18) return;

      lastWheelSwitch = now;
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [view, focusedProjectId, handleNext, handlePrev, handleClose]);

  if (view !== 'ring' || !focusedProjectId || !project) {
    return null;
  }

  const projectSkills = skills.filter((s) => project.skillIds.includes(s.id));
  const projectTechs = Array.from(new Set(projectSkills.flatMap((s) => s.techs)));
  const planetNamesText = projectSkills.map((s) => s.planetName.toUpperCase()).join(' · ');
  const indexCode = String(projectIndex + 1).padStart(2, '0');
  const totalCode = String(projects.length).padStart(2, '0');

  return (
    <>
      {/* Top-Center Scrambling Project Title & Tech Telemetry (No Frosted Glass, Matches Main Menu) */}
      <header className="fixed top-6 md:top-7 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center text-center pointer-events-none select-none w-full max-w-5xl px-6">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="w-8 md:w-14 h-[1px] bg-gradient-to-r from-transparent to-accent-gold/45" />
          <span className="font-hud text-[10px] md:text-[11px] tracking-[0.34em] uppercase text-metal-400/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            <ScrambleText
              text={`SYSTEM ${indexCode} / ${totalCode}  //  ORBIT: ${planetNamesText}`}
              duration={420}
              charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:"
            />
          </span>
          <span className="w-8 md:w-14 h-[1px] bg-gradient-to-l from-transparent to-accent-gold/45" />
        </div>

        <h1 className="mt-1.5 font-display text-2xl sm:text-3xl md:text-[2.45rem] leading-tight tracking-[0.14em] uppercase text-metal-100 drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
          <ScrambleText
            text={project.title.toUpperCase()}
            duration={480}
            charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
          />
        </h1>

        <div className="w-28 md:w-44 h-[1px] bg-gradient-to-r from-transparent via-accent-gold/55 to-transparent my-2" />

        <div className="font-hud text-xs md:text-sm tracking-[0.24em] uppercase text-accent-gold drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          <ScrambleText
            text={projectTechs.join('   •   ')}
            duration={540}
            charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+."
          />
        </div>
      </header>

      {/* Bottom-Center Architectural Specification Deck & Flat Project Step Rail */}
      <section
        aria-label="Project specifications and navigation"
        className="fixed bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-12 sm:px-14 flex flex-col items-center pointer-events-none select-none"
      >
        <div className="relative w-full max-w-2xl">
          {/* Prev Button — Pure arrow icon with NO frosted glass behind it */}
          <button
            type="button"
            onClick={handlePrev}
            onMouseEnter={() => audioManager.play('hover')}
            className="pointer-events-auto absolute top-1/2 -left-10 sm:-left-12 -translate-y-1/2 w-10 h-10 text-metal-100/80 hover:text-accent-blue hover:scale-125 flex items-center justify-center transition-all cursor-pointer drop-shadow-[0_0_12px_rgba(79,195,247,0.45)] focus:outline-none"
            aria-label="Previous project"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button — Pure arrow icon with NO frosted glass behind it */}
          <button
            type="button"
            onClick={handleNext}
            onMouseEnter={() => audioManager.play('hover')}
            className="pointer-events-auto absolute top-1/2 -right-10 sm:-right-12 -translate-y-1/2 w-10 h-10 text-metal-100/80 hover:text-accent-blue hover:scale-125 flex items-center justify-center transition-all cursor-pointer drop-shadow-[0_0_12px_rgba(79,195,247,0.45)] focus:outline-none"
            aria-label="Next project"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={focusedProjectId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="pointer-events-auto relative w-full px-6 sm:px-8 py-5
                         bg-gradient-to-t from-void/80 via-void/55 to-void/30
                         backdrop-blur-[5px] border-y border-metal-100/15"
            >
              {/* Architectural Corner Ticks */}
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-accent-gold/60" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-accent-gold/60" />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-accent-blue/60" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-accent-blue/60" />

              {/* Glowing Bottom Horizon Line */}
              <span className="absolute bottom-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-accent-gold/45 to-transparent" />

              {/* Top Telemetry Meta Row Inside Console */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-metal-100/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-hud text-[9px] tracking-[0.28em] uppercase text-metal-400/65 mr-1">
                    BODIES //
                  </span>
                  {projectSkills.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        audioManager.play('click');
                        focusPlanet(s.id);
                        closeProject();
                      }}
                      onMouseEnter={() => audioManager.play('hover')}
                      className="px-2 py-0.5 font-hud text-[9px] tracking-[0.22em] uppercase text-accent-gold/90 bg-accent-gold/[0.08] border border-accent-gold/30 hover:border-accent-blue hover:text-accent-blue transition-colors cursor-pointer"
                    >
                      {s.planetName}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  {project.liveUrl && (
                    <a
                      href={
                        project.liveUrl.startsWith('http')
                          ? project.liveUrl
                          : `https://${project.liveUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => audioManager.play('hover')}
                      onClick={() => audioManager.play('click')}
                      className="font-hud text-[10px] tracking-[0.24em] uppercase text-accent-blue hover:text-accent-gold transition-colors flex items-center gap-1"
                    >
                      <span>LIVE DEPLOYMENT</span>
                      <span>↗</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    onMouseEnter={() => audioManager.play('hover')}
                    className="font-hud text-[10px] tracking-[0.24em] uppercase text-metal-400/70 hover:text-accent-blue transition-colors cursor-pointer focus:outline-none"
                    aria-label="Close project view"
                  >
                    ESC // CLOSE
                  </button>
                </div>
              </div>

              {/* Project Blurb */}
              <p className="font-body text-metal-100/90 text-sm md:text-base leading-relaxed text-center">
                {project.blurb}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom 10-Project Flat Step Rail (Matches Main Menu & About Me Rail) */}
        <div className="mt-3.5 pt-2 border-t border-metal-100/10 flex items-center gap-1 sm:gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handlePrev}
            onMouseEnter={() => audioManager.play('hover')}
            aria-label="Previous project"
            className="px-2 py-1 text-metal-400/65 hover:text-accent-blue transition-colors cursor-pointer font-hud text-xs"
          >
            ‹
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {projects.map((p, idx) => {
              const isActive = p.id === focusedProjectId;
              const numCode = String(idx + 1).padStart(2, '0');
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (!isActive) {
                      audioManager.play('tab');
                      openProject(p.id);
                    }
                  }}
                  onMouseEnter={() => audioManager.play('hover')}
                  title={p.title}
                  className={`relative px-2 py-1 font-hud text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'text-metal-100'
                      : 'text-metal-400/45 hover:text-metal-100/80'
                  }`}
                >
                  <span>{numCode}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeProjectStepBar"
                      className="absolute bottom-0 inset-x-1 h-[1.5px] bg-accent-gold shadow-[0_0_10px_#FFC857]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            onMouseEnter={() => audioManager.play('hover')}
            aria-label="Next project"
            className="px-2 py-1 text-metal-400/65 hover:text-accent-blue transition-colors cursor-pointer font-hud text-xs"
          >
            ›
          </button>

          <span className="h-3 w-[1px] bg-metal-100/15 mx-1" />

          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={() => audioManager.play('hover')}
            className="px-2 py-1 font-hud text-[10px] tracking-[0.22em] uppercase text-accent-blue hover:text-metal-100 transition-colors cursor-pointer focus:outline-none"
          >
            RETURN // ORBIT
          </button>
        </div>
      </section>
    </>
  );
}

