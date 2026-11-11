/**
 * Audio Synthesis and WAV Encoding Utilities
 * Provides browser-based real WAV generation for demo samples and fallback playback.
 */

export function encodeWAV(
  samples: Float32Array,
  sampleRate: number = 44100,
  numChannels: number = 1
): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generates an inspiring audio sample demo in WAV format based on style
 */
export function generateDemoTrackWav(
  style: 'synthwave' | 'runway' | 'acoustic' | 'ambient' | 'piano',
  durationSec = 8
): { blob: Blob; url: string; base64: string } {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSec;
  const samples = new Float32Array(numSamples);

  // Note frequencies (Hz)
  const notes: Record<string, number> = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.0,
    A3: 220.0,
    B3: 246.94,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
  };

  if (style === 'runway') {
    // Stella Aura: Dark Runway Club Groove (120 BPM)
    // Four-on-the-floor kick + 8th-note synth bass + claps on 2 & 4 + upbeat open hi-hat + supersaw lead
    const rootNotes = [notes.A3, notes.A3, notes.F3, notes.G3];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = t * 2; // 120 BPM: 2 beats per second
      const bar = Math.floor(beat / 4);
      const root = rootNotes[bar % rootNotes.length];

      // 1. Four-on-the-floor punchy club kick
      const beatPhase = beat % 1;
      const kick = Math.exp(-beatPhase * 18) * Math.sin(2 * Math.PI * (55 + Math.exp(-beatPhase * 25) * 80) * beatPhase);

      // 2. Driving 8th-note pumping synth bass
      const eighthPhase = (beat * 2) % 1;
      const bassEnv = Math.exp(-eighthPhase * 5);
      const bassSaw = (((t * (root / 2)) % 1) * 2 - 1) * bassEnv;

      // 3. Crisp analog claps on beats 2 & 4
      const beatInBar = beat % 4;
      const isClapBeat = (beatInBar >= 1 && beatInBar < 1.3) || (beatInBar >= 3 && beatInBar < 3.3);
      const clapPhase = (beatInBar % 2);
      const clap = isClapBeat && clapPhase < 0.25 ? (Math.random() * 2 - 1) * Math.exp(-clapPhase * 22) : 0;

      // 4. Open hi-hat on the "and" (off-beats)
      const offbeatPhase = ((beat + 0.5) % 1);
      const hihat = offbeatPhase < 0.2 ? (Math.random() * 2 - 1) * Math.exp(-offbeatPhase * 16) * 0.2 : 0;

      // 5. High supersaw stabs ("Walk! Pose! Look this way!")
      const leadStep = Math.floor(beat * 2) % 8;
      const leadFreq = leadStep === 0 || leadStep === 3 ? root * 2 : root * 1.5;
      const leadSaw = (((t * leadFreq) % 1) * 2 - 1) * (leadStep % 2 === 0 ? 0.25 : 0.05);

      samples[i] = kick * 0.4 + bassSaw * 0.35 + clap * 0.25 + hihat * 0.15 + leadSaw * 0.2;
    }
  } else if (style === 'synthwave') {
    // 80s Synthwave arpeggio + pulsing bass + 4-on-the-floor kick
    const chordRoots = [notes.A3, notes.F3, notes.C3, notes.G3];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const chordIdx = Math.floor(t / 2) % chordRoots.length;
      const root = chordRoots[chordIdx];

      // 16th note arp
      const arpStep = Math.floor(t * 8) % 4;
      const freq = root * [1, 1.25, 1.5, 2][arpStep];
      const arpSaw = ((t * freq) % 1) * 2 - 1;
      const bassSaw = ((t * (root / 2)) % 1) * 2 - 1;

      // Kick drum on every beat (2 Hz = 120 bpm)
      const beatPhase = (t * 2) % 1;
      const kick = Math.exp(-beatPhase * 15) * Math.sin(2 * Math.PI * 65 * (1 - beatPhase * 0.8));

      // Snare on offbeats
      const snarePhase = ((t * 2 + 0.5) % 1);
      const snare = snarePhase < 0.2 ? (Math.random() * 2 - 1) * Math.exp(-snarePhase * 20) : 0;

      samples[i] = arpSaw * 0.25 + bassSaw * 0.3 + kick * 0.35 + snare * 0.15;
    }
  } else if (style === 'piano') {
    // Romantic neo-classical piano arpeggio
    const chordNotes = [
      [notes.C4, notes.E4, notes.G4, notes.B4],
      [notes.A3, notes.C4, notes.E4, notes.G4],
      [notes.F3, notes.A3, notes.C4, notes.E4],
      [notes.G3, notes.B3, notes.D4, notes.F4],
    ];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const chordIdx = Math.floor(t / 2) % chordNotes.length;
      const chord = chordNotes[chordIdx];
      const noteIdx = Math.floor(t * 4) % 4;
      const freq = chord[noteIdx];
      const noteTime = (t * 4) % 1;
      const envelope = Math.exp(-noteTime * 4);

      // Bell-like additive piano harmonics
      const osc =
        Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(4 * Math.PI * freq * t) * 0.25 +
        Math.sin(6 * Math.PI * freq * t) * 0.15;

      samples[i] = osc * envelope * 0.45;
    }
  } else if (style === 'acoustic') {
    // Folk acoustic guitar fingerpicking
    const chords = [
      [notes.G3, notes.B3, notes.D4, notes.G4],
      [notes.E3, notes.G3, notes.B3, notes.E4],
      [notes.C3, notes.E3, notes.G3, notes.C4],
      [notes.D3, notes.F3, notes.A3, notes.D4],
    ];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const chordIdx = Math.floor(t / 2) % chords.length;
      const chord = chords[chordIdx];
      const stringIdx = Math.floor(t * 6) % 4;
      const freq = chord[stringIdx];
      const pluckTime = (t * 6) % 1;
      const envelope = Math.exp(-pluckTime * 6);

      // Warm acoustic string plucked tone
      const osc =
        Math.sin(2 * Math.PI * freq * t) +
        Math.sin(4 * Math.PI * freq * t) * 0.3 +
        Math.sin(6 * Math.PI * freq * t) * 0.1;

      samples[i] = osc * envelope * 0.4;
    }
  } else {
    // Ambient cosmic pads with soothing drone
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const baseFreq = notes.D3;
      const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t);

      const osc =
        Math.sin(2 * Math.PI * baseFreq * t) * 0.3 +
        Math.sin(2 * Math.PI * (baseFreq * 1.503) * t) * 0.25 +
        Math.sin(2 * Math.PI * (baseFreq * 2.001) * t) * 0.2 * lfo +
        Math.sin(2 * Math.PI * (baseFreq * 2.502) * t) * 0.15 * (1 - lfo);

      samples[i] = osc * 0.5;
    }
  }

  const blob = encodeWAV(samples, sampleRate);
  const url = URL.createObjectURL(blob);

  // Convert to base64
  let binary = '';
  const reader = new FileReader();
  const promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

  return {
    blob,
    url,
    base64: '', // will be populated via FileReader asynchronously if needed
  };
}

/**
 * Helper to convert Blob to Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.substring(result.indexOf(',') + 1);
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper to convert Lyria base64 audio response to audio URL
 */
export function base64ToAudioUrl(base64: string, mimeType = 'audio/wav'): string {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error decoding base64 audio:', err);
    return `data:${mimeType};base64,${base64}`;
  }
}
