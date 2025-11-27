import React from 'react';
import { Icons } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ลบข้อมูล',
  cancelText = 'ยกเลิก'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <Icons.Alert size={28} />
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm text-sm font-medium transition flex items-center gap-2"
          >
            <Icons.Delete size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};