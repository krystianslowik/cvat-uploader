import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  filename: string;
}

export function ProcessingState({ filename }: ProcessingStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-sky-900/30 rounded-2xl p-4 mx-auto mb-6 w-fit border border-sky-800/30">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
      </div>
      <h3 className="text-xl font-medium text-slate-200 mb-3">Processing in Progress</h3>
      <div className="space-y-2 max-w-lg mx-auto">
        <p className="text-slate-300">
          Your file <span className="font-medium text-sky-400">{filename}</span> is being processed.
        </p>
        <p className="text-slate-400 text-sm">
          You can safely close this window. The processing will continue in the background and will be available in your upload history when complete.
        </p>
      </div>
    </div>
  );
}