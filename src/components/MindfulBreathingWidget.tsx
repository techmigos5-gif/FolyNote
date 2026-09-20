import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';

export const MindfulBreathingWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase transitions
        if (phase === 'inhale') {
          setPhase('hold');
          return 4;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 4;
        } else {
          setPhase('inhale');
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(4);
    setCyclesCompleted(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In Calm';
      case 'hold':
        return 'Hold Tranquility';
      case 'exhale':
        return 'Release Tension';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale slowly like fresh mountain air...';
      case 'hold':
        return 'Let stillness fill your mind and body...';
      case 'exhale':
        return 'Breathe out all worry and daily noise...';
    }
  };

  return (
    <motion.div
      id="mindful-breathing-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7FD] via-white to-[#F4EEFA] p-6 sm:p-8 text-gray-900 border border-purple-200/80 shadow-lg ${className}`}
    >
      {/* Soft background ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Explanation */}
        <div className="max-w-md text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Nature Mindfulness</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            Pause, Breathe & Ground Yourself
          </h3>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            Take a 60-second tranquil break before entering your personal workspace or logging out. Synchronize your breath with the sunlit orb to restore creative focus.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="breathing-toggle-btn"
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Breathing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Begin Mindful Breath
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ rotate: -90, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="breathing-reset-btn"
              type="button"
              onClick={handleReset}
              title="Reset breath counter"
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 text-xs transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            {cyclesCompleted > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs text-purple-900 font-semibold flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
                {cyclesCompleted} {cyclesCompleted === 1 ? 'cycle' : 'cycles'} completed
              </motion.span>
            )}
          </div>
        </div>

        {/* Right Interactive Animated Breathing Sphere with Framer Motion */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Outer expanding ambient ripples */}
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.25 : phase === 'hold' ? 1.15 : 0.85,
                opacity: phase === 'inhale' ? 0.6 : phase === 'hold' ? 0.7 : 0.2,
              }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border-2 border-amber-400/50 pointer-events-none"
            />
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.28 : 0.95,
                opacity: phase === 'inhale' ? 0.35 : phase === 'hold' ? 0.45 : 0.1,
              }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border border-purple-400/30 pointer-events-none"
            />

            {/* Glowing gradient sphere */}
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.08 : 0.88,
              }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center text-center shadow-xl select-none transition-colors duration-1000 ${
                phase === 'inhale'
                  ? 'bg-gradient-to-tr from-amber-400 via-rose-400 to-purple-500 shadow-amber-500/30 ring-4 ring-amber-300/80'
                  : phase === 'hold'
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 shadow-purple-500/30 ring-4 ring-purple-300/80'
                  : 'bg-gradient-to-tr from-purple-100 via-pink-100 to-amber-100 shadow-purple-200/50 ring-2 ring-purple-200'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  className={`text-2xl sm:text-3xl font-black drop-shadow-xs ${phase === 'exhale' ? 'text-purple-950' : 'text-white'}`}
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>

              <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${phase === 'exhale' ? 'text-purple-900' : 'text-white/95'}`}>
                {getPhaseText()}
              </span>
            </motion.div>
          </div>

          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-xs text-gray-600 font-medium text-center italic"
          >
            &ldquo;{getPhaseInstruction()}&rdquo;
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};
