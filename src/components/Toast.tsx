'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'info'; }
let addToastFn: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') { addToastFn?.(message, type); }

const iconMap = { success: CheckCircle, error: XCircle, info: Info };
const styleMap = {
  success: 'bg-[#ecfdf5] border-[#059669]/20 text-[#059669]',
  error: 'bg-[#fef2f2] border-[#dc2626]/20 text-[#dc2626]',
  info: 'bg-[#eff6ff] border-[#2563eb]/20 text-[#2563eb]',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now(); setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  useEffect(() => { addToastFn = addToast; return () => { addToastFn = null; }; }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = iconMap[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border pointer-events-auto max-w-sm shadow-lg animate-[fadeIn_0.2s_ease] ${styleMap[t.type]}`}>
            <Icon className="w-4 h-4 shrink-0" /><span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="shrink-0 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}
