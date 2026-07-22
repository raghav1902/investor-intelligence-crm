'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Context ────────────────────────────────────────────────────────────────

interface TransitionCtx {
  /** true while the exit animation is running on the source page */
  isExiting: boolean;
  /**
   * Call this instead of router.push() to trigger the full
   * 3-phase transition: source exit → overlay → destination enter.
   */
  triggerTransition: (href: string) => void;
}

const TransitionContext = createContext<TransitionCtx>({
  isExiting: false,
  triggerTransition: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

// ─── Logo mark with breathing pulse ─────────────────────────────────────────

function OverlayMark() {
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1, 0.96] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500"
      >
        <span className="text-base font-bold text-[#010102] tracking-tight select-none">
          IQ
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
        className="text-xs text-content-muted tracking-widest uppercase"
      >
        Preparing your workspace…
      </motion.p>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  // Guard against double-triggers
  const inFlight = useRef(false);

  const triggerTransition = useCallback(
    (href: string) => {
      if (inFlight.current) return;
      inFlight.current = true;

      // Phase 1 — trigger source page exit (0.3 s)
      setIsExiting(true);

      setTimeout(() => {
        // Phase 2 — show overlay, navigate in the background
        setShowOverlay(true);
        // Flag the destination so it can run its enter animation
        try { sessionStorage.setItem('iq_enter_transition', '1'); } catch {}
        router.push(href);

        // Phase 3 — dismiss overlay after min overlay duration (550 ms)
        setTimeout(() => {
          setShowOverlay(false);
          setIsExiting(false);
          inFlight.current = false;
        }, 550);
      }, 300);
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ isExiting, triggerTransition }}>
      {children}

      {/* Full-screen transition overlay — rendered above everything else */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="iq-page-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-base"
            // Prevent any pointer events bleeding through
            style={{ pointerEvents: 'all' }}
          >
            <OverlayMark />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
