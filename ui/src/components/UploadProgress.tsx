import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { UploadState } from '../types';
import clsx from 'clsx';

interface UploadProgressProps {
  state: UploadState;
}

export function UploadProgress({ state }: UploadProgressProps) {
  const { progress, status, error } = state;

  return (
    <div className="w-full space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'uploading' && (
            <div className="p-2 bg-sky-900/30 rounded-xl border border-sky-800/30">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            </div>
          )}
          {status === 'completed' && (
            <div className="p-2 bg-emerald-900/30 rounded-xl border border-emerald-800/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="p-2 bg-rose-900/30 rounded-xl border border-rose-800/30">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-200">
              {status === 'uploading' && 'Uploading file...'}
              {status === 'completed' && 'Upload Complete'}
              {status === 'error' && 'Upload Failed'}
            </p>
          </div>
        </div>
        <span className="text-sm text-slate-400 font-medium tabular-nums">
          {status !== 'error' ? `${Math.round(progress)}%` : ''}
        </span>
      </div>

      {/* Progress Bar */}
      {status !== 'error' && (
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 mt-3 text-sm text-rose-300 bg-rose-900/30 p-3 rounded-2xl border border-rose-800/30">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}