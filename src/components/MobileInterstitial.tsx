'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function MobileInterstitial() {
  const isMobile = useAppStore((s) => s.isMobile);
  const [dismissed, setDismissed] = useState(false);

  if (!isMobile || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-void/90 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="glass-panel p-8 max-w-sm text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="font-display text-xl text-metal-100 mb-3">
            Bigger Screen Recommended
          </h2>
          <p className="text-metal-400 text-sm mb-6 leading-relaxed">
            This experience is built for bigger screens — you&apos;re welcome to
            continue anyway for a simpler version.
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="px-6 py-3 rounded-lg border border-accent-blue text-accent-blue
                       hover:bg-accent-blue/10 transition-colors font-body text-sm"
          >
            Continue anyway →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
