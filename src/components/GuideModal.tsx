import React from 'react';
import { X, Sparkles, Music, FileText, Wand2, Disc3 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
            <Disc3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              ScribeLyria Studio Workflow
            </h3>
            <p className="text-xs text-zinc-400">
              How transcription and Lyria 3.5 music generation work together
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-zinc-200">
                1. Import MP3 or MP4 Media
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Upload any song recording, demo track, voice memo, or video file soundtrack (MP3, MP4, WAV, M4A). You can also click any of the built-in demo tracks for instant testing.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-zinc-200">
                2. Multimodal Audio & Musical Transcription
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Gemini listens to the audio stream to extract timestamped lyrics or spoken words, while simultaneously analyzing key signatures, tempo (BPM), harmonic progressions, and instrumentation stems.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-zinc-200">
                3. Google Lyria 3.5 Music Generation
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                The extracted musical blueprint is synthesized into a dedicated Lyria prompt. Choose between <code className="text-rose-300 font-mono">lyria-3-clip-preview</code> (30s) or <code className="text-rose-300 font-mono">lyria-3-pro-preview</code> (full song), tweak instruments, or attach visual album art inspiration!
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
              4
            </div>
            <div>
              <p className="font-semibold text-zinc-200">
                4. High-Fidelity Audio Deck & A/B Comparison
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Play back your new track, compare A/B against the original source audio, inspect waveform harmonics, and export studio-quality WAV files.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors"
          >
            Got it, let's create
          </button>
        </div>
      </div>
    </div>
  );
};
