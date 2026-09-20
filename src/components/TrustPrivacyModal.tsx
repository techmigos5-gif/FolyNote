import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Scale, 
  X, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  Mail,
  Building,
  HardDrive,
  EyeOff,
  UserCheck,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { storage } from '../data/storage';

export type TrustModalTab = 'dpdp' | 'privacy' | 'terms' | 'security';

interface TrustPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TrustModalTab;
}

export const TrustPrivacyModal: React.FC<TrustPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'dpdp',
}) => {
  const [activeTab, setActiveTab] = useState<TrustModalTab>(initialTab);
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync activeTab when initialTab changes on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleExportData = () => {
    const jsonStr = storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folynote-dpdp-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('grievance@folynote.app');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#221a30] rounded-3xl shadow-2xl border border-accent-100 flex flex-col overflow-hidden text-gray-900 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-accent-50/80 via-white to-pink-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-600 text-white flex items-center justify-center shadow-md shadow-accent-600/20 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-950">
                  Trust, Privacy &amp; Data Protection Center
                </h2>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  DPDP Act (2023)
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Transparent data rights, lawful governance, and zero-compromise personal sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Fully responsive overflow) */}
        <div className="flex items-center gap-1.5 px-4 sm:px-7 py-2.5 bg-gray-50/80 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('dpdp')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'dpdp'
                ? 'bg-accent-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-accent-700 hover:bg-accent-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act (2023) Compliance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-accent-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-accent-700 hover:bg-accent-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-accent-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-accent-700 hover:bg-accent-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-accent-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-accent-700 hover:bg-accent-50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Security Architecture</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          
          {/* TAB 1: DPDP ACT 2023 COMPLIANCE */}
          {activeTab === 'dpdp' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Compliance Highlight Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Digital Personal Data Protection Act (DPDP Act, 2023)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-emerald-800">
                      Fully aligned with the legislative standards and consumer rights enacted under India's DPDP Act, 2023.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exercise Right to Access</span>
                </button>
              </div>

              {/* Data Principal Rights Section */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-accent-600" />
                  <span>Your Rights as a Data Principal (Sections 11–14)</span>
                </h4>
                <p className="text-xs text-gray-600">
                  Under the DPDP Act 2023, you hold absolute sovereignty over your digital personal data. FolyNote implements these legal rights directly in the user interface:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-accent-50/50 border border-accent-100 space-y-1">
                    <span className="font-bold text-xs text-accent-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                      1. Right to Access (Section 11)
                    </span>
                    <p className="text-[11px] text-gray-600">
                      You have the right to a summary of personal data processed, identities of all data processors, and any other information. Use our <strong>Export Backup (JSON)</strong> feature at any time.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-accent-50/50 border border-accent-100 space-y-1">
                    <span className="font-bold text-xs text-accent-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                      2. Right to Correction &amp; Erasure (Section 12)
                    </span>
                    <p className="text-[11px] text-gray-600">
                      You can modify, update, or completely erase your personal reflections, profile details, and uploaded files with instant effect. No lingering remnants.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-accent-50/50 border border-accent-100 space-y-1">
                    <span className="font-bold text-xs text-accent-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                      3. Right of Grievance Redressal (Section 13)
                    </span>
                    <p className="text-[11px] text-gray-600">
                      You have the right to access readily available redressal mechanisms provided by our designated Data Protection Grievance Officer.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-accent-50/50 border border-accent-100 space-y-1">
                    <span className="font-bold text-xs text-accent-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-600" />
                      4. Right to Nominate (Section 14)
                    </span>
                    <p className="text-[11px] text-gray-600">
                      In the event of death or incapacity, you have the statutory right to nominate an individual to exercise data rights on your behalf via our Grievance Cell.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lawful Grounds & Purpose Limitation */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Notice, Lawful Grounds &amp; Purpose Limitation (Section 5 &amp; 6)
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Personal data (mobile number, display name, PIN, and self-authored thoughts) is processed solely and exclusively to provide the personalized sanctuary workspace requested by you. We do not engage in cross-site tracking, behavioral profiling, or advertising analytics.
                </p>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Summary of Processing Notice:</div>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5">
                    <li>Data collected: Mobile number for authentication, personal name, 6-digit access PIN, personal thoughts, documents, and ideas.</li>
                    <li>Specific purpose: Private storage, retrieval, offline caching, and display within your personal workspace.</li>
                    <li>Withdrawal of consent: Logging out and requesting data erasure immediately revokes consent to process further data.</li>
                  </ul>
                </div>
              </div>

              {/* Grievance Officer Details */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-50 to-pink-50 border border-accent-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-accent-900">
                  <Mail className="w-4 h-4 text-accent-600" />
                  <span>Data Protection Officer &amp; Grievance Redressal</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  For any inquiries, requests under the DPDP Act 2023, or grievance submissions, please reach out to our designated Data Protection Officer:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Grievance Officer:</span> Vinay Sagar (Data Governance Cell)<br />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Email:</span> grievance@folynote.app
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#221a30] border border-accent-200 hover:bg-accent-100 text-accent-800 text-xs font-semibold transition cursor-pointer"
                  >
                    {copySuccess ? 'Copied Email!' : 'Copy Officer Email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last updated: September 2026 &bull; Effective immediately</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">1. Information We Collect</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We adhere to the strict principle of data minimization:
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-1">
                  <li><strong>Account Identity:</strong> Mobile number (+91 format) and 6-digit access PIN for secure authentication.</li>
                  <li><strong>Workspace Profile:</strong> Display name and profile avatar letter.</li>
                  <li><strong>User Content:</strong> Personal journal entries, thoughts, tags, pinned items, and uploaded documents/PDFs.</li>
                  <li><strong>Device Telemetry:</strong> None. We do not collect device serial numbers, GPS geolocation, advertising IDs, or contacts.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">2. How Your Data Is Processed &amp; Stored</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your data resides in a secure, sandboxed environment. When offline or using PWA mode, documents and reflections are cached directly on your device storage via encrypted LocalStorage and CacheStorage. When connected, the workspace syncs with our dedicated server storage (<code className="text-accent-700 bg-accent-50 px-1 py-0.5 rounded">data/db.json</code>) without any third-party intermediate analytics.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">3. Zero Third-Party Advertising &amp; Sharing</h4>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>No Ad Networks, No Data Brokers</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    We never sell, rent, license, or monetize your reflections, documents, or personal credentials. Your thoughts are treated with strict confidentiality.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">4. Cookies and Web Storage</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  FolyNote does not deploy third-party advertising cookies or cross-site tracking pixels. Web Storage is utilized solely for session persistence ("Remember Me") and offline PWA functionality.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Terms of Service</h3>
                <p className="text-xs text-gray-500 mt-0.5">Governing use of the FolyNote Workspace</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">1. Acceptance &amp; Scope of Services</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  By accessing or registering with FolyNote, you agree to these Terms. FolyNote provides a private personal workspace for journaling daily reflections, reviewing documents (PDF, Markdown, text), curating creative ideas, and tracking personal productivity.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">2. 100% User Intellectual Property Ownership</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You retain complete, unencumbered ownership of all thoughts, ideas, writings, and files uploaded to FolyNote. FolyNote claims zero copyright, license, or intellectual property rights over any content you record in your personal space.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">3. User Responsibility for Access Credentials</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You are responsible for maintaining the secrecy of your 6-digit access PIN and mobile number. Because FolyNote prioritizes client-side privacy, you should maintain periodic JSON backups via the Settings tab to safeguard your reflections across physical devices.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">4. Service Availability &amp; Offline Continuity</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  FolyNote is engineered with Progressive Web App (PWA) offline capabilities. The service is provided on an "as is" and "as available" basis, designed to withstand network dropouts while keeping your local workspace responsive.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY ARCHITECTURE */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Security Architecture &amp; Data Safeguards</h3>
                <p className="text-xs text-gray-500 mt-0.5">Technical &amp; organizational measures protecting user reflections</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <div className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-accent-600" />
                    <span>PIN-Gated Authentication</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Access requires a verified mobile number and confidential 6-digit PIN. Session state is gated against unauthorized client-side access.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <div className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-accent-600" />
                    <span>Local Sandboxed Persistence</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Data is stored in isolated JSON files on the server and synchronized with browser storage. No external third-party cloud database can access your files.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <div className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-accent-600" />
                    <span>Zero Vendor Lock-In</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    One-click data export into standardized, unencrypted JSON format so you can migrate or backup your life's reflections freely.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <div className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Guaranteed Data Erasure</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    When you delete a thought or clear your workspace, it is permanently deleted from both local client state and backend files.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-accent-50/70 border border-accent-100 text-xs text-accent-950 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold block">Need an immediate data export?</span>
                  <span className="text-[11px] text-accent-800">Download your complete encrypted workspace archive right now.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Act 2023 Compliant &bull; 100% User Owned &bull; No Ad Tracking</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-semibold text-xs transition cursor-pointer"
          >
            Close Trust Center
          </button>
        </div>
      </div>
    </div>
  );
};
