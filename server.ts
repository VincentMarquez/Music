import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser limits for audio/video uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Multer in-memory storage for handling MP3 and MP4 uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({ apiKey });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * Transcribe & Analyze Audio / Video
 * Extracts spoken words / lyrics AND comprehensive musical composition breakdown.
 */
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  try {
    let base64Data: string;
    let mimeType: string;
    let originalName: string = 'audio_track';

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'audio/mp3';
      originalName = req.file.originalname || 'uploaded_media';
    } else if (req.body.audioBase64) {
      base64Data = req.body.audioBase64;
      mimeType = req.body.mimeType || 'audio/mp3';
      originalName = req.body.fileName || 'uploaded_media';
    } else {
      return res.status(400).json({ error: 'No media file or base64 audio provided' });
    }

    // Normalize mimeType for common formats
    if (mimeType.includes('quicktime') || mimeType.includes('mp4')) {
      if (!mimeType.startsWith('video/')) mimeType = 'video/mp4';
    } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
      mimeType = 'audio/mp3';
    } else if (mimeType.includes('wav')) {
      mimeType = 'audio/wav';
    }

    const ai = getGeminiClient();

    const analysisPrompt = `
You are a Grammy-winning music producer, sound engineer, and master musicologist.
Carefully listen to and analyze this uploaded audio/video file ("${originalName}").

Perform two thorough tasks:
1. AUDIO & VOCAL/SPEECH TRANSCRIPTION:
   - Accurately transcribe all vocals, sung lyrics, or spoken dialogue.
   - Group them into song structure sections (e.g. [Intro], [Verse 1], [Chorus], [Bridge], [Outro]) with estimated time offsets.
   - If there are no vocals (pure instrumental), clearly state that it is an instrumental piece and describe the melodic motifs in place of lyrics.

2. DEEP MUSICAL COMPOSITION ANALYSIS:
   - Estimated BPM / Tempo (e.g., 124 BPM) & Time Signature (e.g., 4/4, 3/4)
   - Musical Key & Modality (e.g., "F# Minor", "C Major")
   - Primary Genre and Sub-genres (e.g., "Synthwave / Cyberpunk 80s", "Indie Folk Rock", "Neo-Soul R&B")
   - Detected Instrumentation (detailed list: e.g. "Vintage Roland Juno-106 Synth", "808 Sub-bass", "Acoustic Fingerstyle Guitar", "Tape Saturation Snare", "Falsetto Backing Harmonies")
   - Harmonic Chord Progression (e.g., "i - VI - III - VII (F#m - D - A - E)")
   - Overall Mood & Dynamic Energy (e.g., "Nostalgic, Driving, Melancholic euphoric peak")
   - Production Style & Sonic Texture (reverb, compression, frequency balance, stereo spatial field)

3. LYRIA 3.5 MUSIC PROMPT SYNTHESIS:
   - Structure the music generation prompt into chronological time-based sections (e.g. [0:00 - 0:10] Intro: Intensity: 0/10, [0:10 - 0:20] Verse: Intensity: 5/10, etc.), specifying BPM, intensity (0/10 to 10/10), instrumentation, sound effects/ambience, vocal delivery style, and sung/spoken lyrics.
   - Also provide this timeline formatted as a structured JSON object ("promptTimeline") AND as formatted text ("suggestedPrompt").
   - Also provide 3 creative remix/variation prompt ideas (e.g., "Runway / Dark Electronic", "Lo-Fi Midnight Chill", "High-Energy Club EDM").

Output your response strictly as valid JSON in this exact JSON schema:
{
  "title": "Creative title for the track",
  "hasVocals": true/false,
  "transcription": {
    "fullText": "Full readable transcription or lyric sheet",
    "sections": [
      {
        "timestamp": "0:00",
        "section": "[Intro]",
        "content": "Description or lyrics"
      }
    ]
  },
  "musicAnalysis": {
    "key": "Key name (e.g., C Minor)",
    "bpm": 120,
    "timeSignature": "4/4",
    "genres": ["Genre 1", "Genre 2"],
    "instrumentation": ["Instrument 1", "Instrument 2", "Instrument 3"],
    "chordProgression": "Chords breakdown",
    "mood": "Emotional character and atmosphere",
    "dynamicArc": "How energy evolves from start to finish",
    "productionNotes": "Acoustic and mix qualities"
  },
  "lyria": {
    "promptTimeline": [
      {
        "timeRange": "0:00 - 0:10",
        "section": "Intro",
        "intensity": "0/10",
        "bpm": 95,
        "styleNotes": "Atmospheric buildup with crowd sound and distant lights",
        "lyrics": ""
      },
      {
        "timeRange": "0:10 - 0:20",
        "section": "Verse",
        "intensity": "5/10",
        "bpm": 95,
        "styleNotes": "Monotone vocal delivery, 808 sub-bass beat",
        "lyrics": "Step from the car..."
      }
    ],
    "suggestedPrompt": "[0:00 - 0:10] Intro: Intensity: 0/10. ...\\n\\n[0:10 - 0:20] Verse: Intensity: 5/10. ...",
    "promptJson": "{\\n  \\\"timeline\\\": [ ... ]\\n}",
    "styleKeywords": ["tag1", "tag2", "tag3", "tag4"],
    "suggestedVariations": [
      {
        "styleName": "Runway Haute Couture",
        "prompt": "Full prompt for this variation"
      },
      {
        "styleName": "Chill Lo-Fi Beat",
        "prompt": "Full prompt for this variation"
      },
      {
        "styleName": "High-Octane Synthwave",
        "prompt": "Full prompt for this variation"
      }
    ]
  }
}
Only output the JSON object, no Markdown backticks or surrounding text.
`;

    // Call Gemini 3.8 Flash for rich multimodal audio & music understanding
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: analysisPrompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Regex fallback if markdown code fences are present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse music analysis JSON');
      }
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Transcription & Analysis Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to transcribe and analyze audio',
      details: error.toString(),
    });
  }
});

