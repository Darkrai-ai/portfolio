'use client';

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { audioManager } from '../audio/AudioManager';

export default function Wordmark() {
  const { introCompleted, view, openAboutMe, exitAboutMe } = useAppStore();

  if (!introCompleted && view === 'intro') {
    return null;
  }

  const handleClick = () => {
    audioManager.play('click');
    if (view === 'about') {
      exitAboutMe();
    } else {
      openAboutMe();
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => audioManager.play('hover')}
      className="fixed top-4 left-4 md:top-7 md:left-7 z-[70] group flex items-center gap-2 md:gap-3 cursor-pointer select-none focus:outline-none"
      aria-label="About me"
    >
      <span
        className="font-display text-base md:text-xl tracking-wider text-metal-100 drop-shadow-[0_2px_10px_rgba(5,7,13,0.95)]
                   group-hover:text-accent-blue group-hover:[text-shadow:0_0_12px_#4FC3F7] transition-all duration-300"
      >
        Utsaphire.
      </span>

      <span className="flex items-center gap-1.5 font-hud text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.28em] uppercase text-metal-400/65 sm:text-metal-400/55 group-hover:text-accent-blue/90 transition-colors duration-300">
        <span className="w-1 h-1 rounded-full bg-accent-blue/60 group-hover:bg-accent-blue group-hover:shadow-[0_0_8px_#4FC3F7] transition-all" />
        <span>{view === 'about' ? 'RETURN // ORBIT' : 'DOSSIER // ABOUT'}</span>
      </span>
    </button>
  );
}

