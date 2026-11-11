import React from 'react';
import { Play, Download, Trash2, Clock, Sparkles } from 'lucide-react';
import { GeneratedMusicTrack } from '../types/music';

interface TrackHistoryProps {
  tracks: GeneratedMusicTrack[];
  currentTrackId?: string;
  onSelectTrack: (track: GeneratedMusicTrack) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const TrackHistory: React.FC<TrackHistoryProps> = ({
  tracks,
  currentTrackId,
  onSelectTrack,
  onDeleteTrack,
}) => {
  if (tracks.length === 0) return null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Session Track Takes ({tracks.length})</span>
        </h3>
        <span className="text-[11px] text-zinc-400">Click to load into player</span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tracks.map((track) => {
          const isSelected = track.id === currentTrackId;
          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-sm'
                  : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 group-hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {track.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    {track.model} • {new Date(track.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={track.audioUrl}
                  download={`${track.title.replace(/\s+/g, '_')}.wav`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Download WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack(track.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Delete take"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
