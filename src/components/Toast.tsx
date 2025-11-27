import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from './Icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transform transition-all duration-300 animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
              toast.type === 'error' ? 'bg-white border-rose-100 text-rose-800' :
              'bg-white border-slate-100 text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              toast.type === 'error' ? 'bg-rose-100 text-rose-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              {toast.type === 'success' && <Icons.Check size={16} />}
              {toast.type === 'error' && <Icons.Alert size={16} />}
              {toast.type === 'info' && <Icons.Alert size={16} />}
            </div>
            <span className="text-sm font-medium pr-2">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <Icons.Reject size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};