import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 flex items-center p-4 rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-300 transform translate-y-0',
        {
          'bg-emerald-50/90 border-emerald-100': type === 'success',
          'bg-rose-50/90 border-rose-100': type === 'error',
        }
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-500" />
      )}
      <span
        className={clsx('mx-3 text-sm font-medium', {
          'text-emerald-800': type === 'success',
          'text-rose-800': type === 'error',
        })}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        className={clsx(
          'p-1.5 rounded-xl hover:bg-opacity-10 transition-colors',
          {
            'hover:bg-emerald-900': type === 'success',
            'hover:bg-rose-900': type === 'error',
          }
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}