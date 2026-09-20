import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import { ACCENTS, AccentId } from '../lib/theme';
import {
  User,
  Shield,
  Download,
  Upload,
  Check,
  Smartphone,
  HardDrive,
  Palette,
  ShieldCheck,
  Scale,
  Lock,
  Mail,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { storage } from '../data/storage';
import { TrustPrivacyModal, TrustModalTab } from '../components/TrustPrivacyModal';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData?: () => void;
  onReloadAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onReloadAllData,
}) => {
  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [trustModalTab, setTrustModalTab] = useState<TrustModalTab | null>(null);
  const [showErasureConfirm, setShowErasureConfirm] = useState(false);
  const [erasureDone, setErasureDone] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'FolyNote User',
      mobile: mobile.trim() || user.mobile,
      avatarLetter: (name.trim().charAt(0) || user.avatarLetter || 'U').toUpperCase(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folynote-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllData(content);
      if (success) {
        setImportNotice('Backup successfully imported! Refreshing workspace...');
        setTimeout(() => {
          onReloadAllData();
          setImportNotice(null);
        }, 1200);
      } else {
        alert('Failed to parse backup file. Please check valid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings &amp; Workspace
        </h1>          <p className="text-xs text-gray-500 mt-1">
            Manage your personal profile, appearance, data, and privacy
          </p>
      </div>

      {/* 2. Profile Information Form */}
      <div className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Personal Profile</h2>
            <p className="text-xs text-gray-400">Displayed in greetings, document stamps, and headers</p>
          </div>
        </div>          <p className="text-[11px] text-gray-400 -mt-1">
            Your mobile number and PIN are managed at sign-in; the PIN never leaves Supabase Auth.
          </p>

          <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-accent-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <span className="px-3 bg-gray-50 dark:bg-gray-900/40 text-xs font-bold text-gray-500 flex items-center border-r border-gray-200 dark:border-gray-700">
                  +91
                </span>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Mobile Number"
                  className="w-full px-3.5 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-98 text-white text-xs font-semibold shadow-xs shadow-accent-600/20 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2b. Appearance — light / dark mode + accent palette */}
      <div className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pick a mode and accent palette. Every screen, button and ring follows your choice.
            </p>
          </div>
          <ThemeToggle
            user={user}
            onThemeChange={(t) => onUpdateProfile({ theme: t })}
            compact={false}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Accent palette</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {ACCENTS.map((a) => {
              const selected = (user.accent ?? 'violet') === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onUpdateProfile({ accent: a.id })}
                  aria-pressed={selected}
                  className={`group p-2 rounded-xl border text-left transition cursor-pointer ${
                    selected
                      ? 'border-accent-500 ring-2 ring-accent-200 dark:ring-accent-900 bg-accent-50/50 dark:bg-accent-950/30'
                      : 'border-gray-100 hover:border-gray-300 dark:border-gray-800'
                  }`}
                >
                  <span
                    className="block w-full h-7 rounded-lg shadow-inner"
                    style={{ background: a.swatch }}
                    aria-hidden="true"
                  />
                  <span className={`block mt-1.5 text-[10px] font-bold leading-tight ${selected ? 'text-accent-700 dark:text-accent-300' : 'text-gray-500'}`}>
                    {a.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Mobile apps via Capacitor */}
      <div className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Mobile Apps (Android &amp; iOS)</h2>
            <p className="text-xs text-gray-400">Native FolyNote builds powered by Capacitor</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-accent-600" />
              Native + Offline
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              The same workspace ships as a native Android/iOS app — reminders use real system notifications, and your data keeps syncing with Supabase.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-accent-600" />
              Build it yourself
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Run <code className="px-1 py-0.5 rounded bg-gray-200/70 text-[10px]">npm run build &amp;&amp; npx cap sync</code>, then open <code className="px-1 py-0.5 rounded bg-gray-200/70 text-[10px]">npx cap add android</code> / <code className="px-1 py-0.5 rounded bg-gray-200/70 text-[10px]">npx cap add ios</code> in Android Studio or Xcode.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Backup & Export */}
      <div className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Data Portability &amp; Backups</h2>
            <p className="text-xs text-gray-400">Export or import your entire thoughts, documents, and pinned notes</p>
          </div>
        </div>

        {importNotice && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
            {importNotice}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 hover:bg-accent-50 text-gray-700 dark:text-gray-300 hover:text-accent-700 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 hover:bg-accent-50 text-gray-700 dark:text-gray-300 hover:text-accent-700 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. DPDP Act (2023) Compliance & Data Principal Rights Hub */}
      <div className="bg-white dark:bg-[#221a30] p-6 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  DPDP Act (2023) Compliance &amp; Privacy Rights
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Data Sovereignty
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Exercise your statutory rights under India's Digital Personal Data Protection Act, 2023
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTrustModalTab('dpdp')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Trust Center</span>
          </button>
        </div>

        {/* 4 quick rights badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" />
              Right to Access (Sec 11)
            </span>
            <p className="text-[11px] text-gray-600">
              Export and review your personal data anytime in JSON format.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-accent-50/50 border border-accent-100 space-y-1">
            <span className="font-bold text-accent-950 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-accent-600" />
              Right to Erasure (Sec 12)
            </span>
            <p className="text-[11px] text-gray-600">
              Permanently purge all thoughts, documents, and notes on demand.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="font-bold text-blue-950 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-blue-600" />
              Grievance Officer (Sec 13)
            </span>
            <p className="text-[11px] text-gray-600">
              Direct access to Data Protection Redressal Officer.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-600" />
              Zero Ad Tracking
            </span>
            <p className="text-[11px] text-gray-600">
              No commercial ad brokers, telemetry, or data licensing.
            </p>
          </div>
        </div>

        {/* Quick action buttons row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTrustModalTab('privacy')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-accent-50 hover:text-accent-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setTrustModalTab('terms')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-accent-50 hover:text-accent-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setTrustModalTab('security')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-accent-50 hover:text-accent-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              Security Details
            </button>
          </div>

          {/* Right to Erasure Trigger */}
          <button
            type="button"
            onClick={() => setShowErasureConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold border border-red-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Exercise Right to Erasure</span>
          </button>
        </div>

        {erasureDone && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            All personal reflections, thoughts, ideas, and uploaded files have been permanently erased from local storage.
          </div>
        )}
      </div>

      {/* DPDP Erasure Confirmation Modal */}
      {showErasureConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#221a30] rounded-3xl p-6 sm:p-7 shadow-2xl border border-red-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Exercise DPDP Right to Erasure (Section 12)?
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              In accordance with Section 12 of the DPDP Act 2023, this action will permanently purge all your local personal journal entries, uploaded documents, ideas, and tags from this browser and workspace. 
              <br /><br />
              <strong>Tip:</strong> You can download a backup archive first if you wish to retain a private copy.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowErasureConfirm(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  storage.clearAll();
                  setShowErasureConfirm(false);
                  setErasureDone(true);
                  setTimeout(() => {
                    onReloadAllData();
                    setErasureDone(false);
                  }, 1200);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Permanently Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Privacy Center Modal */}
      <TrustPrivacyModal
        isOpen={trustModalTab !== null}
        onClose={() => setTrustModalTab(null)}
        initialTab={trustModalTab || 'dpdp'}
      />
    </div>
  );
};