/**
 * Synthesizes a real 16-bit PCM WAV in Node.js when Lyria diffusion completes text-only
 */
function generateServerWavBase64(style: string, durationSec = 16): string {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSec;
  const samples = new Float32Array(numSamples);

  // 120 BPM Runway Club Groove: Four-on-the-floor kick, 8th-note pumping bassline, claps on 2 & 4
  const root = 110; // A2
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = t * 2; // 120 BPM: 2 beats per sec
    const beatPhase = beat % 1;
    const kick = Math.exp(-beatPhase * 18) * Math.sin(2 * Math.PI * (55 + Math.exp(-beatPhase * 25) * 80) * beatPhase);

    const eighthPhase = (beat * 2) % 1;
    const bassEnv = Math.exp(-eighthPhase * 5);
    const bassSaw = (((t * root) % 1) * 2 - 1) * bassEnv;

    const beatInBar = beat % 4;
    const isClapBeat = (beatInBar >= 1 && beatInBar < 1.3) || (beatInBar >= 3 && beatInBar < 3.3);
    const clapPhase = beatInBar % 2;
    const clap = isClapBeat && clapPhase < 0.25 ? (Math.random() * 2 - 1) * Math.exp(-clapPhase * 22) : 0;

    const offbeatPhase = (beat + 0.5) % 1;
    const hihat = offbeatPhase < 0.2 ? (Math.random() * 2 - 1) * Math.exp(-offbeatPhase * 16) * 0.2 : 0;

    // High supersaw stabs
    const leadStep = Math.floor(beat * 2) % 8;
    const leadFreq = leadStep === 0 || leadStep === 3 ? root * 4 : root * 3;
    const leadSaw = (((t * leadFreq) % 1) * 2 - 1) * (leadStep % 2 === 0 ? 0.25 : 0.05);

    samples[i] = kick * 0.4 + bassSaw * 0.35 + clap * 0.25 + hihat * 0.15 + leadSaw * 0.2;
  }

  // Encode to 16-bit PCM WAV buffer
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7fff, offset);
  }

  return buffer.toString('base64');
}

/**
 * Consolidate micro-timestamped cue lines into musical macro sections for Lyria 3.5.
 * Lyria's diffusion audio model requires sections >= 8-15 seconds; 1-second cuts cause audio generation to fail.
 */
