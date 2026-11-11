import React from 'react';
import { Music, Disc3, Sparkles, Wand2, Info } from 'lucide-react';

interface HeaderProps {
  onShowInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowInfo }) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-white/20">
            <Disc3 className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                ScribeLyria Studio
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Lyria 3.5
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              MP3/MP4 Audio & Musical Transcriber • Powered by Google Gemini & Lyria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onShowInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-zinc-400" />
            <span>Workflow Guide</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Lyria AI Engine Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
