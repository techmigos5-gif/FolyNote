import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, Compass, ShieldCheck, UserPlus, LogIn, User, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { signUpWithMobilePin, signInWithMobilePin } from '../api/auth';
import { TrustPrivacyModal, TrustModalTab } from '../components/TrustPrivacyModal';

interface LoginViewProps {
  user: UserProfile;
  initialTab?: 'login' | 'signup';
  onLoginSuccess: (updatedUser: Partial<UserProfile>) => void;
  onNavigateHome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  user, 
  initialTab = 'login', 
  onLoginSuccess, 
  onNavigateHome 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(user.mobile || '');
  const [pin, setPin] = useState(user.pin || '');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(user.rememberMe ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trustModalTab, setTrustModalTab] = useState<TrustModalTab | null>(null);
  const [heroFailed, setHeroFailed] = useState(false);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.trim().replace(/[^0-9]/g, '');
    const cleanPin = pin.trim();

    if (!cleanMobile || cleanMobile.length < 5) {
      setError('Please enter a valid mobile number');
      return;
    }
    if (!cleanPin || cleanPin.length < 4) {
      setError('Please enter your PIN (4-6 digits)');
      return;
    }

    if (activeTab === 'signup') {
      const cleanName = name.trim();
      const cleanConfirmPin = confirmPin.trim();

      if (!cleanName) {
        setError('Please enter your full name');
        return;
      }
      if (cleanPin !== cleanConfirmPin) {
        setError('Security PINs do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      const res = await signUpWithMobilePin(cleanName, cleanMobile, cleanPin);
      setLoading(false);

      if (res.success && res.user) {
        onLoginSuccess({
          ...res.user,
          rememberMe,
          isLoggedIn: true,
        });
      } else {
        setError(res.error || 'Sign up failed. Please try again.');
      }
      return;
    }

    // Login mode
    setLoading(true);
    const res = await signInWithMobilePin(cleanMobile, cleanPin);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess({
        ...res.user,
        rememberMe,
        isLoggedIn: true,
      });
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-accent-50 via-white to-pink-50/40 dark:from-[#1b1424] dark:via-[#141118] dark:to-[#191221] overflow-hidden transition-colors duration-300">
      {/* Left side: Artwork or Uploaded Image with gentle meditative motion */}
      <motion.div
        id="login-visual-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full md:w-1/2 lg:w-7/12 h-72 md:h-screen sticky top-0 bg-[#28183d] overflow-hidden flex items-center justify-center shadow-xl md:shadow-none"
      >
        <motion.div
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          {heroFailed ? (
            /* Fallback: layered brand gradient scene */
            <div className="w-full h-full bg-gradient-to-br from-[#28183d] via-accent-900 to-[#0f2027] relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.25),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_75%,rgba(124,58,237,0.35),transparent_60%)]" />
            </div>
          ) : (
            <img
              id="login-hero-image"
              src="/boy-hero.png"
              alt="A boy watching the sunset — your calm space awaits"
              onError={() => setHeroFailed(true)}
              className="w-full h-full object-cover select-none"
            />
          )}
        </motion.div>

        {/* Ambient floating sunbeam glow */}
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Ambient bottom gradient overlay with motivational quote */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6 sm:p-8 flex flex-col justify-end"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest">
              Sanctuary Haven
            </span>
          </div>
          <p className="text-white/95 text-xs sm:text-sm font-medium tracking-wide drop-shadow-md">
            &ldquo;Take a breath, watch the sunset, and step into your space.&rdquo;
          </p>
          <span className="text-white/60 text-[10px] sm:text-xs mt-0.5">
            A quiet moment at the ridge &bull; Your space awaits
          </span>
        </motion.div>
      </motion.div>

      {/* Right side: Auth Form Card */}
      <div className="w-full md:w-1/2 lg:w-5/12 min-h-[calc(100vh-16rem)] md:min-h-screen flex flex-col items-center justify-center px-6 py-8 sm:px-12">
        {onNavigateHome && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mb-4 flex items-center justify-between"
          >
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.97 }}
              id="back-to-homepage-btn"
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-semibold text-accent-700 hover:text-accent-900 flex items-center gap-1.5 transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-accent-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to homepage</span>
            </motion.button>
            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-500" />
              <span>FolyNote Home</span>
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-white/95 dark:bg-[#221a30] backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-xl shadow-accent-500/5 border border-accent-100/60"
        >
          {/* Logo Badge with smooth hover float */}
          <div className="flex justify-center mb-5">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-500 to-accent-700 flex items-center justify-center shadow-md shadow-accent-600/25 ring-4 ring-accent-50 cursor-pointer"
            >
              <img src="/brand.png" alt="FolyNote Logo" className="w-9 h-9" />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {activeTab === 'login' 
                ? 'Login to your personal workspace' 
                : 'Set up your private personal sanctuary'}
            </p>
          </div>

          {/* Segmented Auth Mode Switcher Tab */}
          <div className="flex p-1 bg-gray-100/90 dark:bg-gray-800 rounded-2xl mb-6 border border-gray-200 dark:border-gray-700/60 shadow-2xs">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-[#221a30] text-accent-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-[#221a30] text-accent-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error notice */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (Sign Up only) */}
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="name-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-100 bg-white dark:bg-[#221a30] overflow-hidden transition">
                  <span className="inline-flex items-center px-3.5 bg-gray-50/80 dark:bg-gray-900/40 border-r border-gray-200 dark:border-gray-700 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
                    autoComplete="name"
                  />
                </div>
              </motion.div>
            )}

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-100 bg-white dark:bg-[#221a30] overflow-hidden transition">
                <span className="inline-flex items-center px-3.5 bg-gray-50/80 dark:bg-gray-900/40 border-r border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 select-none">
                  +91
                </span>
                <input
                  id="mobile-input"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label htmlFor="pin-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {activeTab === 'signup' ? 'Create 6-Digit PIN' : 'Security PIN'}
              </label>
              <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-100 bg-white dark:bg-[#221a30] overflow-hidden transition">
                <input
                  id="pin-input"
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={activeTab === 'signup' ? 'Create 6-digit PIN' : 'Enter 6-digit PIN'}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 tracking-widest focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded focus:outline-none"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm PIN Field (Sign Up only) */}
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="confirm-pin-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Confirm 6-Digit PIN
                  </label>
                  {confirmPin.length > 0 && pin === confirmPin && (
                    <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PINs match
                    </span>
                  )}
                </div>
                <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-100 bg-white dark:bg-[#221a30] overflow-hidden transition">
                  <input
                    id="confirm-pin-input"
                    type={showConfirmPin ? 'text' : 'password'}
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-enter 6-digit PIN"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded focus:outline-none"
                    aria-label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Remember me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 border-gray-300 accent-accent-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button with tactile hover and tap physics */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold text-sm shadow-md shadow-accent-600/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : activeTab === 'signup' ? (
                <span>Create Workspace &amp; Sign Up</span>
              ) : (
                <span>Login to Workspace</span>
              )}
            </motion.button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-5 text-center text-xs text-gray-500">
            {activeTab === 'login' ? (
              <span>
                Don&apos;t have an account yet?{' '}
                <button
                  id="switch-to-signup-btn"
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  className="font-bold text-accent-600 hover:text-accent-800 hover:underline cursor-pointer"
                >
                  Sign Up here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  id="switch-to-login-btn"
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className="font-bold text-accent-600 hover:text-accent-800 hover:underline cursor-pointer"
                >
                  Log In here
                </button>
              </span>
            )}
          </div>

          {/* Security Notice & DPDP Act Compliance */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-gray-500">
                Your real workspace is secured with your mobile &amp; PIN. Fully aligned with the <strong>DPDP Act (2023)</strong> with zero third-party telemetry.
              </p>
            </div>

            {/* Clickable Legal Trust Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-gray-500">
              <button
                type="button"
                onClick={() => setTrustModalTab('dpdp')}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                DPDP Act (2023)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setTrustModalTab('privacy')}
                className="hover:text-accent-700 hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setTrustModalTab('terms')}
                className="hover:text-accent-700 hover:underline cursor-pointer"
              >
                Terms
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setTrustModalTab('security')}
                className="hover:text-accent-700 hover:underline cursor-pointer"
              >
                Data Protection
              </button>
            </div>
          </div>

          {/* Slogan subtext */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">
              Your files. Your thoughts. Your space.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Trust & Privacy Modal */}
      <TrustPrivacyModal
        isOpen={trustModalTab !== null}
        onClose={() => setTrustModalTab(null)}
        initialTab={trustModalTab || 'dpdp'}
      />
    </div>
  );
};
