import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Mic2,
  Disc3,
  Waves,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Sliders,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export interface StemTrack {
  id: 'vocals' | 'drums' | 'bass';
  name: string;
  color: string;
  gradientStop: string;
  volume: number; // 0 to 1.5 (0% to 150%)
  muted: boolean;
  solo: boolean;
  description: string;
}

interface StemVisualizerProps {
  onApplyBalanceToPrompt?: (mixNotes: string) => void;
}

export const StemVisualizer: React.FC<StemVisualizerProps> = ({
  onApplyBalanceToPrompt,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [stems, setStems] = useState<StemTrack[]>([
    {
      id: 'vocals',
      name: 'Vocals (Lead & Ad-libs)',
      color: '#f43f5e', // rose-500
      gradientStop: '#fb7185',
      volume: 1.0,
      muted: false,
      solo: false,
      description: 'Isolated speech, sung melodies, harmonics, and vocal throws (300Hz–4kHz)',
    },
    {
      id: 'drums',
      name: 'Drums & Percussion',
      color: '#f59e0b', // amber-500
      gradientStop: '#fbbf24',
      volume: 1.0,
      muted: false,
      solo: false,
      description: 'Kick drum downbeats, 16th-note hi-hats, claps, and snare rolls',
    },
    {
      id: 'bass',
      name: 'Bass & Sub-Octave',
      color: '#06b6d4', // cyan-500
      gradientStop: '#38bdf8',
      volume: 1.0,
      muted: false,
      solo: false,
      description: '808 sub-bass glides, pumping 8th-note analog bassline (30Hz–250Hz)',
    },
  ]);

  const [activePreset, setActivePreset] = useState<string>('balanced');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Generate synthetic waveform frequency data points for each stem
  const stemWaveformPoints = useMemo(() => {
    const numPoints = 80;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
      const x = i;
      // Vocals: Formant peaks, lyrical dynamics
      const vocalEnvelope =
        Math.sin(i * 0.25) * 0.4 +
        Math.sin(i * 0.8) * 0.25 +
        Math.cos(i * 0.1) * 0.35;

      // Drums: Sharp transient spikes on beats and subdivisions
      const isBeat = i % 8 === 0 || i % 8 === 4;
      const drumSpike = isBeat ? 0.9 : (i % 2 === 0 ? 0.4 : 0.15);
      const drumEnvelope = drumSpike + (Math.random() * 0.15);

      // Bass: Deep sinusoidal sub pulses
      const bassEnvelope =
        Math.sin(i * 0.15) * 0.6 +
        Math.sin(i * 0.05) * 0.3 + 0.1;

      points.push({
        x,
        vocal: Math.abs(vocalEnvelope),
        drum: Math.abs(drumEnvelope),
        bass: Math.abs(bassEnvelope),
      });
    }
    return points;
  }, []);

  // Update Stem Volume Slider
  const handleVolumeChange = (id: 'vocals' | 'drums' | 'bass', newVolume: number) => {
    setActivePreset('custom');
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, volume: newVolume } : s))
    );
  };

  // Toggle Mute
  const handleToggleMute = (id: 'vocals' | 'drums' | 'bass') => {
    setActivePreset('custom');
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, muted: !s.muted } : s))
    );
  };

  // Toggle Solo
  const handleToggleSolo = (id: 'vocals' | 'drums' | 'bass') => {
    setActivePreset('custom');
    setStems((prev) => {
      const target = prev.find((s) => s.id === id);
      const isCurrentlySolo = target?.solo;
      return prev.map((s) => {
        if (isCurrentlySolo) {
          return { ...s, solo: false };
        }
        return { ...s, solo: s.id === id };
      });
    });
  };

  // Preset Handlers
  const handleApplyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === 'balanced') {
      setStems((prev) =>
        prev.map((s) => ({ ...s, volume: 1.0, muted: false, solo: false }))
      );
    } else if (presetName === 'acappella') {
      setStems((prev) =>
        prev.map((s) => ({
          ...s,
          volume: s.id === 'vocals' ? 1.3 : 0.2,
          muted: false,
          solo: false,
        }))
      );
    } else if (presetName === 'instrumental') {
      setStems((prev) =>
        prev.map((s) => ({
          ...s,
          volume: s.id === 'vocals' ? 0.0 : 1.1,
          muted: s.id === 'vocals',
          solo: false,
        }))
      );
    } else if (presetName === 'bass-heavy') {
      setStems((prev) =>
        prev.map((s) => ({
          ...s,
          volume: s.id === 'bass' ? 1.4 : s.id === 'drums' ? 1.1 : 0.75,
          muted: false,
          solo: false,
        }))
      );
    }
  };

  // Render D3 SVG Multi-Waveform Area Charts
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 720;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 35 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate effective volumes (accounting for solo and mute)
    const hasSolo = stems.some((s) => s.solo);
    const getEffectiveVolume = (id: 'vocals' | 'drums' | 'bass') => {
      const stem = stems.find((s) => s.id === id);
      if (!stem) return 0;
      if (stem.muted) return 0;
      if (hasSolo && !stem.solo) return 0;
      return stem.volume;
    };

    const vocalGain = getEffectiveVolume('vocals');
    const drumGain = getEffectiveVolume('drums');
    const bassGain = getEffectiveVolume('bass');

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, stemWaveformPoints.length - 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 2.5])
      .range([innerHeight, 0]);

    // Background horizontal grid lines
    const yGrid = d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.domain').remove();

    // Defs for gradients
    const defs = svg.append('defs');

    // Stem Gradients
    stems.forEach((stem) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `stem-grad-${stem.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', stem.color)
        .attr('stop-opacity', 0.65);

      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', stem.gradientStop)
        .attr('stop-opacity', 0.05);
    });

    // 1. Draw Bass Stem Area
    const bassArea = d3
      .area<any>()
      .x((d) => xScale(d.x))
      .y0(innerHeight)
      .y1((d) => yScale(Math.min(2.4, d.bass * bassGain)))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', `url(#stem-grad-bass)`)
      .attr('d', bassArea)
      .attr('opacity', bassGain > 0 ? 0.8 : 0.1);

    const bassLine = d3
      .line<any>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(Math.min(2.4, d.bass * bassGain)))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', bassGain > 0 ? 2 : 0.5)
      .attr('d', bassLine);

    // 2. Draw Drums Stem Area
    const drumArea = d3
      .area<any>()
      .x((d) => xScale(d.x))
      .y0(innerHeight)
      .y1((d) => yScale(Math.min(2.4, d.drum * drumGain)))
      .curve(d3.curveLinear);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', `url(#stem-grad-drums)`)
      .attr('d', drumArea)
      .attr('opacity', drumGain > 0 ? 0.7 : 0.1);

    const drumLine = d3
      .line<any>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(Math.min(2.4, d.drum * drumGain)))
      .curve(d3.curveLinear);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', drumGain > 0 ? 1.75 : 0.5)
      .attr('d', drumLine);

    // 3. Draw Vocals Stem Area
    const vocalArea = d3
      .area<any>()
      .x((d) => xScale(d.x))
      .y0(innerHeight)
      .y1((d) => yScale(Math.min(2.4, d.vocal * vocalGain)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', `url(#stem-grad-vocals)`)
      .attr('d', vocalArea)
      .attr('opacity', vocalGain > 0 ? 0.85 : 0.1);

    const vocalLine = d3
      .line<any>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(Math.min(2.4, d.vocal * vocalGain)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(stemWaveformPoints)
      .attr('fill', 'none')
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', vocalGain > 0 ? 2.5 : 0.5)
      .attr('d', vocalLine);

    // X Axis with Time Timeline Markers
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => {
        const sec = Math.round((Number(d) / (stemWaveformPoints.length - 1)) * 30);
        return `0:${sec < 10 ? '0' : ''}${sec}`;
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#71717a')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    g.selectAll('.tick line').attr('stroke', '#3f3f46');
    g.select('.domain').attr('stroke', '#3f3f46');

    // Y Axis Amplitude dB readout
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickFormat((d) => `${Math.round(Number(d) * 6 - 6)}dB`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#71717a')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');
  }, [stems, stemWaveformPoints]);

  // Construct musical prompt string based on current stem balance
  const constructMixPrompt = () => {
    const hasSolo = stems.some((s) => s.solo);
    const vocalStem = stems.find((s) => s.id === 'vocals')!;
    const drumStem = stems.find((s) => s.id === 'drums')!;
    const bassStem = stems.find((s) => s.id === 'bass')!;

    const vocalDesc = vocalStem.muted || (hasSolo && !vocalStem.solo)
      ? 'Vocals muted (<instrumental>)'
      : `Vocals at ${Math.round(vocalStem.volume * 100)}% (${vocalStem.volume > 1 ? 'boosted dead-center' : 'natural presence'})`;

    const drumDesc = drumStem.muted || (hasSolo && !drumStem.solo)
      ? 'Drums filtered/muted'
      : `Drums at ${Math.round(drumStem.volume * 100)}% (${drumStem.volume > 1.1 ? 'heavy punchy transients' : 'standard groove'})`;

    const bassDesc = bassStem.muted || (hasSolo && !bassStem.solo)
      ? 'Sub-bass attenuated'
      : `Bass at ${Math.round(bassStem.volume * 100)}% (${bassStem.volume > 1.1 ? 'saturated 808 sub overdrive' : 'clean low-end'})`;

    return `[Stem Balance Mix: ${vocalDesc}, ${drumDesc}, ${bassDesc}]`;
  };

  const handleApplyToPrompt = () => {
    if (onApplyBalanceToPrompt) {
      const mixText = constructMixPrompt();
      onApplyBalanceToPrompt(mixText);
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 2500);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-4 shadow-xl">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-amber-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-zinc-200" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              Isolated Audio Stems Balance
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                D3 Spectral Waveform
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Inspect separated stems and fine-tune gain levels before recomposition
            </p>
          </div>
        </div>

        {/* Mix Balance Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {[
            { id: 'balanced', label: 'Balanced' },
            { id: 'acappella', label: 'A Cappella' },
            { id: 'instrumental', label: 'Instrumental' },
            { id: 'bass-heavy', label: '808 Bass-Heavy' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activePreset === preset.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-transparent'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* D3 Multi-Waveform SVG Visualization */}
      <div className="p-3 bg-black/60 rounded-xl border border-zinc-800/80 relative overflow-hidden">
        {/* Legend */}
        <div className="flex items-center justify-end gap-3 mb-1 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
            <span className="text-rose-300">Vocals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50" />
            <span className="text-amber-300">Drums</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-sm shadow-cyan-500/50" />
            <span className="text-cyan-300">Bass</span>
          </div>
        </div>

        {/* The D3 SVG Element */}
        <svg
          ref={svgRef}
          viewBox="0 0 720 180"
          className="w-full h-36 overflow-visible select-none"
        />
      </div>

      {/* 3 Interactive Stem Slider Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stems.map((stem) => {
          const isMuted = stem.muted;
          const isSolo = stem.solo;
          const pct = Math.round(stem.volume * 100);

          return (
            <div
              key={stem.id}
              className={`p-3.5 rounded-xl border transition-all ${
                stem.id === 'vocals'
                  ? 'bg-rose-950/20 border-rose-900/30'
                  : stem.id === 'drums'
                  ? 'bg-amber-950/20 border-amber-900/30'
                  : 'bg-cyan-950/20 border-cyan-900/30'
              }`}
            >
              {/* Channel Strip Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {stem.id === 'vocals' && <Mic2 className="w-4 h-4 text-rose-400" />}
                  {stem.id === 'drums' && <Disc3 className="w-4 h-4 text-amber-400" />}
                  {stem.id === 'bass' && <Waves className="w-4 h-4 text-cyan-400" />}
                  <span className="text-xs font-bold text-zinc-100">
                    {stem.name.split(' ')[0]}
                  </span>
                </div>

                {/* Mute and Solo Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleMute(stem.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                      isMuted
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Mute Channel"
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleToggleSolo(stem.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                      isSolo
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Solo Channel"
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Slider & Level Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">Gain:</span>
                  <span
                    className="font-bold"
                    style={{ color: isMuted ? '#71717a' : stem.color }}
                  >
                    {isMuted ? 'MUTED' : `${pct}% (${(stem.volume * 6 - 6).toFixed(1)} dB)`}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={stem.volume}
                  disabled={isMuted}
                  onChange={(e) =>
                    handleVolumeChange(stem.id, parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                  style={{
                    accentColor: stem.color,
                  }}
                />

                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>0%</span>
                  <span>100% (0dB)</span>
                  <span>150% (+3dB)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {stem.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Footer: Apply Balance to Lyria Prompt */}
      {onApplyBalanceToPrompt && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <div className="text-xs text-zinc-300 font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-zinc-400">Active Mix:</span>
            <span className="text-zinc-200 truncate max-w-sm">
              {constructMixPrompt()}
            </span>
          </div>

          <button
            onClick={handleApplyToPrompt}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/20 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{appliedNotice ? 'Balance Applied to Lyria!' : 'Inject Stem Mix into Prompt'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
