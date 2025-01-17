import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { UploadRecord } from '../types';

interface LogsModalProps {
  upload: UploadRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function LogsModal({ upload, isOpen, onClose }: LogsModalProps) {
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

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg bg-slate-800/90 rounded-3xl shadow-xl backdrop-blur-xl p-8 border border-slate-700/30"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 text-transparent bg-clip-text">
              Upload Details & Logs
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                <h4 className="text-sm font-medium text-slate-400 mb-1">File Name</h4>
                <p className="text-sm text-slate-200 break-all">{upload.filename}</p>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                <h4 className="text-sm font-medium text-slate-400 mb-1">Job ID</h4>
                <p className="text-sm font-mono text-slate-200 break-all">{upload.job_id}</p>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                <h4 className="text-sm font-medium text-slate-400 mb-1">Status</h4>
                <p className="text-sm text-slate-200">{upload.status}</p>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                <h4 className="text-sm font-medium text-slate-400 mb-1">Upload Time</h4>
                <p className="text-sm text-slate-200">
                  {new Date(upload.created_at).toLocaleString()}
                </p>
              </div>

              {upload.error_message && (
                <div className="bg-rose-900/30 p-4 rounded-2xl border border-rose-800/30">
                  <h4 className="text-sm font-medium text-rose-400 mb-1">Error</h4>
                  <p className="text-sm text-rose-300 break-all">{upload.error_message}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
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