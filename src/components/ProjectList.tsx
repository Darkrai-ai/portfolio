'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { audioManager } from '../audio/AudioManager';

const sortedSkills = [...skills].sort((a, b) => a.order - b.order);

const deckVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.07, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.18 } },
};

const plateVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
  },
};

export default function ProjectList() {
  const view = useAppStore((s) => s.view);
  const focusedPlanetId = useAppStore((s) => s.focusedPlanetId);
  const focusPlanet = useAppStore((s) => s.focusPlanet);
  const openProject = useAppStore((s) => s.openProject);

  if (view !== 'carousel') return null;

  const filteredProjects = projects.filter((p) =>
    p.skillIds.includes(focusedPlanetId)
  );

  const currentIdx = sortedSkills.findIndex((s) => s.id === focusedPlanetId);

  const handleStepOrbit = (dir: -1 | 1) => {
    audioManager.play('scroll');
    const nextIdx = (currentIdx + dir + sortedSkills.length) % sortedSkills.length;
    focusPlanet(sortedSkills[nextIdx].id);
  };

  return (
    <section
      aria-label="Main menu projects and orbital navigation"
      className="fixed bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-6 flex flex-col items-center pointer-events-none select-none"
    >
      {/* Micro Telemetry Label Above Flat Projects */}
      <div className="flex items-center gap-3 mb-2">
        <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-metal-100/25" />
        <span className="font-hud text-[9px] md:text-[10px] tracking-[0.34em] uppercase text-metal-400/70">
          {filteredProjects.length > 0
            ? `DEPLOYED PROJECTS  //  0${filteredProjects.length}`
            : 'ORBITAL STANDBY'}
        </span>
        <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-metal-100/25" />
      </div>

      {/* Flat Horizontal Perspective Project Plates */}
      <div className="w-full flex justify-center [perspective:950px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedPlanetId}
            variants={deckVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-wrap md:flex-nowrap items-end justify-center gap-4 md:gap-6"
          >
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, idx) => (
                <motion.button
                  key={project.id}
                  type="button"
                  variants={plateVariants}
                  onMouseEnter={() => audioManager.play('hover')}
                  onClick={() => {
                    audioManager.play('click');
                    openProject(project.id);
                  }}
                  className="pointer-events-auto cursor-pointer group relative text-left px-6 py-3 min-w-[220px] md:min-w-[265px]
                             bg-gradient-to-t from-metal-100/[0.07] via-metal-100/[0.02] to-transparent
                             hover:from-accent-blue/[0.15] hover:via-accent-blue/[0.04]
                             backdrop-blur-[3px]
                             [transform:rotateX(24deg)] hover:[transform:rotateX(0deg)_translateY(-4px)]
                             origin-bottom transition-all duration-300 ease-out focus:outline-none"
                >
                  {/* Corner Architectural Ticks */}
                  <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-metal-100/35 group-hover:border-accent-blue transition-colors duration-300" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-metal-100/35 group-hover:border-accent-blue transition-colors duration-300" />

                  {/* Glowing Flat Horizon Base Line */}
                  <span className="absolute bottom-0 inset-x-2 h-[1.5px] bg-gradient-to-r from-transparent via-metal-100/35 to-transparent group-hover:via-accent-blue group-hover:shadow-[0_0_16px_#4FC3F7] transition-all duration-300" />

                  <div className="flex items-center justify-between gap-5">
                    <div className="flex flex-col">
                      <span className="font-hud text-[9px] tracking-[0.28em] uppercase text-accent-blue/75 group-hover:text-accent-blue transition-colors">
                        {`SYS // 0${idx + 1}`}
                      </span>
                      <span className="mt-0.5 font-display text-sm md:text-base tracking-[0.1em] uppercase text-metal-100 group-hover:text-accent-blue group-hover:[text-shadow:0_0_14px_rgba(79,195,247,0.5)] transition-all duration-300 whitespace-nowrap">
                        {project.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-hud text-[9px] tracking-[0.22em] uppercase text-accent-blue opacity-0 -translate-x-1 group-hover:opacity-90 group-hover:translate-x-0 transition-all duration-300 hidden sm:inline">
                        VIEW
                      </span>
                      <span className="text-metal-400/60 group-hover:text-accent-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-sm">
                        ↗
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <motion.div
                variants={plateVariants}
                className="px-8 py-3 bg-gradient-to-t from-metal-100/[0.04] to-transparent [transform:rotateX(22deg)] origin-bottom relative"
              >
                <span className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-metal-100/25 to-transparent" />
                <span className="font-hud text-xs tracking-[0.24em] uppercase text-metal-400/60">
                  CLASSIFIED // DEPLOYMENT PENDING
                </span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cohesive Main Menu 8-Planet Flat Orbital Navigation Rail */}
      <div className="mt-4 pt-2.5 border-t border-metal-100/10 flex items-center gap-1 sm:gap-2 md:gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={() => handleStepOrbit(-1)}
          onMouseEnter={() => audioManager.play('hover')}
          aria-label="Previous planet"
          className="px-2 py-1 text-metal-400/65 hover:text-accent-blue transition-colors cursor-pointer font-hud text-xs"
        >
          ‹
        </button>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {sortedSkills.map((skill) => {
            const isActive = skill.id === focusedPlanetId;
            const shortCode = skill.planetName.slice(0, 3).toUpperCase();
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => {
                  if (!isActive) {
                    audioManager.play('tab');
                    focusPlanet(skill.id);
                  }
                }}
                onMouseEnter={() => audioManager.play('hover')}
                className={`relative px-2 md:px-2.5 py-1 font-hud text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'text-metal-100'
                    : 'text-metal-400/45 hover:text-metal-100/80'
                }`}
              >
                <span className="hidden md:inline text-[9px] text-accent-blue/65 mr-1">
                  {`0${skill.order}`}
                </span>
                <span>{shortCode}</span>

                {isActive && (
                  <motion.span
                    layoutId="activePlanetOrbitBar"
                    className="absolute bottom-0 inset-x-1 h-[1.5px] bg-accent-blue shadow-[0_0_10px_#4FC3F7]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleStepOrbit(1)}
          onMouseEnter={() => audioManager.play('hover')}
          aria-label="Next planet"
          className="px-2 py-1 text-metal-400/65 hover:text-accent-blue transition-colors cursor-pointer font-hud text-xs"
        >
          ›
        </button>
      </div>
    </section>
  );
}

