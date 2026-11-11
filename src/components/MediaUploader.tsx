import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileAudio,
  FileVideo,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Volume2,
  Music2,
  Film
} from 'lucide-react';
import { generateDemoTrackWav, blobToBase64 } from '../utils/audioSynthesis';

interface MediaUploaderProps {
  onMediaSelected: (data: {
    file?: File;
    audioBase64?: string;
    mimeType: string;
    fileName: string;
    mediaUrl: string;
    isVideo: boolean;
  }) => void;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  selectedMedia: {
    fileName: string;
    mimeType: string;
    mediaUrl: string;
    isVideo: boolean;
  } | null;
}

const DEMO_PRESETS = [
  {
    id: 'stella-aura',
    name: 'Stella Aura (Runway Obey)',
    subtext: 'Forensic Runway Electronic / 808s & Stabs',
    style: 'runway' as const,
    type: 'audio/mp3',
    isVideo: false,
    color: 'from-rose-600 to-violet-600',
  },
  {
    id: 'synthwave',
    name: 'Neon Sunset',
    subtext: '80s Synthwave / Arpeggiated Lead & 808s',
    style: 'synthwave' as const,
    type: 'audio/mp3',
    isVideo: false,
    color: 'from-fuchsia-600 to-indigo-600',
  },
  {
    id: 'piano',
    name: 'Nocturne in C Minor',
    subtext: 'Romantic Neo-Classical Piano Arpeggio',
    style: 'piano' as const,
    type: 'audio/mp3',
    isVideo: false,
    color: 'from-amber-600 to-rose-600',
  },
  {
    id: 'acoustic',
    name: 'Golden Valley Demo',
    subtext: 'Folk Fingerstyle Guitar & Warm Room',
    style: 'acoustic' as const,
    type: 'audio/mp3',
    isVideo: false,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'ambient',
    name: 'Cosmic Drift',
    subtext: 'Atmospheric Space Pad Drone',
    style: 'ambient' as const,
    type: 'audio/mp3',
    isVideo: false,
    color: 'from-cyan-600 to-blue-600',
  },
];

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelected,
  isAnalyzing,
  onStartAnalysis,
  selectedMedia,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    const mediaUrl = URL.createObjectURL(file);
    const audioBase64 = await blobToBase64(file);

    onMediaSelected({
      file,
      audioBase64,
      mimeType: file.type || (isVideo ? 'video/mp4' : 'audio/mp3'),
      fileName: file.name,
      mediaUrl,
      isVideo,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectDemo = async (demo: (typeof DEMO_PRESETS)[0]) => {
    const { blob, url } = generateDemoTrackWav(demo.style, 10);
    const base64 = await blobToBase64(blob);

    onMediaSelected({
      audioBase64: base64,
      mimeType: 'audio/wav',
      fileName: `${demo.name} (${demo.style}).wav`,
      mediaUrl: url,
      isVideo: false,
    });
  };

  const togglePreviewPlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().catch(console.error);
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm border border-violet-500/30">
            1
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Import Audio or Video
              <span className="text-[11px] font-normal text-zinc-400">
                (MP3, MP4, WAV, M4A)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Upload your song or video to transcribe lyrics and extract musical elements
            </p>
          </div>
        </div>

        {selectedMedia && (
          <button
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.value = '';
              fileInputRef.current?.click();
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Change file
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Drop Area */}
      {!selectedMedia ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-violet-500 bg-violet-950/20 scale-[0.99]'
              : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-950/40 hover:bg-zinc-950/70'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7 text-violet-400" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">
              Drag & drop MP3 / MP4 here, or{' '}
              <span className="text-violet-400 underline underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-zinc-400">
              Supports MP3, MP4 video soundtracks, WAV, M4A up to 50MB
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <FileAudio className="w-3.5 h-3.5 text-zinc-400" /> MP3 Audio
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-3.5 h-3.5 text-zinc-400" /> MP4 Video
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1">
              <Music2 className="w-3.5 h-3.5 text-zinc-400" /> Stem Analysis
            </span>
          </div>
        </div>
      ) : (
        /* Selected Media Preview */
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                {selectedMedia.isVideo ? (
                  <Film className="w-5 h-5 text-violet-400" />
                ) : (
                  <FileAudio className="w-5 h-5 text-violet-400" />
                )}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-zinc-100 truncate">
                  {selectedMedia.fileName}
                </p>
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className="uppercase text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {selectedMedia.mimeType.split('/')[1] || 'MEDIA'}
                  </span>
                  <span>Ready for analysis</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!selectedMedia.isVideo && (
                <button
                  type="button"
                  onClick={togglePreviewPlay}
                  className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 transition-colors"
                  title="Play / Pause preview"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-4 h-4 text-violet-400" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 text-zinc-200" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* If video, show a responsive video player */}
          {selectedMedia.isVideo ? (
            <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video max-h-48 flex items-center justify-center">
              <video
                src={selectedMedia.mediaUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <audio
              ref={audioPreviewRef}
              src={selectedMedia.mediaUrl}
              onEnded={() => setIsPlayingPreview(false)}
              className="w-full h-8"
              controls
            />
          )}

          {/* Action Button */}
          <button
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isAnalyzing
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/25 active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                <span>Transcribing & Analyzing Musical Components...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Transcribe Audio & Decompose Music Structure</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Preset demo tracks selector */}
      <div className="mt-4 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Or try instant studio demo tracks
          </span>
          <span className="text-[11px] text-zinc-400">1-click test</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_PRESETS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleSelectDemo(demo)}
              disabled={isAnalyzing}
              className="group p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${demo.color}`}
                  />
                  <Music2 className="w-3 h-3 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                </div>
                <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                  {demo.name}
                </p>
                <p className="text-[10px] text-zinc-400 line-clamp-1">
                  {demo.subtext}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
