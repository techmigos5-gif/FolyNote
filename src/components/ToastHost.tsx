import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { Toast, dismiss, subscribeToasts } from '../lib/toast';

const ICONS: Record<Toast['kind'], React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  info: <Info className="w-4 h-4 text-accent-600" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
};

/** Global toast renderer, mounted once in App. */
export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex items-center gap-2.5 max-w-sm text-left px-4 py-3 rounded-2xl bg-white dark:bg-[#241b31] shadow-xl shadow-accent-900/10 border border-gray-100 dark:border-gray-800 cursor-pointer"
          >
            {ICONS[t.kind]}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};
