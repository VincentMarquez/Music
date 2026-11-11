import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Music4,
  Volume2,
  SlidersHorizontal,
  Image as ImageIcon,
  X,
  Play,
  RotateCcw,
  Zap,
  Code2,
  FileCode,
  FileJson,
  Layers,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { VariationSuggestion, PromptTimelineSection } from '../types/music';
import { blobToBase64 } from '../utils/audioSynthesis';
import {
  textToTimelineJson,
  timelineJsonToText,
  generatePythonScript,
} from '../utils/promptFormatters';
import { LyriaTemplateModal } from './LyriaTemplateModal';
import { VisualArcEditor } from './VisualArcEditor';

interface LyriaStudioProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  variations: VariationSuggestion[];
  isGenerating: boolean;
  streamStatus?: string;
  onGenerateMusic: (config: {
    prompt: string;
    model: string;
    referenceImageBase64?: string;
  }) => void;
  lastErrorMessage?: string | null;
  onFallbackSynthesize?: () => void;
}

const STYLE_ENHANCERS = [
  '80s Synthwave & Neon Arps',
  'Deep 808 Sub-bass & Trap Grooves',
  'Orchestral Strings & Brass Swells',
  'Chill Lo-Fi Hip Hop Vinyl Crackle',
  'Dreamy Neo-Soul Rhodes Piano',
  'Driving Cyberpunk Industrial Beats',
  'Acoustic Unplugged Warmth',
];

