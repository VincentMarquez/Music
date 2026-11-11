import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Sliders,
  Music2,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Flame,
  Volume2,
  Mic2
} from 'lucide-react';
import { LYRIA_TEMPLATES, LYRIA_OPTIONS, LyriaTemplate } from '../data/lyriaTemplates';

interface LyriaTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateText: string) => void;
  onInsertSnippet: (snippet: string) => void;
}

export const LyriaTemplateModal: React.FC<LyriaTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onInsertSnippet,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LyriaTemplate>(LYRIA_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'templates' | 'options' | 'cheatsheet'>('templates');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">
                  Google Lyria 3.5 Prompt Guide & Templates
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Official Spec
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Structure your song into timecoded blocks, energy levels, BPM, and vocal delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-zinc-950/50 border-b border-zinc-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'templates'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Ready-to-Use Song Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'options'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>All Options & Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'cheatsheet'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syntax Cheat Sheet</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Song Templates */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Template Selector Column */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Choose a Style
                </span>
                {LYRIA_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      selectedTemplate.id === tmpl.id
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-md'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-100">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                        {tmpl.bpm} BPM
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tmpl.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Preview Column */}
              <div className="md:col-span-8 space-y-3 bg-zinc-950/70 border border-zinc-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {selectedTemplate.name}
                    </h4>
                    <span className="text-xs text-zinc-400">
                      Genre: {selectedTemplate.genre} • {selectedTemplate.bpm} BPM
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedTemplate.templateText)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onSelectTemplate(selectedTemplate.templateText);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/30"
                    >
                      <span>Load into Lyria Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap select-all">
                  {selectedTemplate.templateText}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: All Options & Parameters */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              {/* Section Types */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-bold text-zinc-200">
                    1. Song Section Types
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LYRIA_OPTIONS.sections.map((sec) => (
                    <div
                      key={sec.name}
                      onClick={() => onInsertSnippet(`[0:00 - 0:15] ${sec.name}: Intensity: 5/10. `)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 cursor-pointer group transition-all"
                    >
                      <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200 block">
                        {sec.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block line-clamp-2">
                        {sec.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intensity Levels */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-zinc-200">
                    2. Intensity Levels (0/10 to 10/10)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LYRIA_OPTIONS.intensities.map((item) => (
                    <div
                      key={item}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocal Delivery Styles */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-bold text-zinc-200">
                    3. Vocal Delivery & Microphone Placement
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LYRIA_OPTIONS.vocalStyles.map((voc) => (
                    <button
                      key={voc}
                      onClick={() => onInsertSnippet(` ${voc} `)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors"
                    >
                      + {voc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruments & SFX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-zinc-200">
                      4. Lead Instruments & Stems
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LYRIA_OPTIONS.instruments.map((inst) => (
                      <button
                        key={inst}
                        onClick={() => onInsertSnippet(` ${inst} `)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:border-emerald-500/50"
                      >
                        + {inst}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-zinc-200">
                      5. Foley & Acoustic Atmosphere
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LYRIA_OPTIONS.soundEffects.map((sfx) => (
                      <button
                        key={sfx}
                        onClick={() => onInsertSnippet(` ${sfx} `)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:border-cyan-500/50"
                      >
                        + {sfx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cheat Sheet */}
          {activeTab === 'cheatsheet' && (
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-zinc-100">
                  Lyria 3.5 Core Block Syntax
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  Every section starts with a timecode bracket <code className="text-rose-400">[MM:SS - MM:SS]</code>, followed by the section name, the intensity parameter (<code className="text-amber-400">Intensity: X/10</code>), the instrumentation/mood description, and the tempo (<code className="text-cyan-400">95 BPM</code>). Then, write your lyrics directly underneath!
                </p>
                <div className="p-3 bg-black rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 leading-relaxed">
                  <span className="text-rose-400">[0:00 - 0:15]</span> <span className="text-purple-300">Verse 1:</span> <span className="text-amber-300">Intensity: 5/10.</span> <span className="text-emerald-300">Punchy 808 sub-bass, monotone vocal, press camera flashes.</span> <span className="text-cyan-300">95 BPM</span>
                  <br /><br />
                  <span className="text-zinc-200">Step from the car,</span><br />
                  <span className="text-zinc-200">Strut through the flash,</span><br />
                  <span className="text-zinc-200">Red carpet burning under the lights!</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-sm text-zinc-100">
                    Pro Prompting Rules:
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-zinc-400 leading-relaxed">
                    <li><strong className="text-zinc-200">Timecode continuity</strong>: Ensure timestamps are sequential (e.g. 0:00–0:10, 0:10–0:25, etc.).</li>
                    <li><strong className="text-zinc-200">Energy dynamics</strong>: Start lower (1/10 to 3/10) in Intro, build in Verse (5/10), and peak at Chorus (8/10 to 10/10).</li>
                    <li><strong className="text-zinc-200">BPM consistency</strong>: Set a baseline tempo (e.g., 95 BPM), or double/half-time for dynamic breakdowns.</li>
                    <li><strong className="text-zinc-200">Instrumentals</strong>: If no vocals are desired, write <code className="text-zinc-300">&lt;instrumental&gt;</code> or describe the lead instruments.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-sm text-zinc-100">
                    Model Selection:
                  </h4>
                  <div className="space-y-2 text-zinc-400">
                    <p>
                      <strong className="text-rose-400 font-mono">lyria-3-pro-preview</strong>: Flagship model for full songs (1 to 2+ minutes), multi-section arcs, vocal storytelling, and runway collections.
                    </p>
                    <p>
                      <strong className="text-rose-400 font-mono">lyria-3-clip-preview</strong>: Fast model optimized for 30-second clips, loops, social media teasers, and rapid ideas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Click any section or instrument tag to insert it into your prompt
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
