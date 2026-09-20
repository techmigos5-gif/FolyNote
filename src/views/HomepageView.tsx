import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, BellRing, BookOpen, FileText, Flower2, Lightbulb, Lock,
  Music4, Palette, ShieldCheck, Smartphone, Sparkles, Waves,
} from 'lucide-react';
import { TrustPrivacyModal, TrustModalTab } from '../components/TrustPrivacyModal';

interface HomepageViewProps {
  /** Open the auth screen (tab: login or signup). */
  onOpenApp?: (tab: 'login' | 'signup') => void;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Daily Thoughts',
    description: 'A calm journal with one entry per day — write, tag, and pin the reflections that matter.',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Upload PDFs, notes and text files to your private 250 MB vault with a built-in multi-format viewer.',
  },
  {
    icon: Lightbulb,
    title: 'Idea Board',
    description: 'Capture sparks before they fade. Star, pin and organise ideas by tag in a visual board.',
  },
  {
    icon: BellRing,
    title: 'Gentle Reminders',
    description: 'Schedule nudges with repeat options — delivered in-app and as real notifications on mobile.',
  },
  {
    icon: Waves,
    title: 'Calm Sounds & Breathing',
    description: 'Five synthesized soundscapes and guided breathing breaks, generated live with zero downloads.',
  },
  {
    icon: Palette,
    title: 'Make It Yours',
    description: 'Light and dark mode plus six accent palettes — Lotus Violet, Ocean, Sunset, Rose, Forest and Midnight.',
  },
];

const STEPS = [
  { title: 'Create your space', body: 'Sign up with just a mobile number and PIN — no email, no spam, no tracking pixels.' },
  { title: 'Fill it with life', body: 'Write thoughts, upload documents, save ideas, and set reminders that actually feel gentle.' },
  { title: 'Pick up anywhere', body: 'Everything syncs privately to your own space and works offline — on the web and native mobile.' },
];

