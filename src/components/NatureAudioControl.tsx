import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Wind, Bell, Waves, Sparkles } from 'lucide-react';
import { natureAudio } from '../utils/natureAudio';

export const NatureAudioControl: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'breeze' | 'chime' | 'water'>('breeze');
  const [volume, setVolume] = useState(0.4);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      natureAudio.stop();
    };
  }, []);

  const handleToggle = () => {
    const active = natureAudio.toggle(mode);
    setIsPlaying(active);
  };

  const handleSelectMode = (newMode: 'breeze' | 'chime' | 'water') => {
    setMode(newMode);
    natureAudio.play(newMode);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    natureAudio.setVolume(val);
  };

  const handleSingingBowlChime = () => {
    natureAudio.playSingingBowl();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1.5">
        <button
          id="nature-audio-toggle-btn"
          type="button"
          onClick={handleToggle}
          title={isPlaying ? 'Pause nature sounds' : 'Play peaceful nature sounds'}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition backdrop-blur-md cursor-pointer ${
            isPlaying
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs shadow-amber-500/10'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-purple-200/80 shadow-xs'
          }`}
        >
          {isPlaying ? (
            <>
              <div className="flex items-end gap-0.5 h-3.5 w-3">
                <span className="w-0.5 bg-amber-600 animate-pulse h-2.5 rounded-full" />
                <span className="w-0.5 bg-amber-600 animate-pulse h-3.5 delay-75 rounded-full" />
                <span className="w-0.5 bg-amber-600 animate-pulse h-1.5 delay-150 rounded-full" />
              </div>
              <span className="capitalize font-semibold text-amber-900">{mode}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
              <span>Nature Ambience</span>
            </>
          )}
        </button>

        <button
          id="nature-audio-menu-btn"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          title="Audio settings"
          className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-purple-700 border border-purple-200/80 text-xs transition cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-purple-100 shadow-xl text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
            <span className="text-xs font-semibold tracking-wide text-purple-900">
              Calm Nature Soundscapes
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>

          {/* Soundscape Options */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => handleSelectMode('breeze')}
              className={`p-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
                mode === 'breeze' && isPlaying
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-gray-50 hover:bg-purple-50 text-gray-700 border border-transparent'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-amber-600" />
              <span>Breeze</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('chime')}
              className={`p-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
                mode === 'chime' && isPlaying
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                  : 'bg-gray-50 hover:bg-purple-50 text-gray-700 border border-transparent'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-purple-600" />
              <span>Chimes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('water')}
              className={`p-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition cursor-pointer ${
                mode === 'water' && isPlaying
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold'
                  : 'bg-gray-50 hover:bg-purple-50 text-gray-700 border border-transparent'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-cyan-600" />
              <span>Lakeshore</span>
            </button>
          </div>

          {/* One-off singing bowl chime button */}
          <button
            type="button"
            onClick={handleSingingBowlChime}
            className="w-full py-1.5 px-2.5 mb-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Bell className="w-3 h-3 text-purple-600" />
            <span>Ring Meditative Bowl</span>
          </button>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Volume
              </span>
              <span className="font-semibold text-gray-700">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
