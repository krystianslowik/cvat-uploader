import React, { useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatusInfoModal({ isOpen, onClose }: StatusInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const statuses = [
    {
      name: 'Uploaded',
      description: 'The ZIP file has been successfully uploaded to our servers and is queued for processing.',
      icon: Upload,
      color: 'text-amber-400',
      bg: 'bg-amber-900/30',
      border: 'border-amber-800/30'
    },
    {
      name: 'Processing',
      description: 'The system is extracting and validating the VSI file, preparing it for CVAT integration.',
      icon: Loader2,
      color: 'text-sky-400',
      bg: 'bg-sky-900/30',
      border: 'border-sky-800/30'
    },
    {
      name: 'Completed',
      description: 'Processing is complete and the file is ready for annotation in CVAT.',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-800/30'
    },
    {
      name: 'Failed',
      description: 'An error occurred during upload or processing. Check the error message for details and try again.',
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-900/30',
      border: 'border-rose-800/30'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-slate-800/90 rounded-3xl shadow-xl backdrop-blur-xl p-8 border border-slate-700/30"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 text-transparent bg-clip-text">
              Upload Status Guide
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {statuses.map((status) => (
              <div
                key={status.name}
                className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${status.bg} rounded-xl border ${status.border}`}>
                    <status.icon className={`h-5 w-5 ${status.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 mb-1">
                      {status.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {status.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl hover:from-sky-400 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}