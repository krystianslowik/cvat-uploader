import React from 'react';

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-slate-800/10 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/30">
      {/* Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/20 blur-3xl animate-blob" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-fuchsia-500/20 blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Content */}
      <div className="relative px-8 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 text-transparent bg-clip-text [text-wrap:balance] tracking-tight">
            VSI Uploader
          </h1>
          <p className="mt-6 text-lg text-slate-300 [text-wrap:balance]">
            Upload and process your VSI files with ease. Seamlessly integrate with CVAT for advanced image annotation.
          </p>
        </div>
      </div>
    </header>
  );
}