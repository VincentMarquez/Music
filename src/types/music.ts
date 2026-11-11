export interface TranscriptionSection {
  timestamp: string;
  section: string;
  content: string;
}

export interface PromptTimelineSection {
  timeRange: string;
  section: string;
  intensity: string;
  bpm: number | string;
  styleNotes: string;
  lyrics: string;
}

export interface MusicAnalysis {
  key: string;
  bpm: number;
  timeSignature: string;
  genres: string[];
  instrumentation: string[];
  chordProgression: string;
  mood: string;
  dynamicArc: string;
  productionNotes: string;
}

export interface VariationSuggestion {
  styleName: string;
  prompt: string;
}

export interface LyriaConfig {
  suggestedPrompt: string;
  promptJson?: string;
  promptTimeline?: PromptTimelineSection[];
  styleKeywords: string[];
  suggestedVariations: VariationSuggestion[];
}

export interface FullAudioDecomposition {
  title: string;
  hasVocals: boolean;
  transcription: {
    fullText: string;
    sections: TranscriptionSection[];
  };
  musicAnalysis: MusicAnalysis;
  lyria: LyriaConfig;
}

export interface GeneratedMusicTrack {
  id: string;
  title: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' | string;
  prompt: string;
  audioUrl: string;
  audioBlob?: Blob;
  mimeType: string;
  durationSeconds?: number;
  lyrics?: string;
  createdAt: string;
  isSynthesizedFallback?: boolean;
}

export interface DemoSample {
  id: string;
  title: string;
  artistOrStyle: string;
  duration: string;
  type: 'audio/mp3' | 'video/mp4';
  description: string;
  synthesizeType: 'synthwave' | 'acoustic' | 'ambient' | 'piano';
}
