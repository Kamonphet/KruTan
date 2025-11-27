import React from 'react';
import { Icons } from './Icons';

// --- Loading Screen ---
export const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[9999]">
    <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="w-20 h-20 border-t-4 border-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600">
            <Icons.Classes size={32} />
        </div>
    </div>
    <h2 className="mt-6 text-xl font-bold text-slate-700 tracking-wide">KruTan</h2>
    <p className="text-slate-400 text-sm mt-1 animate-pulse">กำลังเชื่อมต่อฐานข้อมูล...</p>
  </div>
);

// --- Card Component ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${className}`}>
    {(title || action) && (
      <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        {title && <h3 className="font-bold text-slate-800 text-lg">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 transform";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md focus:ring-indigo-500 shadow-sm border border-transparent",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-transparent focus:ring-emerald-500",
    ghost: "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
};

// --- Badge Component ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};

// --- Form Components ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <input 
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${className}`}
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <select 
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// --- Table Component ---
export const Table: React.FC<{ headers: string[]; children: React.ReactNode; emptyMessage?: string }> = ({ headers, children, emptyMessage = "ไม่พบข้อมูล" }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className={`px-6 py-3 font-semibold whitespace-nowrap ${i === headers.length - 1 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {children}
        </tbody>
      </table>
    </div>
    {(!children || (Array.isArray(children) && children.length === 0)) && (
      <div className="p-12 text-center text-slate-400">
        <p>{emptyMessage}</p>
      </div>
    )}
  </div>
);

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-slate-50 transition-colors group text-slate-700">
    {children}
  </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`px-6 py-4 align-middle ${className}`}>{children}</td>
);

// --- Pagination Component ---
export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
      <div className="flex flex-1 justify-between sm:hidden gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="flex-1">
          ก่อนหน้า
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex-1">
          ถัดไป
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700">
            หน้า <span className="font-medium">{currentPage}</span> จาก <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              icon={Icons.ChevronLeft}
            >
              ก่อนหน้า
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              ถัดไป <Icons.ChevronRight size={14} className="ml-2" />
            </Button>
        </div>
      </div>
    </div>
  );
};

// --- Modal Component ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <Icons.Reject size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};