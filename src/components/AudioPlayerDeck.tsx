import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  Music,
  Share2,
  Check,
  Split,
  FileAudio
} from 'lucide-react';
import { GeneratedMusicTrack } from '../types/music';

interface AudioPlayerDeckProps {
  currentTrack: GeneratedMusicTrack | null;
  originalMediaUrl?: string | null;
  originalFileName?: string | null;
}

export const AudioPlayerDeck: React.FC<AudioPlayerDeckProps> = ({
  currentTrack,
  originalMediaUrl,
  originalFileName,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // A/B Comparison: 'generated' or 'original'
  const [comparisonSource, setComparisonSource] = useState<'generated' | 'original'>('generated');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Reset playback on track change
    setIsPlaying(false);
    setCurrentTime(0);
    setComparisonSource('generated');
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const activeAudioUrl =
    comparisonSource === 'original' && originalMediaUrl
      ? originalMediaUrl
      : currentTrack.audioUrl;

  const activeTitle =
    comparisonSource === 'original' && originalFileName
      ? `Original Source: ${originalFileName}`
      : currentTrack.title;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentTrack.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentTrack.audioUrl;
    a.download = `${currentTrack.title.replace(/\s+/g, '_')}_lyria.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        loop={isLooping}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white shrink-0">
            <Music className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {currentTrack.model}
              </span>
              {currentTrack.isSynthesizedFallback && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Acoustic Studio Synth
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-zinc-100 truncate mt-0.5">
              {activeTitle}
            </h3>
          </div>
        </div>

        {/* A/B Source Toggle (if original media available) */}
        {originalMediaUrl && (
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
            <button
              onClick={() => {
                setComparisonSource('generated');
                setIsPlaying(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                comparisonSource === 'generated'
                  ? 'bg-rose-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lyria Output
            </button>
            <button
              onClick={() => {
                setComparisonSource('original');
                setIsPlaying(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                comparisonSource === 'original'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Original Source
            </button>
          </div>
        )}
      </div>

      {/* Visualizer Simulation Bars */}
      <div className="my-4 h-14 bg-zinc-950/80 rounded-xl border border-zinc-800/80 px-4 flex items-center justify-between gap-1 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => {
          const progress = duration > 0 ? currentTime / duration : 0;
          const barRatio = i / 48;
          const isPast = barRatio <= progress;
          // compute animated height
          const height = isPlaying
            ? Math.sin((i * 12 + currentTime * 8)) * 35 + 45
            : 20 + Math.sin(i * 0.5) * 15;

          return (
            <div
              key={i}
              className="flex-1 flex items-end justify-center h-full py-2"
            >
              <div
                style={{ height: `${Math.max(12, Math.min(100, height))}%` }}
                className={`w-full rounded-full transition-all duration-75 ${
                  isPast
                    ? 'bg-gradient-to-t from-rose-600 to-amber-400'
                    : 'bg-zinc-800'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Scrubber & Time */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isLooping
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-zinc-400">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:text-zinc-200"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400 hidden sm:block"
            />
          </div>
        </div>

        {/* Big Play / Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Action Buttons: Copy Prompt & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPrompt}
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Copy Prompt"
          >
            {copiedPrompt ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export WAV</span>
          </button>
        </div>
      </div>

      {/* Prompt Card */}
      <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
          Generated with Prompt:
        </span>
        <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
          "{currentTrack.prompt}"
        </p>
      </div>
    </div>
  );
};
