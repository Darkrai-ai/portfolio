'use client';

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { audioManager } from '../audio/AudioManager';

export function MuteControl() {
  const view = useAppStore((state) => state.view);
  const introCompleted = useAppStore((state) => state.introCompleted);
  const muted = useAppStore((state) => state.muted);
  const toggleMute = useAppStore((state) => state.toggleMute);

  if (!introCompleted && view === 'intro') {
    return null;
  }

  const handleToggle = () => {
    const nextMuted = !muted;
    toggleMute();
    audioManager.setMuted(nextMuted);
    if (!nextMuted) {
      audioManager.play('click');
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => audioManager.play('hover')}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      className="fixed top-7 right-7 z-[70] group flex items-center gap-2.5 px-3 py-1.5 cursor-pointer select-none
                 text-metal-100/80 hover:text-accent-blue transition-all duration-300 focus:outline-none"
    >
      <span className="hidden sm:inline font-hud text-[9px] tracking-[0.28em] uppercase text-metal-400/65 group-hover:text-accent-blue transition-colors">
        {muted ? 'AUDIO // OFF' : 'AUDIO // LIVE'}
      </span>

      {/* Minimalist Equalizer / Signal Bars */}
      <span className="flex items-end gap-[3px] h-3.5">
        <span
          className={`w-[2px] rounded-full transition-all duration-300 ${
            muted
              ? 'h-1 bg-metal-400/40'
              : 'h-2.5 bg-accent-blue shadow-[0_0_8px_#4FC3F7] animate-pulse'
          }`}
        />
        <span
          className={`w-[2px] rounded-full transition-all duration-300 ${
            muted
              ? 'h-1 bg-metal-400/40'
              : 'h-3.5 bg-accent-blue shadow-[0_0_8px_#4FC3F7]'
          }`}
        />
        <span
          className={`w-[2px] rounded-full transition-all duration-300 ${
            muted
              ? 'h-1 bg-metal-400/40'
              : 'h-2 bg-accent-blue shadow-[0_0_8px_#4FC3F7] animate-pulse'
          }`}
        />
      </span>
    </button>
  );
}

export default MuteControl;

