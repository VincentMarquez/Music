import React, { useMemo } from 'react';
import {
  Flame,
  Gauge,
  SlidersHorizontal,
  Plus,
  Trash2,
  TrendingUp,
  Activity,
  Zap,
  Music,
  Clock,
  Volume2,
  Sparkles,
  Layers
} from 'lucide-react';
import { PromptTimelineSection } from '../types/music';

interface VisualArcEditorProps {
  timeline: PromptTimelineSection[];
  onChange: (updatedTimeline: PromptTimelineSection[]) => void;
}

export const VisualArcEditor: React.FC<VisualArcEditorProps> = ({
  timeline,
  onChange,
}) => {
  // Parse numeric intensity from "X/10"
  const getNumericIntensity = (intensityStr: string): number => {
    const match = intensityStr?.match(/(\d+)/);
    if (!match) return 5;
    const val = parseInt(match[1], 10);
    return Math.max(0, Math.min(10, isNaN(val) ? 5 : val));
  };

  // Parse numeric BPM
  const getNumericBpm = (bpmVal: string | number): number => {
    const num = typeof bpmVal === 'number' ? bpmVal : parseInt(String(bpmVal).replace(/\D/g, ''), 10);
    return isNaN(num) || num <= 0 ? 120 : num;
  };

  // Color mapping based on intensity 0-10
  const getIntensityColor = (val: number): { bg: string; text: string; bar: string } => {
    if (val <= 2) {
      return {
        bg: 'bg-cyan-500/10 border-cyan-500/30',
        text: 'text-cyan-400',
        bar: 'from-cyan-500 to-blue-500',
      };
    }
    if (val <= 5) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        text: 'text-emerald-400',
        bar: 'from-blue-500 to-emerald-500',
      };
    }
    if (val <= 7) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30',
        text: 'text-amber-400',
        bar: 'from-emerald-500 to-amber-500',
      };
    }
    return {
      bg: 'bg-rose-500/10 border-rose-500/30',
      text: 'text-rose-400',
      bar: 'from-amber-500 to-rose-600',
    };
  };

  const handleUpdateSection = (index: number, updates: Partial<PromptTimelineSection>) => {
    const updated = timeline.map((sec, i) => {
      if (i === index) {
        return { ...sec, ...updates };
      }
      return sec;
    });
    onChange(updated);
  };

  const handleIntensitySliderChange = (index: number, numVal: number) => {
    handleUpdateSection(index, { intensity: `${numVal}/10` });
  };

  const handleBpmSliderChange = (index: number, numVal: number) => {
    handleUpdateSection(index, { bpm: numVal });
  };

  const handleAddSection = () => {
    const lastSec = timeline[timeline.length - 1];
    const newSec: PromptTimelineSection = {
      timeRange: lastSec ? `${lastSec.timeRange.split('-')[1]?.trim() || '2:34'} - 2:45` : '0:00 - 0:15',
      section: 'New Section',
      intensity: '5/10',
      bpm: lastSec ? getNumericBpm(lastSec.bpm) : 120,
      styleNotes: 'Describe instrumentation or acoustic elements',
      lyrics: '',
    };
    onChange([...timeline, newSec]);
  };

  const handleDeleteSection = (index: number) => {
    if (timeline.length <= 1) return;
    onChange(timeline.filter((_, i) => i !== index));
  };

  // Batch Presets
  const applyCrescendoCurve = () => {
    if (timeline.length === 0) return;
    const updated = timeline.map((sec, i) => {
      const step = Math.round(1 + (i / Math.max(1, timeline.length - 1)) * 9);
      return { ...sec, intensity: `${step}/10` };
    });
    onChange(updated);
  };

  const applyClubEnergyCurve = () => {
    if (timeline.length === 0) return;
    const updated = timeline.map((sec, i) => {
      const name = sec.section.toLowerCase();
      let val = 5;
      if (name.includes('intro') || name.includes('atmosphere')) val = 2;
      else if (name.includes('verse')) val = 6;
      else if (name.includes('chorus') || name.includes('drop')) val = 9;
      else if (name.includes('bridge') || name.includes('break')) val = 3;
      else if (name.includes('build') || name.includes('climax')) val = 10;
      else if (name.includes('outro')) val = 4;
      else val = Math.min(10, Math.max(2, (i % 2 === 0 ? 5 : 8)));
      return { ...sec, intensity: `${val}/10` };
    });
    onChange(updated);
  };

  const applyUniformBpm = (targetBpm: number) => {
    const updated = timeline.map((sec) => ({ ...sec, bpm: targetBpm }));
    onChange(updated);
  };

  // Generate SVG curve points
  const svgPathData = useMemo(() => {
    if (timeline.length === 0) return '';
    const width = 800;
    const height = 100;
    const padding = 20;

    const points = timeline.map((sec, idx) => {
      const x = padding + (idx / Math.max(1, timeline.length - 1)) * (width - padding * 2);
      const intensity = getNumericIntensity(sec.intensity);
      const y = height - padding - (intensity / 10) * (height - padding * 2);
      return { x, y, intensity, section: sec.section };
    });

    if (points.length === 1) {
      return `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [timeline]);

  return (
    <div className="space-y-4">
      {/* 1. Interactive Dynamic Energy Arc (SVG Curve) */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-zinc-200">
              Song Emotional Energy Arc (0–10 Intensity Curve)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {timeline.length} Cued Segments
          </span>
        </div>

        {/* SVG Curve Display */}
        <div className="relative w-full h-24 bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden px-2">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
            <div className="border-b border-rose-500 w-full" />
            <div className="border-b border-amber-500 w-full" />
            <div className="border-b border-emerald-500 w-full" />
            <div className="border-b border-cyan-500 w-full" />
          </div>

          <svg
            viewBox="0 0 800 100"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <path
              d={svgPathData}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Interactive Section Dots */}
            {timeline.map((sec, idx) => {
              const x = 20 + (idx / Math.max(1, timeline.length - 1)) * 760;
              const intensity = getNumericIntensity(sec.intensity);
              const y = 80 - (intensity / 10) * 60;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="5"
                  className="fill-white stroke-zinc-950 stroke-2 hover:r-7 transition-all cursor-pointer"
                >
                  <title>
                    {sec.timeRange} • {sec.section}: {sec.intensity} ({sec.bpm} BPM)
                  </title>
                </circle>
              );
            })}
          </svg>
        </div>

        {/* Quick Energy Curve Presets & Master Controls Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Curve Presets:
            </span>
            <button
              onClick={applyClubEnergyCurve}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 transition-colors"
            >
              ⚡ Club / Runway Arc
            </button>
            <button
              onClick={applyCrescendoCurve}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 transition-colors"
            >
              📈 Crescendo Build
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" /> Global BPM:
            </span>
            {[95, 120, 128].map((presetBpm) => (
              <button
                key={presetBpm}
                onClick={() => applyUniformBpm(presetBpm)}
                className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] font-mono text-cyan-300 transition-colors"
              >
                {presetBpm}
              </button>
            ))}
            <button
              onClick={handleAddSection}
              className="ml-2 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Segment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Segmented Block Cards with Dual Sliders */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {timeline.map((sec, index) => {
          const intensityNum = getNumericIntensity(sec.intensity);
          const bpmNum = getNumericBpm(sec.bpm);
          const colors = getIntensityColor(intensityNum);

          return (
            <div
              key={index}
              className={`p-3.5 rounded-2xl border transition-all ${colors.bg} backdrop-blur-sm shadow-md`}
            >
              {/* Card Header: Timecode + Section Name + Delete Button */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-zinc-800 font-mono text-[11px] text-zinc-300 shrink-0">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <input
                      type="text"
                      value={sec.timeRange}
                      onChange={(e) =>
                        handleUpdateSection(index, { timeRange: e.target.value })
                      }
                      className="bg-transparent border-none text-[11px] font-mono text-zinc-200 focus:outline-none w-24"
                    />
                  </div>

                  <input
                    type="text"
                    value={sec.section}
                    onChange={(e) =>
                      handleUpdateSection(index, { section: e.target.value })
                    }
                    className="font-bold text-xs text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-rose-500 focus:outline-none px-1 py-0.5 truncate flex-1"
                    placeholder="Section Name (e.g. Verse 1, Chorus)"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} font-mono`}
                  >
                    {intensityNum}/10
                  </span>
                  <span className="text-xs font-bold text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                    {bpmNum} BPM
                  </span>
                  {timeline.length > 1 && (
                    <button
                      onClick={() => handleDeleteSection(index)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-md hover:bg-zinc-800 transition-colors"
                      title="Delete Segment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders Grid: Intensity Slider + BPM Slider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 mb-3">
                {/* 1. INTENSITY SLIDER (0-10) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1">
                      <Flame className={`w-3.5 h-3.5 ${colors.text}`} />
                      Intensity Level:
                    </span>
                    <span className={`font-mono font-bold ${colors.text}`}>
                      {intensityNum}/10{' '}
                      <span className="font-normal text-[10px] text-zinc-400">
                        ({intensityNum <= 2 ? 'Ambient' : intensityNum <= 5 ? 'Groove' : intensityNum <= 8 ? 'High' : 'Peak Drop'})
                      </span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={intensityNum}
                    onChange={(e) =>
                      handleIntensitySliderChange(index, parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />

                  {/* Micro Intensity Quick Chips */}
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
                    {[0, 2, 5, 8, 10].map((quickVal) => (
                      <button
                        key={quickVal}
                        onClick={() => handleIntensitySliderChange(index, quickVal)}
                        className={`hover:text-zinc-200 transition-colors ${
                          intensityNum === quickVal ? 'text-zinc-200 font-bold' : ''
                        }`}
                      >
                        {quickVal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. BPM SLIDER (60-180) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      Tempo (BPM):
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {bpmNum} BPM
                    </span>
                  </div>

                  <input
                    type="range"
                    min="60"
                    max="180"
                    step="1"
                    value={bpmNum}
                    onChange={(e) =>
                      handleBpmSliderChange(index, parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />

                  {/* Micro BPM Quick Chips */}
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
                    {[80, 95, 120, 140, 175].map((quickBpm) => (
                      <button
                        key={quickBpm}
                        onClick={() => handleBpmSliderChange(index, quickBpm)}
                        className={`hover:text-zinc-200 transition-colors ${
                          bpmNum === quickBpm ? 'text-cyan-300 font-bold' : ''
                        }`}
                      >
                        {quickBpm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lyrics / Micro-Vocal Delivery Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3 text-zinc-400" />
                    Vocal Delivery & Sung / Spoken Lyrics:
                  </span>
                  <span className="italic">Optional for instrumental cues</span>
                </div>
                <textarea
                  value={sec.lyrics}
                  onChange={(e) =>
                    handleUpdateSection(index, { lyrics: e.target.value })
                  }
                  rows={2}
                  placeholder={`"Lyric lines, sung melodies, or vocal exclamations..."`}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 leading-relaxed font-sans"
                />
              </div>

              {/* Style / Cue Notes Input */}
              <div className="mt-2">
                <input
                  type="text"
                  value={sec.styleNotes}
                  onChange={(e) =>
                    handleUpdateSection(index, { styleNotes: e.target.value })
                  }
                  placeholder="Atmosphere, sound effects, instrument cues (e.g. four-on-the-floor kick, 808 sub-bass, filter sweep)..."
                  className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
