import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, X, Music4 } from 'lucide-react';
import { SOUNDSCAPES, SoundscapeId } from '../lib/sounds';

interface SoundscapeBarProps {
  current: SoundscapeId;
  volume: number;
  onSelect: (id: SoundscapeId) => void;
  onVolume: (v: number) => void;
  onStop: () => void;
}

/** Floating ambient-sound mini player (bottom-left) while a soundscape plays. */
export const SoundscapeBar: React.FC<SoundscapeBarProps> = ({ current, volume, onSelect, onVolume, onStop }) => {
  const active = SOUNDSCAPES.find((s) => s.id === current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/95 dark:bg-[#241b31]/95 backdrop-blur shadow-xl shadow-accent-900/10 border border-gray-100 dark:border-gray-800"
      role="region"
      aria-label="Ambient soundscape player"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-500 to-accent-700 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <Music4 className="w-4 h-4 text-white" />
      </motion.div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight flex items-center gap-1.5">
          {active?.emoji} {active?.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <button
            type="button"
            onClick={() => onVolume(volume > 0 ? 0 : 0.55)}
            aria-label={volume > 0 ? 'Mute' : 'Unmute'}
            className="text-gray-400 hover:text-accent-600 transition cursor-pointer"
          >
            {volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolume(Number(e.target.value) / 100)}
            aria-label="Soundscape volume"
            className="w-20 h-1 accent-accent-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-gray-100 dark:border-gray-800">
        {SOUNDSCAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.name}
            aria-label={`Switch to ${s.name}`}
            onClick={() => onSelect(s.id)}
            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer ${
              s.id === current ? 'bg-accent-100 dark:bg-accent-900/60' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onStop}
        aria-label="Stop soundscape"
        className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
