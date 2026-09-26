'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  layoutId?: string;
}

export default function GlassPanel({
  children,
  className = '',
  animate = true,
  layoutId,
}: GlassPanelProps) {
  if (!animate) {
    return (
      <div className={`glass-panel ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-panel ${className}`}
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
