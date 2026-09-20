import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Wind } from 'lucide-react';
import { playChime } from '../lib/sounds';

type Pattern = 'box' | '478';

interface Phase {
  label: string;
  seconds: number;
  scale: number;
}

const PATTERNS: Record<Pattern, { name: string; phases: Phase[] }> = {
  box: {
    name: 'Box Breathing',
    phases: [
      { label: 'Breathe in', seconds: 4, scale: 1.35 },
      { label: 'Hold', seconds: 4, scale: 1.35 },
      { label: 'Breathe out', seconds: 4, scale: 1 },
      { label: 'Hold', seconds: 4, scale: 1 },
    ],
  },
  '478': {
    name: '4 · 7 · 8 Relaxing Breath',
    phases: [
      { label: 'Breathe in', seconds: 4, scale: 1.35 },
      { label: 'Hold', seconds: 7, scale: 1.35 },
      { label: 'Breathe out', seconds: 8, scale: 1 },
    ],
  },
};

interface BreathingOverlayProps {
  open: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const BreathingOverlay: React.FC<BreathingOverlayProps> = ({ open, onClose, soundEnabled }) => {
  const [pattern, setPattern] = useState<Pattern>('box');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PATTERNS.box.phases[0].seconds);
  const [breaths, setBreaths] = useState(0);
  const [started, setStarted] = useState(false);
  const chimeRef = useRef(soundEnabled);
  chimeRef.current = soundEnabled;

  const phases = PATTERNS[pattern].phases;

  // Reset when opened
  useEffect(() => {
    if (open) {
      setPhaseIndex(0);
      setSecondsLeft(PATTERNS[pattern].phases[0].seconds);
      setBreaths(0);
      setStarted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Phase engine
  useEffect(() => {
    if (!open || !started) return;
    if (secondsLeft <= 0) {
      const nextIndex = (phaseIndex + 1) % phases.length;
      if (nextIndex === 0) setBreaths((b) => b + 1); // completed a full cycle
      setPhaseIndex(nextIndex);
      setSecondsLeft(phases[nextIndex].seconds);
      if (chimeRef.current) playChime(0.15, nextIndex === 0 ? 660 : 528);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, started, secondsLeft, phaseIndex, phases]);

  const phase = phases[phaseIndex];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-gradient-to-b from-[#1b1424]/95 via-[#241b31]/97 to-[#1b1424]/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Calm breathing exercise"
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calm break"
            className="absolute top-5 right-5 p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <Wind className="w-4 h-4" aria-hidden="true" />
            Calm Break
          </div>

          {/* Breathing circle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Halo rings */}
            <motion.div
              animate={{ scale: started ? phase.scale : 1, opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: started ? phase.seconds : 3, ease: 'easeInOut', repeat: started ? Infinity : 0, repeatType: 'reverse' }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-500/40 to-accent-300/25 blur-2xl"
            />
            <motion.div
              animate={{ scale: started ? phase.scale : 1 }}
              transition={{ duration: started ? phase.seconds : 1.5, ease: 'easeInOut' }}
              className="absolute inset-6 rounded-full border border-accent-300/40"
            />
            <motion.div
              animate={{ scale: started ? phase.scale : 1 }}
              transition={{ duration: started ? phase.seconds : 1.5, ease: 'easeInOut' }}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-accent-600 to-accent-400 shadow-2xl shadow-accent-600/40 flex items-center justify-center"
            >
              <img src="/brand.png" alt="" aria-hidden="true" className="w-16 h-16 drop-shadow-lg" />
            </motion.div>
          </div>

          {/* Phase label */}
          <div className="mt-10 text-center h-20">
            {started ? (
              <>
                <motion.p
                  key={phase.label + phaseIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-semibold text-white"
                >
                  {phase.label}
                </motion.p>
                <p className="text-4xl font-light text-accent-200 mt-2 tabular-nums">{secondsLeft}</p>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-white/90 max-w-xs mx-auto">
                  Take a moment. Follow the circle and let your thoughts settle.
                </p>
                <div className="flex items-center justify-center gap-2">
                  {(Object.keys(PATTERNS) as Pattern[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPattern(p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        pattern === p ? 'bg-accent-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {PATTERNS[p].name}
                    </button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => { setStarted(true); if (chimeRef.current) playChime(0.15, 660); }}
                  className="mt-2 px-8 py-3 rounded-2xl bg-white text-[#241b31] text-sm font-bold shadow-xl cursor-pointer"
                >
                  Begin
                </motion.button>
              </div>
            )}
          </div>

          {/* Stats */}
          {started && (
            <p className="absolute bottom-8 text-white/50 text-xs font-medium">
              {breaths} {breaths === 1 ? 'breath' : 'breaths'} taken — press Esc or ✕ to return
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
