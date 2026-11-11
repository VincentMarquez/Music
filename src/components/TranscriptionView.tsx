import React, { useState } from 'react';
import {
  FileText,
  Music,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Volume2,
  Activity,
  Layers,
  Clock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { FullAudioDecomposition } from '../types/music';
import { StemVisualizer } from './StemVisualizer';

interface TranscriptionViewProps {
  decomposition: FullAudioDecomposition | null;
  onSendToLyria: (prompt: string) => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  decomposition,
  onSendToLyria,
}) => {
  const [activeTab, setActiveTab] = useState<'transcription' | 'stems' | 'musical' | 'json'>('transcription');
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!decomposition) return null;

  const { transcription, musicAnalysis, lyria, hasVocals, title } = decomposition;

  const handleCopyTranscription = () => {
    navigator.clipboard.writeText(transcription.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFullJson = () => {
    navigator.clipboard.writeText(JSON.stringify(decomposition, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Analysis Results
            </span>
            <span className="text-xs text-zinc-400">
              {hasVocals ? '🎙️ Vocal & Audio Track' : '🎹 Instrumental Track'}
            </span>
          </div>
          <h2 className="text-base font-bold text-zinc-100 mt-1">{title}</h2>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('transcription')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'transcription'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics & Speech ({transcription.sections?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('stems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'stems'
                ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-300" />
            <span>Audio Stems & Mix (D3)</span>
          </button>
          <button
            onClick={() => setActiveTab('musical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'musical'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music Decomposition</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'json'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON Output</span>
          </button>
        </div>
      </div>

      {/* Tab: Isolated Audio Stems & Mix Balance (D3) */}
      {activeTab === 'stems' && (
        <div className="mt-4">
          <StemVisualizer
            onApplyBalanceToPrompt={(mixNotes) => {
              const base = lyria?.suggestedPrompt || '';
              onSendToLyria(base ? `${base}\n\n${mixNotes}` : mixNotes);
            }}
          />
        </div>
      )}

      {/* Tab 1: Transcription / Lyrics */}
      {activeTab === 'transcription' && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamped Song Structure & Lyrics</span>
            </div>
            <button
              onClick={handleCopyTranscription}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Lyrics</span>
                </>
              )}
            </button>
          </div>

          {/* Sections List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {transcription.sections && transcription.sections.length > 0 ? (
              transcription.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                    <span className="text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/40">
                      {section.section || `Section ${idx + 1}`}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {section.timestamp || '0:00'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {transcription.fullText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Musical Decomposition */}
      {activeTab === 'musical' && (
        <div className="mt-4 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Musical Key
              </span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">
                {musicAnalysis.key || 'Unknown'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Tempo (BPM)
              </span>
              <span className="text-base font-bold text-cyan-400 mt-0.5 block">
                {musicAnalysis.bpm ? `${musicAnalysis.bpm} BPM` : '120 BPM'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Time Signature
              </span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {musicAnalysis.timeSignature || '4/4'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Mood Vibe
              </span>
              <span className="text-xs font-semibold text-rose-300 mt-1 block truncate">
                {musicAnalysis.mood || 'Dynamic'}
              </span>
            </div>
          </div>

          {/* Genres & Style */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-violet-400" /> Genres & Aesthetic
            </span>
            <div className="flex flex-wrap gap-1.5">
              {musicAnalysis.genres?.map((genre, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/70 text-xs text-zinc-200"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Instrumentation */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Detected Instrumentation & Stems
            </span>
            <div className="flex flex-wrap gap-1.5">
              {musicAnalysis.instrumentation?.map((inst, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  {inst}
                </span>
              ))}
            </div>
          </div>

          {/* Harmonic Progression */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Harmonic Chord Progression
            </span>
            <p className="text-sm font-mono text-indigo-300 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
              {musicAnalysis.chordProgression || 'Not specified'}
            </p>
          </div>

          {/* Dynamic Arc & Soundstage */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Production & Soundstage
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {musicAnalysis.productionNotes || musicAnalysis.dynamicArc}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Full JSON Output */}
      {activeTab === 'json' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Structured JSON Data (Gemini Multimodal Transcription & Lyria Schema)
            </span>
            <button
              onClick={handleCopyFullJson}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 max-h-96 overflow-y-auto text-[11px] font-mono text-amber-200/90 leading-relaxed">
            {JSON.stringify(decomposition, null, 2)}
          </pre>
        </div>
      )}

      {/* Lyria Prompt Bridge Callout */}
      <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-zinc-950 p-3.5 rounded-xl border border-violet-800/40">
        <div>
          <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ready for Lyria 3.5 Generation
          </span>
          <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">
            Synthesized Prompt: "{lyria?.suggestedPrompt}"
          </p>
        </div>

        <button
          onClick={() => onSendToLyria(lyria.suggestedPrompt)}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-violet-600/20"
        >
          <span>Use in Lyria Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