export const LyriaStudio: React.FC<LyriaStudioProps> = ({
  prompt,
  onPromptChange,
  variations,
  isGenerating,
  streamStatus,
  onGenerateMusic,
  lastErrorMessage,
  onFallbackSynthesize,
}) => {
  const [selectedModel, setSelectedModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>(
    'lyria-3-pro-preview'
  );
  const [viewMode, setViewMode] = useState<'visual' | 'timeline' | 'json' | 'python'>('visual');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const handleVisualTimelineChange = (updatedTimeline: PromptTimelineSection[]) => {
    const formattedText = timelineJsonToText({ timeline: updatedTimeline });
    onPromptChange(formattedText);
  };

  const [referenceImage, setReferenceImage] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
  } | null>(null);

  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync JSON state whenever prompt changes in timeline mode
  useEffect(() => {
    if (viewMode !== 'json') {
      try {
        const jsonObj = textToTimelineJson(prompt);
        setJsonContent(JSON.stringify(jsonObj, null, 2));
      } catch {
        // ignore
      }
    }
  }, [prompt, viewMode]);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const base64 = await blobToBase64(file);
      setReferenceImage({ file, previewUrl, base64 });
    }
  };

  const removeReferenceImage = () => {
    if (referenceImage) {
      URL.revokeObjectURL(referenceImage.previewUrl);
    }
    setReferenceImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleApplyEnhancer = (enhancer: string) => {
    const current = prompt.trim();
    if (!current) {
      onPromptChange(enhancer);
      return;
    }
    if (current.includes(enhancer)) return;
    onPromptChange(`${current}\n\n[Section: Mod]: ${enhancer}`);
  };

  const handleJsonChange = (newJson: string) => {
    setJsonContent(newJson);
    try {
      const parsed = JSON.parse(newJson);
      const formattedText = timelineJsonToText(parsed);
      onPromptChange(formattedText);
    } catch {
      // Waiting for valid JSON while typing
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyPython = () => {
    const code = generatePythonScript(prompt, selectedModel);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRefinePrompt = async () => {
    if (!prompt.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: prompt,
          instruction:
            refineInstruction ||
            'Refine timecoded sections [0:00 - 0:10], intensity levels, BPM, 808s, and vocal lyrics for runway aesthetic',
        }),
      });
      const data = await res.json();
      if (data.refinedPrompt) {
        onPromptChange(data.refinedPrompt);
      }
    } catch (err) {
      console.error('Error refining prompt:', err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = () => {
    // If in JSON mode, send current prompt (or convert json if needed)
    let payloadPrompt = prompt.trim();
    if (viewMode === 'json') {
      try {
        const parsed = JSON.parse(jsonContent);
        payloadPrompt = timelineJsonToText(parsed);
      } catch {
        payloadPrompt = jsonContent;
      }
    }

    onGenerateMusic({
      prompt: payloadPrompt,
      model: selectedModel,
      referenceImageBase64: referenceImage?.base64,
    });
  };

  // Parse sections for visual cards preview
  const parsedTimeline = textToTimelineJson(prompt).timeline;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/30">
            2
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Lyria 3.5 Music Production Studio
              <span className="text-[11px] font-normal text-rose-400 font-mono">
                Google GenAI
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Format prompt as structured JSON or timecoded song sections
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Template Library Button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-zinc-900 hover:from-rose-900/50 hover:to-purple-900/50 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Templates & Options</span>
          </button>

          {/* Model Switcher */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedModel('lyria-3-pro-preview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedModel === 'lyria-3-pro-preview'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lyria Pro
            </button>
            <button
              onClick={() => setSelectedModel('lyria-3-clip-preview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedModel === 'lyria-3-clip-preview'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lyria Clip
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Variations Pills */}
      {variations && variations.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI Musicologist Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => onPromptChange(v.prompt)}
                className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 transition-all text-left text-xs"
              >
                <span className="font-semibold text-zinc-200 block truncate">
                  {v.styleName}
                </span>
                <span className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                  {v.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2 mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'visual'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-200" />
            <span>Interactive Sliders & Arc</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'timeline'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Raw Prompt Text</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'json'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON Mode</span>
          </button>
          <button
            onClick={() => setViewMode('python')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'python'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Python SDK</span>
          </button>
        </div>

        {/* Copy Buttons */}
        {viewMode === 'json' && (
          <button
            onClick={handleCopyJson}
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
                <span>Copy JSON</span>
              </>
            )}
          </button>
        )}

        {viewMode === 'python' && (
          <button
            onClick={handleCopyPython}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Python</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      {viewMode === 'visual' && (
        <VisualArcEditor
          timeline={parsedTimeline}
          onChange={handleVisualTimelineChange}
        />
      )}

      {viewMode === 'timeline' && (
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="[0:00 - 0:10] Intro: Intensity: 0/10...\n[0:10 - 0:20] Verse: Intensity: 5/10. Monotone 808 beat 95 BPM...\n[Lyrics...]"
            rows={7}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all font-mono leading-relaxed"
          />
        </div>
      )}

      {viewMode === 'json' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Structured JSON Timeline & Song Parameters</span>
            <span className="text-amber-400 font-mono">schema: timeline[]</span>
          </div>
          <textarea
            value={jsonContent}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={10}
            className="w-full bg-zinc-950/90 border border-amber-900/30 rounded-xl p-3 text-xs text-amber-200/90 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono leading-relaxed"
          />
        </div>
      )}

      {viewMode === 'python' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Executable Google GenAI Python Code (lyria-3-pro-preview)</span>
            <span className="text-cyan-400 font-mono">pip install google-genai</span>
          </div>
          <pre className="w-full max-h-64 overflow-y-auto bg-zinc-950/95 border border-cyan-900/40 rounded-xl p-3 text-[11px] text-cyan-200 font-mono leading-relaxed select-all">
            {generatePythonScript(prompt, selectedModel)}
          </pre>
        </div>
      )}

      {/* Visual Timeline Section Cards */}
      {parsedTimeline && parsedTimeline.length > 0 && viewMode === 'timeline' && (
        <div className="mt-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-rose-400" />
            Detected Song Timeline Segments ({parsedTimeline.length}):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {parsedTimeline.map((sec, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                  <span className="text-rose-400 font-semibold">{sec.timeRange}</span>
                  <span className="text-amber-300">{sec.bpm} BPM</span>
                </div>
                <div className="font-semibold text-zinc-200 truncate">
                  {sec.section} • {sec.intensity}
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {sec.lyrics || sec.styleNotes || 'Instrumental'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Style Enhancer Chips */}
      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Inject Sonic Element:
        </span>
        {STYLE_ENHANCERS.map((enhancer) => (
          <button
            key={enhancer}
            onClick={() => handleApplyEnhancer(enhancer)}
            className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-[11px] text-zinc-300 transition-colors"
          >
            + {enhancer}
          </button>
        ))}
      </div>

      {/* Advanced Refine / Visual Inspiration Row */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Gemini Prompt Co-Producer */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={refineInstruction}
            onChange={(e) => setRefineInstruction(e.target.value)}
            placeholder="E.g. Add 808s and runway monotone lyrics at 95 BPM..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <button
            type="button"
            onClick={handleRefinePrompt}
            disabled={isRefining || !prompt.trim()}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            {isRefining ? (
              <RotateCcw className="w-3 h-3 animate-spin text-rose-400" />
            ) : (
              <Wand2 className="w-3 h-3 text-rose-400" />
            )}
            <span>Refine</span>
          </button>
        </div>

        {/* Multimodal Image Inspiration */}
        <div className="flex items-center justify-end gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {!referenceImage ? (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="text-xs text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Attach Visual Inspiration (Optional)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
              <img
                src={referenceImage.previewUrl}
                alt="Reference"
                className="w-5 h-5 rounded object-cover"
              />
              <span className="text-[11px] text-zinc-300 truncate max-w-[120px]">
                {referenceImage.file.name}
              </span>
              <button
                onClick={removeReferenceImage}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error / Quota Notice Banner with Instant Fallback */}
      {lastErrorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex flex-col gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300 text-sm">
                {lastErrorMessage.includes('spending cap') || lastErrorMessage.includes('RESOURCE_EXHAUSTED')
                  ? 'Google AI Studio Project Monthly Spending Cap Reached'
                  : 'Lyria API Notice'}
              </p>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {lastErrorMessage.includes('spending cap') || lastErrorMessage.includes('RESOURCE_EXHAUSTED')
                  ? 'Your Google Cloud project has reached its monthly spend cap on Google AI Studio. You can raise or manage your spending cap at ai.studio/spend, or generate an instant arrangement with the Acoustic Studio Engine below.'
                  : lastErrorMessage}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-900/40">
            {(lastErrorMessage.includes('spending cap') || lastErrorMessage.includes('RESOURCE_EXHAUSTED')) && (
              <a
                href="https://ai.studio/spend"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
              >
                <span>Manage Project Spend Cap (ai.studio/spend)</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}

            {onFallbackSynthesize && (
              <button
                onClick={onFallbackSynthesize}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-200 border border-amber-700/60 font-medium text-xs flex items-center gap-1.5 transition-colors shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Preview via Acoustic Engine (Free / Instant)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generation Trigger Button */}
      <div className="mt-5">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            isGenerating
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : !prompt.trim()
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white shadow-rose-600/30 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-rose-400 shrink-0" />
              <span className="truncate">
                {streamStatus || `Composing with Lyria 3.5 (${elapsedSeconds}s elapsed)...`}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                Create Music with Lyria 3.5 ({selectedModel === 'lyria-3-clip-preview' ? 'Clip' : 'Full Track'})
              </span>
            </>
          )}
        </button>
      </div>

      {/* Lyria Template & Option Reference Modal */}
      <LyriaTemplateModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={(newTmpl) => onPromptChange(newTmpl)}
        onInsertSnippet={(snippet) => {
          onPromptChange(prompt ? `${prompt.trim()}\n${snippet}` : snippet);
        }}
      />
    </div>
  );
};