export const HomepageView: React.FC<HomepageViewProps> = ({ onOpenApp }) => {
  const [trustModalTab, setTrustModalTab] = useState<TrustModalTab | null>(null);

  const open = (tab: 'login' | 'signup') => onOpenApp?.(tab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7FF] via-white to-[#FDF6EC] dark:from-[#141118] dark:via-[#141118] dark:to-[#191221] text-gray-900 dark:text-gray-100">
      {/* ============ Top nav ============ */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-[#141118]/70 border-b border-white/40 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-500 to-accent-700 flex items-center justify-center shadow-md shadow-accent-500/20">
              <img src="/brand.png" alt="FolyNote logo" className="w-6 h-6" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-extrabold tracking-tight">FolyNote</span>
              <p className="hidden sm:block text-[10px] font-medium text-gray-500 dark:text-gray-400">
                Your files. Your thoughts. Your space.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => open('login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-accent-50 dark:hover:bg-accent-950/40 hover:text-accent-700 dark:hover:text-accent-300 transition cursor-pointer"
            >
              Sign in
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => open('signup')}
              className="px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-accent-600/25 transition cursor-pointer flex items-center gap-1.5"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-40 -right-24 w-80 h-80 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-950/50 border border-accent-100 dark:border-accent-900 text-[11px] font-bold text-accent-700 dark:text-accent-300">
              <Sparkles className="w-3 h-3" /> Private by design · DPDP-aligned
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
              Your files.{' '}
              <span className="bg-gradient-to-r from-accent-600 via-accent-500 to-amber-500 bg-clip-text text-transparent">
                Your thoughts.
              </span>
              <br />
              Your space.
            </h1>
            <p className="mt-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
              FolyNote is one peaceful home for your daily journal, documents, ideas and reminders —
              with calm soundscapes, gentle notifications and six beautiful themes. Offline-first,
              synced to your private cloud space.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => open('signup')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-sm font-bold shadow-lg shadow-accent-600/25 transition cursor-pointer flex items-center gap-2"
              >
                Create your free space <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                type="button"
                onClick={() => open('login')}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-accent-300 hover:text-accent-700 transition cursor-pointer"
              >
                I already have one
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" /> Row-level private storage</span>
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-accent-500" /> Android &amp; iOS apps</span>
              <span className="flex items-center gap-1.5"><Flower2 className="w-3.5 h-3.5 text-amber-500" /> Offline-first</span>
            </div>
          </motion.div>

          {/* Hero visual: layered nature artwork + floating app cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-accent-900/20 ring-1 ring-black/5">
              <img
                src="/nature-1.png"
                alt="Sunrise over a misty lake — the calm feeling of FolyNote"
                className="w-full h-72 sm:h-96 object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
            </div>

            {/* Floating thought card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-3 sm:-left-8 top-8 w-52 rounded-2xl bg-white/95 dark:bg-[#241b31]/95 backdrop-blur shadow-xl p-4 ring-1 ring-black/5"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                <BookOpen className="w-3 h-3" /> Today&apos;s thought
              </div>
              <p className="mt-2 text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                “Watched the sun melt into the ridge. Grateful, quiet, light.”
              </p>
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/60 text-accent-700 dark:text-accent-300 text-[9px] font-bold">gratitude</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[9px] font-bold">sunset</span>
              </div>
            </motion.div>

            {/* Floating reminder chip */}
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -right-2 sm:-right-6 bottom-10 rounded-2xl bg-white/95 dark:bg-[#241b31]/95 backdrop-blur shadow-xl px-4 py-3 ring-1 ring-black/5 flex items-center gap-2.5"
            >
              <span className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-900/60 flex items-center justify-center">
                <BellRing className="w-4 h-4 text-accent-600 dark:text-accent-300" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100">Evening reflection</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Tomorrow 9:30 PM · with chime</p>
              </div>
            </motion.div>

            {/* Floating soundscape chip */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
              className="absolute left-6 -bottom-5 rounded-2xl bg-white/95 dark:bg-[#241b31]/95 backdrop-blur shadow-xl px-4 py-2.5 ring-1 ring-black/5 flex items-center gap-2"
            >
              <Music4 className="w-4 h-4 text-accent-500" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Ocean Waves · playing</span>
              <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
                <motion.span animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-0.5 h-full bg-accent-400 rounded-full origin-bottom" />
                <motion.span animate={{ scaleY: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-0.5 h-full bg-accent-400 rounded-full origin-bottom" />
                <motion.span animate={{ scaleY: [0.6, 1, 0.6] }} transition={{ duration: 0.9, repeat: Infinity }} className="w-0.5 h-full bg-accent-400 rounded-full origin-bottom" />
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Everything you need to think clearly</h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Six thoughtful tools, one calm workspace — each designed to feel light, fast and private.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-accent-900/5 transition"
            >
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-500 to-accent-700 text-white flex items-center justify-center shadow-md shadow-accent-500/20">
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold">{f.title}</h3>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ Nature gallery ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { src: '/nature-2.png', alt: 'Still water reflecting the evening sky', caption: 'Find your stillness' },
            { src: '/nature-1.png', alt: 'Sunrise over a calm lake', caption: 'Begin gently' },
            { src: '/nature-3.png', alt: 'Forested hills under soft light', caption: 'Think in nature' },
          ].map((img, i) => (
            <motion.figure
              key={img.caption}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 group"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-52 object-cover group-hover:scale-105 transition duration-700"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-bold tracking-wide">
                {img.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative p-6 rounded-3xl bg-gradient-to-b from-accent-50/60 to-transparent dark:from-accent-950/20 border border-accent-100/70 dark:border-accent-900/40"
            >
              <span className="text-4xl font-extrabold text-accent-200 dark:text-accent-800">{i + 1}</span>
              <h3 className="mt-2 text-sm font-bold">{s.title}</h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ Privacy band ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#2A1E3F] to-[#4C2E67] text-white p-8 sm:p-12"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl" aria-hidden="true" />
          <div className="max-w-xl relative">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              <ShieldCheck className="w-4 h-4" /> Privacy &amp; DPDP Act (2023)
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">Your words belong to you. Full stop.</h2>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Every row of your data is protected by row-level security — no one else can read it, not even us.
              Export or erase everything anytime. No ads, no trackers, no data licensing. Ever.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => open('signup')}
                className="px-5 py-3 rounded-xl bg-white dark:bg-[#221a30] text-[#2A1E3F] text-xs font-extrabold hover:bg-accent-50 transition cursor-pointer flex items-center gap-1.5"
              >
                Start writing today <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTrustModalTab('dpdp')}
                className="px-5 py-3 rounded-xl border border-white/30 text-xs font-bold text-white/90 hover:bg-white/10 transition cursor-pointer"
              >
                Read the Trust Center
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-gray-100 dark:border-gray-800/60 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/brand.png" alt="FolyNote logo" className="w-6 h-6" />
            <span className="text-sm font-bold">FolyNote</span>
          </div>
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} FolyNote — Your files. Your thoughts. Your space.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
            <button type="button" onClick={() => setTrustModalTab('privacy')} className="hover:text-accent-600 cursor-pointer">Privacy</button>
            <span>·</span>
            <button type="button" onClick={() => setTrustModalTab('terms')} className="hover:text-accent-600 cursor-pointer">Terms</button>
            <span>·</span>
            <button type="button" onClick={() => setTrustModalTab('security')} className="hover:text-accent-600 cursor-pointer">Security</button>
          </div>
        </div>
      </footer>

      <TrustPrivacyModal
        isOpen={trustModalTab !== null}
        onClose={() => setTrustModalTab(null)}
        initialTab={trustModalTab || 'dpdp'}
      />
    </div>
  );
};