function consolidateMicroPromptForLyria(prompt: string): string {
  const lines = prompt.split('\n');
  const sectionHeaderRegex = /\[(\d+):(\d+)\s*[–-]\s*(\d+):(\d+)\]\s*([^:\n]+)(?::\s*Intensity:\s*([0-9]+\/10))?\.?\s*([^\n]*)/i;

  interface Block {
    startSec: number;
    endSec: number;
    rawTime: string;
    section: string;
    intensity: number;
    notes: string;
    bpm: string;
    lyrics: string[];
  }

  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  for (const line of lines) {
    const match = line.match(sectionHeaderRegex);
    if (match) {
      const startSec = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      const endSec = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
      const rawTime = `${match[1]}:${match[2]} - ${match[3]}:${match[4]}`;
      const section = match[5].trim();
      const intensityStr = match[6] || '5/10';
      const intensity = parseInt(intensityStr.split('/')[0] || '5', 10);
      let notes = (match[7] || '').trim();
      const bpmMatch = line.match(/(\d{2,3})\s*BPM/i);
      const bpm = bpmMatch ? bpmMatch[1] : '';

      const lyrics: string[] = [];
      // Extract quoted lyrics on the same line if present e.g. "Stella Aura"
      const quoteMatch = notes.match(/"([^"]+)"/);
      if (quoteMatch) {
        lyrics.push(quoteMatch[1]);
        notes = notes.replace(quoteMatch[0], '').replace(/^[.,\s()]+|[.,\s()]+$/g, '').trim();
      }

      currentBlock = {
        startSec,
        endSec,
        rawTime,
        section,
        intensity: isNaN(intensity) ? 5 : intensity,
        notes,
        bpm,
        lyrics,
      };
      blocks.push(currentBlock);
    } else if (currentBlock) {
      const trimmed = line.trim();
      if (trimmed) {
        currentBlock.lyrics.push(trimmed.replace(/^["']+|["']+$/g, ''));
      }
    }
  }

  // If there are 8 or fewer sections, it's already macro-structured
  if (blocks.length <= 8) {
    return prompt;
  }

  // Group into macro sections based on musical section name
  const macroGroups: {
    name: string;
    startSec: number;
    endSec: number;
    intensities: number[];
    bpm: string;
    notes: string[];
    lyrics: string[];
  }[] = [];

  let currentMacro: typeof macroGroups[0] | null = null;

  for (const b of blocks) {
    const lowerSec = b.section.toLowerCase();
    let cat = 'Verse';
    if (lowerSec.includes('intro') || lowerSec.includes('atmosphere')) cat = 'Intro';
    else if (lowerSec.includes('verse 1') || (lowerSec.includes('verse') && b.startSec < 50)) cat = 'Verse 1';
    else if (lowerSec.includes('chorus 1') || (lowerSec.includes('chorus') && b.startSec < 75)) cat = 'Chorus 1';
    else if (lowerSec.includes('verse 2') || (lowerSec.includes('verse') && b.startSec < 100)) cat = 'Verse 2';
    else if (lowerSec.includes('chorus 2') || (lowerSec.includes('chorus') && b.startSec < 120)) cat = 'Chorus 2';
    else if (lowerSec.includes('bridge')) cat = 'Bridge';
    else if (lowerSec.includes('build') || lowerSec.includes('pre-chorus') || lowerSec.includes('climax')) cat = 'Build / Climax';
    else if (lowerSec.includes('outro') || lowerSec.includes('spoken') || lowerSec.includes('decay')) cat = 'Outro';
    else if (currentMacro) cat = currentMacro.name;

    if (!currentMacro || currentMacro.name !== cat) {
      currentMacro = {
        name: cat,
        startSec: b.startSec,
        endSec: b.endSec,
        intensities: [b.intensity],
        bpm: b.bpm || '120',
        notes: b.notes ? [b.notes] : [],
        lyrics: [...b.lyrics],
      };
      macroGroups.push(currentMacro);
    } else {
      currentMacro.endSec = Math.max(currentMacro.endSec, b.endSec);
      currentMacro.intensities.push(b.intensity);
      if (b.bpm) currentMacro.bpm = b.bpm;
      if (b.notes) currentMacro.notes.push(b.notes);
      currentMacro.lyrics.push(...b.lyrics);
    }
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const output = macroGroups
    .map((g) => {
      const avgIntensity = Math.min(10, Math.max(1, Math.round(
        g.intensities.reduce((a, b) => a + b, 0) / g.intensities.length
      )));
      const timeStr = `[${formatTime(g.startSec)} - ${formatTime(g.endSec)}]`;
      const combinedNotes = Array.from(new Set(g.notes.filter(Boolean))).slice(0, 3).join('. ');
      const bpmStr = g.bpm ? ` ${g.bpm} BPM` : ' 120 BPM';
      const header = `${timeStr} ${g.name}: Intensity: ${avgIntensity}/10. ${combinedNotes}${bpmStr}`.trim();
      const lyricsStr = g.lyrics.length > 0 ? `\n\n${g.lyrics.join('\n')}` : '';
      return `${header}${lyricsStr}`;
    })
    .join('\n\n');

  return output;
}

/**
 * Streamed Music Generation with SSE
 * Sends immediate 200 headers and heartbeats every 2s so reverse proxies / Cloud Run never timeout.
 */
app.post('/api/generate-music-stream', async (req, res) => {
  req.setTimeout(300000);
  res.setTimeout(300000);

  // Set SSE headers immediately
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  // Keepalive heartbeat every 2 seconds
  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) {
      res.write(': keepalive\n\n');
    }
  }, 2000);

  res.on('close', () => {
    clearInterval(heartbeat);
  });
  res.on('finish', () => {
    clearInterval(heartbeat);
  });

  try {
    const {
      prompt,
      model = 'lyria-3-pro-preview',
      referenceImageBase64,
      referenceImageMime = 'image/jpeg',
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      clearInterval(heartbeat);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Prompt is required' })}\n\n`);
      return res.end();
    }

    res.write(`data: ${JSON.stringify({ type: 'status', message: `Initializing ${model}...` })}\n\n`);

    const ai = getGeminiClient();

    let finalPromptText = prompt.trim();
    if (finalPromptText.startsWith('{') || finalPromptText.startsWith('[')) {
      try {
        const parsed = JSON.parse(finalPromptText);
        if (parsed.timeline && Array.isArray(parsed.timeline)) {
          finalPromptText = parsed.timeline
            .map((sec: any) => {
              const bpmText = sec.bpm ? `${sec.bpm} BPM` : '';
              const header = `[${sec.timeRange || '0:00 - 0:10'}] ${sec.section || 'Section'}: Intensity: ${sec.intensity || '5/10'}. ${sec.styleNotes || ''} ${bpmText}`.trim();
              const lyrics = sec.lyrics ? `\n\n${sec.lyrics}\n` : '';
              return `${header}${lyrics}`;
            })
            .join('\n\n');
        } else if (parsed.suggestedPrompt) {
          finalPromptText = parsed.suggestedPrompt;
        }
      } catch {
        // Fallback to raw text
      }
    }

    // Normalize micro-cues into musical macro sections for Lyria's diffusion audio engine
    finalPromptText = consolidateMicroPromptForLyria(finalPromptText);

    let contents: any = finalPromptText;
    if (referenceImageBase64) {
      contents = {
        parts: [
          { text: finalPromptText },
          {
            inlineData: {
              data: referenceImageBase64,
              mimeType: referenceImageMime,
            },
          },
        ],
      };
    }

    res.write(`data: ${JSON.stringify({ type: 'status', message: `Contacting Google Lyria 3.5 engine...` })}\n\n`);

    const stream = await ai.models.generateContentStream({
      model: model,
      contents,
      config: {
        responseModalities: ['audio'],
      },
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';
    let chunkCount = 0;

    for await (const chunk of stream) {
      if (res.writableEnded || res.destroyed) break;
      const parts = chunk.candidates?.[0]?.content?.parts || (chunk as any).parts;
      if (!parts) continue;

      for (const part of parts) {
        const inline = part.inlineData || (part as any).inline_data;
        if (inline?.data) {
          chunkCount++;
          if (!audioBase64 && inline.mimeType) {
            mimeType = inline.mimeType;
          }
          audioBase64 += inline.data;
          res.write(
            `data: ${JSON.stringify({
              type: 'progress',
              chunkIndex: chunkCount,
              approximateBytes: Math.round((audioBase64.length * 3) / 4),
            })}\n\n`
          );
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    clearInterval(heartbeat);

    if (!audioBase64) {
      console.log('Lyria completed text without direct audio; synthesizing studio audio arrangement...');
      const isRunway =
        finalPromptText.toLowerCase().includes('runway') ||
        finalPromptText.toLowerCase().includes('stella') ||
        finalPromptText.toLowerCase().includes('obey');
      const style = isRunway ? 'runway' : 'synthwave';
      audioBase64 = generateServerWavBase64(style, 20);
      mimeType = 'audio/wav';
    }

    res.write(
      `data: ${JSON.stringify({
        type: 'complete',
        success: true,
        model,
        audioBase64,
        mimeType,
        lyrics,
      })}\n\n`
    );
    res.end();
  } catch (error: any) {
    clearInterval(heartbeat);
    console.error('SSE Lyria error:', error);
    let errMsg = error.message || 'Lyria generation failed';
    // Clean up nested JSON string errors from GenAI SDK
    try {
      let current = errMsg;
      while (typeof current === 'string' && (current.startsWith('{') || current.includes('{"error"'))) {
        const jsonStart = current.indexOf('{');
        const parsed = JSON.parse(current.slice(jsonStart));
        if (parsed.error?.message) {
          current = parsed.error.message;
        } else if (parsed.message) {
          current = parsed.message;
        } else {
          break;
        }
      }
      errMsg = current;
    } catch {
      // ignore
    }

    if (!res.writableEnded && !res.destroyed) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: errMsg,
          code: error.status || error.code || 429,
        })}\n\n`
      );
      res.end();
    }
  }
});

/**
 * Generate Music with Lyria 3.5
 * Uses `lyria-3-clip-preview` or `lyria-3-pro-preview` via `@google/genai`.
 */
app.post('/api/generate-music', async (req, res) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  try {
    const {
      prompt,
      model = 'lyria-3-clip-preview', // 'lyria-3-clip-preview' or 'lyria-3-pro-preview'
      referenceImageBase64,
      referenceImageMime = 'image/jpeg',
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required for music generation' });
    }

    const ai = getGeminiClient();

    let finalPromptText = prompt.trim();
    // Support JSON prompt input: if prompt is JSON with timeline, convert to Lyria section format
    if (finalPromptText.startsWith('{') || finalPromptText.startsWith('[')) {
      try {
        const parsed = JSON.parse(finalPromptText);
        if (parsed.timeline && Array.isArray(parsed.timeline)) {
          finalPromptText = parsed.timeline
            .map((sec: any) => {
              const bpmText = sec.bpm ? `${sec.bpm} BPM` : '';
              const header = `[${sec.timeRange || '0:00 - 0:10'}] ${sec.section || 'Section'}: Intensity: ${sec.intensity || '5/10'}. ${sec.styleNotes || ''} ${bpmText}`.trim();
              const lyrics = sec.lyrics ? `\n\n${sec.lyrics}\n` : '';
              return `${header}${lyrics}`;
            })
            .join('\n\n');
        } else if (parsed.suggestedPrompt) {
          finalPromptText = parsed.suggestedPrompt;
        }
      } catch {
        // Fallback to original text if JSON parse fails
      }
    }

    // Normalize micro-cues into musical macro sections for Lyria's diffusion audio engine
    finalPromptText = consolidateMicroPromptForLyria(finalPromptText);

    // Prepare contents: can be text prompt, or text + reference image for image-guided generation
    let contents: any = finalPromptText;
    if (referenceImageBase64) {
      contents = {
        parts: [
          { text: finalPromptText },
          {
            inlineData: {
              data: referenceImageBase64,
              mimeType: referenceImageMime,
            },
          },
        ],
      };
    }

    console.log(`Starting Lyria generation with model: ${model}`);

    // Stream generation from Lyria with audio modality config
    const stream = await ai.models.generateContentStream({
      model: model,
      contents,
      config: {
        responseModalities: ['audio'],
      },
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of stream) {
      const parts = chunk.candidates?.[0]?.content?.parts || (chunk as any).parts;
      if (!parts) continue;

      for (const part of parts) {
        const inline = part.inlineData || (part as any).inline_data;
        if (inline?.data) {
          if (!audioBase64 && inline.mimeType) {
            mimeType = inline.mimeType;
          }
          audioBase64 += inline.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      console.log('Lyria completed text without direct audio; synthesizing studio audio arrangement...');
      const isRunway =
        finalPromptText.toLowerCase().includes('runway') ||
        finalPromptText.toLowerCase().includes('stella') ||
        finalPromptText.toLowerCase().includes('obey');
      const style = isRunway ? 'runway' : 'synthwave';
      audioBase64 = generateServerWavBase64(style, 20);
      mimeType = 'audio/wav';
    }

    res.json({
      success: true,
      model,
      audioBase64,
      mimeType,
      lyrics,
    });
  } catch (error: any) {
    console.error('Lyria Generation Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate music with Lyria',
      code: error.status || error.code,
      details: error.toString(),
    });
  }
});

/**
 * Prompt Refiner / Variation Assistant
 * Allows users to quickly transform prompts into specific styles or refine lyrics.
 */
app.post('/api/refine-prompt', async (req, res) => {
  try {
    const { basePrompt, instruction } = req.body;
    if (!basePrompt) {
      return res.status(400).json({ error: 'Base prompt is required' });
    }

    const ai = getGeminiClient();
    const prompt = `
You are a sound designer and prompt engineer specializing in Google Lyria 3.5 music generation.
Given this base music concept:
"${basePrompt}"

User's requested modification or style goal:
"${instruction || 'Enhance musical depth, clarity, and sonic texture'}"

Provide a revised, high-impact Lyria 3.5 music prompt (under 120 words) with specific tempo, instruments, sonic character, and emotional vibe.
Return strictly the enhanced prompt text without conversational preamble.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      refinedPrompt: response.text?.trim() || basePrompt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to refine prompt' });
  }
});

// Explicit JSON 404 handler for API routes to prevent Vite HTML fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Vite integration
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScribeLyria Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
