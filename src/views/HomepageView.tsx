import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Pin, 
  Folder, 
  Lightbulb, 
  Tag, 
  ShieldCheck, 
  Lock, 
  WifiOff, 
  Download, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  Heart, 
  Eye, 
  RotateCw,
  LogOut,
  User,
  Layers,
  ChevronRight,
  Maximize2,
  Scale,
  Shield,
  FileText
} from 'lucide-react';
import { NavView, UserProfile } from '../types';
import { NatureParticles } from '../components/NatureParticles';
import { NatureAudioControl } from '../components/NatureAudioControl';
import { MindfulBreathingWidget } from '../components/MindfulBreathingWidget';
import { BoySunsetIllustration } from '../components/BoySunsetIllustration';
import { useHeroArtwork } from '../hooks/useHeroArtwork';
import { TrustPrivacyModal, TrustModalTab } from '../components/TrustPrivacyModal';

interface HomepageViewProps {
  user: UserProfile;
  onEnterApp: () => void;
  onNavigateView: (view: NavView) => void;
  onLogout?: () => void;
  thoughtsCount?: number;
  docsCount?: number;
  ideasCount?: number;
  pinnedCount?: number;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  user,
  onEnterApp,
  onNavigateView,
  onLogout,
  thoughtsCount = 0,
  docsCount = 0,
  ideasCount = 0,
  pinnedCount = 0,
}) => {
  // Shared hero artwork state (synced with login view and local cache)
  const { activeImage, handleImageError } = useHeroArtwork();

  // Interactive Sandbox Tab State
  const [activeTab, setActiveTab] = useState<'thoughts' | 'pinboard' | 'docs' | 'ideas'>('thoughts');
  const [trustModalTab, setTrustModalTab] = useState<TrustModalTab | null>(null);

  // Interactive Thoughts Demo State
  const [demoMood, setDemoMood] = useState('Peaceful 🌿');
  const [demoThoughtText, setDemoThoughtText] = useState(
    'Sitting quietly by the lake as dusk approaches. The golden light over the mountains brings total clarity.'
  );
  const [demoIsPinned, setDemoIsPinned] = useState(false);

  // Interactive Pinboard Demo State
  const [stickyNotes, setStickyNotes] = useState([
    { id: 1, color: 'bg-amber-100 text-amber-900 border-amber-300', tag: 'Note', title: 'Mountain Trail Note', text: 'Pack hiking boots, thermal sweater, and journal.' },
    { id: 2, color: 'bg-pink-100 text-pink-900 border-pink-300', tag: 'Idea', title: 'Sunset Creative Project', text: 'Capture watercolor landscape from the cliff edge.' },
    { id: 3, color: 'bg-blue-100 text-blue-900 border-blue-300', tag: 'Doc', title: 'Annual Roadmap PDF', text: '32 pages • Focus on sustainable offline workflows.' },
    { id: 4, color: 'bg-purple-100 text-purple-900 border-purple-300', tag: 'Thought', title: 'Evening Reflection', text: 'Stillness is not the absence of energy, but its harmony.' },
  ]);

  // Interactive Doc Reader State
  const [docZenMode, setDocZenMode] = useState(false);

  // Interactive Idea Spark Generator State
  const samplePrompts = [
    { title: 'Silent Forest Walking Meditation', desc: 'Leave devices behind for 30 minutes and record three sensory sounds you never noticed before.', tag: 'Mindfulness' },
    { title: 'Offline-First Philosophy Manifesto', desc: 'Draft a short guide on why keeping sensitive personal thoughts off remote clouds protects authentic creativity.', tag: 'Philosophy' },
    { title: 'Alpine Sunset Sketch Series', desc: 'Combine raw charcoal outlines with warm peach and lavender watercolor washes.', tag: 'Art' },
    { title: 'Micro-Habit: 10-Minute Dusk Journaling', desc: 'Sit by an open window or natural light right as daylight fades to review the day without judgment.', tag: 'Habits' },
  ];
  const [sparkIndex, setSparkIndex] = useState(0);
  const [sparkLiked, setSparkLiked] = useState(false);

  const handleNextSpark = () => {
    setSparkIndex((prev) => (prev + 1) % samplePrompts.length);
    setSparkLiked(false);
  };

  const handleDownloadBackupPreview = () => {
    const previewData = {
      app: 'FolyNote',
      exportDate: new Date().toISOString(),
      user: { name: user.name, mobile: user.mobile },
      stats: { thoughtsCount, docsCount, ideasCount, pinnedCount },
      privacyStatement: 'This file never leaves your browser. Zero cloud transmission.',
    };
    const blob = new Blob([JSON.stringify(previewData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folynote-backup-preview-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8FC] via-[#F6F3FA] to-[#EFEAF6] text-gray-900 font-sans selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-purple-100 shadow-xs transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-2 ring-purple-100">
              <img src="/icon.svg" alt="FolyNote Logo" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-gray-950">
                  FolyNote
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Your files. Your thoughts. Your space.
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Your files. Your thoughts. Your space.
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-600">
            <a href="#features" className="hover:text-purple-900 transition">
              Four Pillars
            </a>
            <a href="#sandbox" className="hover:text-purple-900 transition">
              Interactive Sandbox
            </a>
            <a href="#breathing" className="hover:text-purple-900 transition">
              Mindful Breath
            </a>
            <a href="#trust" className="hover:text-purple-900 transition">
              Trust & Privacy
            </a>
          </nav>

          {/* Controls & CTA */}
          <div className="flex items-center gap-3">
            {/* Nature Audio Synthesizer */}
            <NatureAudioControl />

            {/* Auth Button */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-enter-app-btn"
                  type="button"
                  onClick={() => onEnterApp()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    type="button"
                    onClick={onLogout}
                    title="Safely logout"
                    className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 transition cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                type="button"
                onClick={onEnterApp}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Authentic Sunset Nature Backdrop & Floating Particles */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Floating Glowing Sunset Fireflies Canvas */}
        <NatureParticles count={50} />

        {/* Ambient Gradient Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-purple-200/50 via-pink-200/40 to-amber-200/40 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-purple-200/80 text-purple-900 text-xs font-semibold backdrop-blur-md shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '10s' }} />
                <span>Calm • Distraction-Free • Authentic Nature Focus</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-950 leading-tight"
              >
                A Peaceful Haven for Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600">
                  Thoughts, Ideas & Documents
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
              >
                Step into a serene mental sanctuary inspired by twilight mountains and tranquil lakes. Capture daily reflections, organize important documents, and pin creative sparks in a private space where your focus remains whole.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="hero-enter-btn"
                  type="button"
                  onClick={onEnterApp}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white text-sm font-bold transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>{user.isLoggedIn ? 'Go to Your Workspace' : 'Enter Your Sanctuary'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#sandbox"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-purple-50/60 border border-purple-200 text-purple-950 text-sm font-bold transition backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Try Interactive Sandbox</span>
                </motion.a>
              </motion.div>

              {/* Trust Badges Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <motion.div 
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-2.5 rounded-xl bg-white border border-purple-100/90 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md hover:border-amber-200"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>100% Private</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Isolated in browser</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-2.5 rounded-xl bg-white border border-purple-100/90 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md hover:border-pink-200"
                >
                  <div className="flex items-center gap-1.5 text-pink-800 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-pink-600" />
                    <span>PIN Shield</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Personal access code</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-2.5 rounded-xl bg-white border border-purple-100/90 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md hover:border-purple-200"
                >
                  <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
                    <WifiOff className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                    <span>Offline Ready</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">PWA mobile & desktop</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-2.5 rounded-xl bg-white border border-purple-100/90 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md hover:border-emerald-200"
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Download className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Zero Lock-in</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">1-click JSON export</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Hero Artwork Showcase (Boy on Rock Lake Sunset - ChatGPT artwork) */}
            <div className="lg:col-span-5 relative">
              {/* Ambient Radiant Sunset Backlight Aura */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-4 bg-gradient-to-tr from-amber-400/30 via-pink-400/25 to-purple-500/30 rounded-3xl blur-2xl pointer-events-none"
              />

              <motion.div 
                id="homepage-hero-artwork-card"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/15 border border-purple-200/80 bg-white group"
              >
                {/* Artwork Window */}
                <div className="aspect-[4/5] w-full relative overflow-hidden">
                  {activeImage ? (
                    <motion.img
                      id="homepage-hero-image"
                      src={activeImage}
                      alt="Sunset at the Ridge - ChatGPT Sunset Artwork"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.7 }}
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <BoySunsetIllustration className="w-full h-full" />
                  )}

                  {/* Subtle glass floating card */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/92 backdrop-blur-md border border-purple-100/90 text-gray-900 shadow-lg shadow-purple-950/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} /> 
                          <span>Sunset at the Ridge</span>
                        </p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Quiet contemplation over the twilight mountain lake
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-900 text-[10px] font-extrabold tracking-wider shadow-2xs">
                        SANCTUARY
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Data Stats Ribbon (Shows actual continuity of the user's space) */}
      <section className="py-6 bg-white border-y border-purple-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70 shadow-2xs hover:shadow-md transition-shadow"
            >
              <span className="text-2xl sm:text-3xl font-black text-amber-600">
                {thoughtsCount}
              </span>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                Daily Reflections Logged
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70 shadow-2xs hover:shadow-md transition-shadow"
            >
              <span className="text-2xl sm:text-3xl font-black text-pink-600">
                {pinnedCount}
              </span>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                Sticky Notes on Board
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70 shadow-2xs hover:shadow-md transition-shadow"
            >
              <span className="text-2xl sm:text-3xl font-black text-blue-600">
                {docsCount}
              </span>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                Vault Documents & PDFs
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70 shadow-2xs hover:shadow-md transition-shadow"
            >
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {ideasCount}
              </span>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                Creative Sparks Captured
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Four Pillars Feature Matrix */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Thoughtfully Crafted Functionality
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Four Pillars of Your Quiet Workspace
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Every feature in FolyNote is deliberately tuned to reduce anxiety, declutter your mind, and provide seamless access to what matters most.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group p-6 rounded-3xl bg-white border border-purple-100 hover:border-amber-400/60 transition-colors duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Thoughts</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Reflective daily journaling with timestamping, mood tags, markdown formatting, and a fast date-picker timeline.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Mindful Journal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </div>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group p-6 rounded-3xl bg-white border border-purple-100 hover:border-pink-400/60 transition-colors duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-pink-500/10"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-800 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
                <Pin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sticky Board</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tactile sticky notes in yellow, pink, blue, and purple. Pin key insights, todos, and documents directly onto your active canvas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-pink-700">
              <span>Visual Sticky Wall</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </div>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group p-6 rounded-3xl bg-white border border-purple-100 hover:border-blue-400/60 transition-colors duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Document Vault</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Multi-format reader for PDFs, Markdown, and notes with split-page view, chapter index, page counting, and search.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Zen Document Reader</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </div>
          </motion.div>

          {/* Pillar 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group p-6 rounded-3xl bg-white border border-purple-100 hover:border-purple-400/60 transition-colors duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ideas Incubator</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                A spark repository for raw inspirations. Star your favorites, categorize with smart tags, and filter effortlessly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Spark Repository</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Interactive Sandbox / Live Playground */}
      <section id="sandbox" className="py-16 bg-[#F7F4FB] border-y border-purple-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-800 bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
              Interactive Live Playground
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              Try the FolyNote Experience Live
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Test drive the interface below. Everything is active, responsive, and tactile.
            </p>
          </div>

          {/* Sandbox Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'thoughts' as const, label: 'Daily Thoughts', icon: BookOpen, color: 'text-amber-600' },
              { id: 'pinboard' as const, label: 'Sticky Pinboard', icon: Pin, color: 'text-pink-600' },
              { id: 'docs' as const, label: 'Document Reader', icon: Folder, color: 'text-blue-600' },
              { id: 'ideas' as const, label: 'Ideas Spark', icon: Lightbulb, color: 'text-purple-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sandbox-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected ? 'text-gray-950' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeSandboxTabPill"
                      className="absolute inset-0 bg-white rounded-xl border border-purple-200 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sandbox Interactive Surface */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Tab 1: Daily Thoughts Live Demo */}
              {activeTab === 'thoughts' && (
                <motion.div 
                  key="thoughts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span>Interactive Thought Composer</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                          Live Preview
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select your mood, write an entry, and watch it structure into your timeline.
                      </p>
                    </div>

                    {/* Mood Selector Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['Peaceful 🌿', 'Reflective 🌅', 'Inspired ✨', 'Grateful 🌸'].map((m) => (
                        <motion.button
                          key={m}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setDemoMood(m)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                            demoMood === m
                              ? 'bg-purple-700 text-white font-bold shadow-xs'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100'
                          }`}
                        >
                          {m}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Side */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-700">
                        Scratchpad Input:
                      </label>
                      <textarea
                        value={demoThoughtText}
                        onChange={(e) => setDemoThoughtText(e.target.value)}
                        rows={4}
                        className="w-full p-3.5 rounded-2xl bg-[#FAF8FC] border border-purple-200 text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white resize-none transition"
                        placeholder="What is on your mind right now?"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setDemoIsPinned((prev) => !prev)}
                          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                            demoIsPinned
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Pin className="w-3 h-3 text-amber-600" />
                          <span>{demoIsPinned ? 'Pinned to Board' : 'Pin to Board'}</span>
                        </motion.button>

                        <button
                          type="button"
                          onClick={() =>
                            setDemoThoughtText(
                              'Fresh mountain breeze through the window. Setting my intentions for an unhurried, focused afternoon.'
                            )
                          }
                          className="text-purple-700 hover:text-purple-900 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                        >
                          Insert Serene Sample
                        </button>
                      </div>
                    </div>

                    {/* Rendered Preview Side */}
                    <motion.div 
                      layout
                      className="p-4 rounded-2xl bg-[#FCFAFE] text-gray-900 shadow-xs space-y-3 border border-purple-100 border-l-4 border-l-purple-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                          Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold">
                            {demoMood}
                          </span>
                          {demoIsPinned && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold flex items-center gap-0.5 border border-amber-200">
                              <Pin className="w-2.5 h-2.5 text-amber-600" /> Pinned
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-serif">
                        {demoThoughtText || 'Write something on the left to see it format here...'}
                      </p>
                      <div className="pt-2 flex items-center gap-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                        <span>#mindfulness</span>
                        <span>#evening</span>
                        <span>#clarity</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Sticky Pinboard Live Demo */}
              {activeTab === 'pinboard' && (
                <motion.div 
                  key="pinboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Tactile Sticky Canvas</h3>
                      <p className="text-xs text-gray-500">
                        Visual memory anchors. Click any note to flip or toggle its color tone.
                      </p>
                    </div>
                    <span className="text-xs text-purple-700 font-bold">
                      {stickyNotes.length} pinned cards
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {stickyNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        layout
                        whileHover={{ scale: 1.05, rotate: -1.5, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`p-4 rounded-2xl border-2 ${note.color} shadow-sm cursor-pointer flex flex-col justify-between h-44`}
                        onClick={() => {
                          setStickyNotes((prev) =>
                            prev.map((n) =>
                              n.id === note.id
                                ? {
                                    ...n,
                                    color:
                                      n.color.includes('amber')
                                        ? 'bg-pink-100 text-pink-900 border-pink-300'
                                        : n.color.includes('pink')
                                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                                        : n.color.includes('blue')
                                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300',
                                  }
                                : n
                            )
                          );
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-black/10">
                              {note.tag}
                            </span>
                            <Pin className="w-3.5 h-3.5 fill-current opacity-70" />
                          </div>
                          <h4 className="text-xs font-bold leading-snug">{note.title}</h4>
                          <p className="text-[11px] mt-1.5 opacity-90 leading-relaxed font-sans">
                            {note.text}
                          </p>
                        </div>
                        <span className="text-[9px] opacity-60 text-right font-medium">Click to re-color</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Document Reader Live Demo */}
              {activeTab === 'docs' && (
                <motion.div 
                  key="docs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Zen Document Reader</h3>
                      <p className="text-xs text-gray-500">
                        Distraction-free typography engineered for high-density reading and focus.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setDocZenMode((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        docZenMode
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{docZenMode ? 'Exit Zen Mode' : 'Toggle Zen Focus'}</span>
                    </motion.button>
                  </div>

                  <motion.div
                    layout
                    className={`p-6 rounded-2xl transition-all duration-300 ${
                      docZenMode
                        ? 'bg-[#FFFDF8] text-gray-900 border-2 border-amber-300 shadow-md ring-4 ring-amber-100/70'
                        : 'bg-[#FAF8FC] text-gray-900 border border-purple-100 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          DOCUMENT PREVIEW • PDF SPEC
                        </span>
                        <h4 className="text-base font-bold text-gray-900">Personal Knowledge Architecture v2.4</h4>
                      </div>
                      <span className="text-xs font-medium text-gray-500">Page 1 of 14</span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm leading-relaxed max-w-2xl font-serif text-gray-800">
                      <p>
                        <strong className="text-gray-950">1. Principles of Sovereign Notes:</strong> When creative output is stored exclusively within local client-side domains, psychological safety increases. The fear of algorithmic surveillance or third-party scrutiny dissipates completely.
                      </p>
                      <p className="text-gray-700">
                        <strong className="text-gray-950">2. The Rhythm of Sunset:</strong> Design interfaces must incorporate calming palettes—warm ambers, twilight violets, and earthen greens—which naturally lower cortisol and stimulate contemplation.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Tab 4: Ideas Spark Box Live Demo */}
              {activeTab === 'ideas' && (
                <motion.div 
                  key="ideas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Creative Spark Incubator</h3>
                      <p className="text-xs text-gray-500">
                        Roll inspiring prompts or record thoughts before they vanish into the breeze.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleNextSpark}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Roll Next Spark</span>
                    </motion.button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={sparkIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider border border-purple-200">
                            {samplePrompts[sparkIndex].tag}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">Prompt #{sparkIndex + 1}</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900">
                          {samplePrompts[sparkIndex].title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-xl">
                          {samplePrompts[sparkIndex].desc}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setSparkLiked((prev) => !prev)}
                        className={`p-3 rounded-2xl border transition cursor-pointer shrink-0 ${
                          sparkLiked
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                            : 'bg-white text-gray-600 border-purple-200 hover:text-gray-900 hover:bg-gray-50 shadow-xs'
                        }`}
                        title="Star this spark"
                      >
                        <Heart className={`w-5 h-5 ${sparkLiked ? 'fill-current text-white' : 'text-gray-400'}`} />
                      </motion.button>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. Mindful Breathing Companion Section */}
      <section id="breathing" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <MindfulBreathingWidget />
      </section>

      {/* 7. Trust & Security Architecture */}
      <section id="trust" className="py-20 bg-[#FAF7FD] border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Trust & Privacy Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Designed for Privacy, Not Surveillance
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              In a digital world that monetizes your attention and reads your private journals, FolyNote is your unbreachable personal space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3 hover:shadow-xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Browser Storage Only</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Your entries and files remain in your personal browser storage sandbox. We operate zero cloud databases that harvest or inspect your notes.
              </p>
              <ul className="text-xs text-emerald-800 font-medium space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No telemetry tracking
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No advertising trackers
                </li>
              </ul>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3 hover:shadow-xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">PIN Guard Protection</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Shield your personal space from roommates, colleagues, or casual lookers with a 6-digit access code you control in Settings.
              </p>
              <ul className="text-xs text-amber-800 font-medium space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Customizable PIN code
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Instant session lock
                </li>
              </ul>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3 hover:shadow-xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Full Data Sovereignty</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                You own your words. Download an instant readable JSON archive of your entire workspace at any moment with a single click.
              </p>
              <ul className="text-xs text-blue-800 font-medium space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Universal JSON format
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Total data erasure tool
                </li>
              </ul>
            </motion.div>
          </div>

          {/* DPDP Act 2023 & Legal Compliance Trust Banner */}
          <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200/80 shadow-md shadow-emerald-500/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-950">
                      DPDP Act (2023) Compliance &amp; Data Protection Trust Hub
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Statutory Compliance
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Guaranteed Data Principal rights under India's Digital Personal Data Protection Act, 2023. Zero third-party ad tracking.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrustModalTab('dpdp')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>View DPDP Rights Notice</span>
                </button>
              </div>
            </div>

            {/* Quick 4-pill interactive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setTrustModalTab('dpdp')}
                className="p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-100 text-left transition cursor-pointer group"
              >
                <div className="font-bold text-emerald-950 flex items-center justify-between mb-1">
                  <span>DPDP Rights (Sec 11-14)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-800">
                  Right to access, correction, erasure, nomination, and grievance redressal.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('privacy')}
                className="p-3.5 rounded-2xl bg-purple-50/60 hover:bg-purple-100/60 border border-purple-100 text-left transition cursor-pointer group"
              >
                <div className="font-bold text-purple-950 flex items-center justify-between mb-1">
                  <span>Privacy Policy</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-purple-800">
                  Data minimization, zero ad-network brokers, and local browser encryption.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('terms')}
                className="p-3.5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 text-left transition cursor-pointer group"
              >
                <div className="font-bold text-blue-950 flex items-center justify-between mb-1">
                  <span>Terms of Service</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-blue-800">
                  100% intellectual property ownership of your reflections, ideas, and files.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('security')}
                className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/60 border border-amber-100 text-left transition cursor-pointer group"
              >
                <div className="font-bold text-amber-950 flex items-center justify-between mb-1">
                  <span>Security Safeguards</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-amber-800">
                  Local sandboxing, offline PWA cache, and zero vendor lock-in.
                </p>
              </button>
            </div>

            {/* Test Backup JSON Export Action */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-950">
                  Exercise Your DPDP Right to Access (Section 11)
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Download a complete, unencrypted JSON backup of your sanctuary data with zero restrictions.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="trust-download-backup-btn"
                type="button"
                onClick={handleDownloadBackupPreview}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Backup Archive</span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action / Closing Sunset Haven */}
      <section className="py-20 relative overflow-hidden text-center bg-gradient-to-b from-[#FAF7FD] to-white border-t border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 tracking-tight">
            Ready to Experience True Calm?
          </h2>

          <p className="text-xs sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Whether you are beginning your morning reflection or stepping away into the evening sunset, FolyNote is ready for you.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              id="cta-enter-btn"
              type="button"
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-sm sm:text-base font-extrabold transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user.isLoggedIn ? 'Return to Workspace' : 'Login to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {user.isLoggedIn && onLogout && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="cta-logout-btn"
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs sm:text-sm font-bold border border-gray-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Safely Logout for Now</span>
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* 9. Comprehensive Legal, DPDP Act & Privacy Zen Footer */}
      <footer className="py-10 bg-white border-t border-purple-100 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-800">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-400 flex items-center justify-center text-white font-bold">
                <img src="/icon.svg" alt="FolyNote Logo" className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-gray-900">FolyNote</span>
              <span>&bull;</span>
              <span className="text-gray-500 font-medium">Your files. Your thoughts. Your space.</span>
            </div>

            {/* Legal Trust Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-gray-600">
              <button
                type="button"
                onClick={() => setTrustModalTab('dpdp')}
                className="hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>DPDP Act (2023) Compliance</span>
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('privacy')}
                className="hover:text-purple-700 transition cursor-pointer"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('terms')}
                className="hover:text-purple-700 transition cursor-pointer"
              >
                Terms of Service
              </button>

              <button
                type="button"
                onClick={() => setTrustModalTab('security')}
                className="hover:text-purple-700 transition cursor-pointer"
              >
                Security &amp; Data Safeguards
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} FolyNote. Built in strict accordance with the Digital Personal Data Protection Act, 2023. Zero third-party telemetry.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-purple-700 font-medium cursor-pointer"
              >
                Back to Top &uarr;
              </button>
              <span>&bull;</span>
              <button onClick={onEnterApp} className="hover:text-purple-700 font-bold cursor-pointer text-purple-700">
                {user.isLoggedIn ? 'Enter Workspace' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Trust, Privacy & DPDP Modal */}
      <TrustPrivacyModal
        isOpen={trustModalTab !== null}
        onClose={() => setTrustModalTab(null)}
        initialTab={trustModalTab || 'dpdp'}
      />
    </div>
  );
};
