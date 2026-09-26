'use client';

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { skills } from '../data/skills';
import { ScrambleText } from './ScrambleText';

export default function SkillPanel() {
  const view = useAppStore((s) => s.view);
  const focusedPlanetId = useAppStore((s) => s.focusedPlanetId);
  const isSpinning = useAppStore((s) => s.isSpinning);

  if (view !== 'carousel') return null;

  const currentSkill = skills.find((s) => s.id === focusedPlanetId);
  if (!currentSkill) return null;

  return (
    <header className="fixed top-7 md:top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center pointer-events-none select-none">
      {/* Orbital Index & Domain Telemetry Eyebrow */}
      <div className="flex items-center gap-3 md:gap-4">
        <span className="w-8 md:w-14 h-[1px] bg-gradient-to-r from-transparent to-metal-100/35" />
        <span className="font-hud text-[10px] md:text-[11px] tracking-[0.34em] uppercase text-metal-400/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          <ScrambleText
            text={`0${currentSkill.order} / 08  //  ${currentSkill.groupName.toUpperCase()}`}
            scrambling={isSpinning}
            duration={420}
            charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/"
          />
        </span>
        <span className="w-8 md:w-14 h-[1px] bg-gradient-to-l from-transparent to-metal-100/35" />
      </div>

      {/* Main Planet Title (No Frosted Glass, Scrambles on Change & Spin) */}
      <h1 className="mt-2 font-display text-4xl md:text-[3.35rem] leading-none tracking-[0.2em] uppercase text-metal-100 drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
        <ScrambleText
          text={currentSkill.planetName.toUpperCase()}
          scrambling={isSpinning}
          duration={480}
          charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        />
      </h1>

      {/* Delicate Center Hairline Divider */}
      <div className="w-28 md:w-44 h-[1px] bg-gradient-to-r from-transparent via-accent-blue/45 to-transparent my-2.5" />

      {/* Skills Row Below Planet Title (No Frosted Glass, Scrambles on Change & Spin) */}
      <div className="font-hud text-xs md:text-sm tracking-[0.26em] uppercase text-accent-blue drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
        <ScrambleText
          text={currentSkill.techs.join('   •   ')}
          scrambling={isSpinning}
          duration={540}
          charSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+."
        />
      </div>
    </header>
  );
}

