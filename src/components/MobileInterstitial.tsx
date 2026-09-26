'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { audioManager } from '../audio/AudioManager';

export default function MobileInterstitial() {
  const isMobile = useAppStore((s) => s.isMobile);
  const [dismissed, setDismissed] = useState(false);

  if (!isMobile || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-void/90 backdrop-blur-sm p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative glass-panel p-7 max-w-sm text-center border border-metal-100/15">
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-accent-blue/60" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-accent-blue/60" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-accent-blue/60" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-accent-blue/60" />

          <div className="font-hud text-[10px] tracking-[0.3em] uppercase text-accent-blue mb-2">
            DISPLAY TELEMETRY // NOTICE
          </div>
          <h2 className="font-display text-xl text-metal-100 mb-3 tracking-wide uppercase">
            Built for a Bigger Screen
          </h2>
          <p className="text-metal-400 text-sm mb-6 leading-relaxed">
            This 3D solar system experience is designed for desktop screens —
            you&apos;re welcome to continue on mobile and swipe to explore the orbit.
          </p>
          <button
            onClick={() => {
              audioManager.play('click');
              setDismissed(true);
            }}
            className="px-6 py-3 rounded-lg border border-accent-blue text-accent-blue
                       hover:bg-accent-blue/10 active:bg-accent-blue/20 transition-colors font-hud text-xs tracking-[0.2em] uppercase cursor-pointer"
          >
            Continue anyway &rarr;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
