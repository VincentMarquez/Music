import { PromptTimelineSection } from '../types/music';

/**
 * Converts formatted timeline text into a structured JSON object
 */
export function textToTimelineJson(text: string): {
  title?: string;
  bpm?: number;
  timeline: PromptTimelineSection[];
} {
  // Check if text is already JSON
  if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.timeline) return parsed;
      if (Array.isArray(parsed)) return { timeline: parsed };
    } catch {
      // continue to parse text
    }
  }

  const sections: PromptTimelineSection[] = [];
  
  // 1. Match bracketed micro-cues: [0:00 - 0:02] Section: Intensity: X/10. Notes... \n Lyrics
  // Supports both full sections and second-by-second micro-lyrics lines
  const regex = /\[(\d+:\d+\s*[–-]\s*\d+:\d+)\]\s*([^:\n]+)(?::\s*(?:Intensity:\s*([0-9]+\/10))?)?\.?\s*([^\n]*)([\s\S]*?)(?=\[\d+:\d+\s*[–-]\s*\d+:\d+\]|$)/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const timeRange = match[1].replace('–', '-').trim();
    const section = match[2].trim();
    const intensity = match[3] ? match[3].trim() : '5/10';
    const headerRest = (match[4] || '').trim();
    const bodyContent = (match[5] || '').trim();

    // Extract BPM if present
    const bpmMatch = (headerRest + ' ' + bodyContent).match(/(\d{2,3})\s*BPM/i);
    const bpm = bpmMatch ? parseInt(bpmMatch[1], 10) : 120;

    let styleNotes = headerRest;
    let lyrics = bodyContent;

    // Check for quoted lyrics in header or body
    const quoteInHeader = headerRest.match(/["*']([^"*']+)["*']/);
    if (quoteInHeader && !lyrics) {
      lyrics = quoteInHeader[1];
      styleNotes = headerRest.replace(quoteInHeader[0], '').trim();
    } else if (!styleNotes && bodyContent) {
      const lines = bodyContent.split('\n');
      styleNotes = lines[0] || '';
      lyrics = lines.slice(1).join('\n').trim();
    }

    sections.push({
      timeRange,
      section,
      intensity,
      bpm,
      styleNotes: styleNotes.replace(/t?\s*\d+\s*BPM/i, '').replace(/^[.,\s]+|[.,\s]+$/g, '').trim(),
      lyrics: lyrics.replace(/^["'\s]+|["'\s]+$/g, '').trim(),
    });
  }

  // 2. If no bracketed matches found, check for bullet micro-lyrics: * **(0:00 – 0:02)**: ...
  if (sections.length === 0) {
    const bulletRegex = /(?:\*|\-)?\s*(?:\*\*)?\(?(\d+:\d+\s*[–-]\s*\d+:\d+)\)?(?:\*\*)?:\s*(.+)/gi;
    let bMatch;
    while ((bMatch = bulletRegex.exec(text)) !== null) {
      const timeRange = bMatch[1].replace('–', '-').trim();
      const content = bMatch[2].trim();

      const quoteMatch = content.match(/["*']([^"*']+)["*']/);
      const lyrics = quoteMatch ? quoteMatch[1] : '';
      const styleNotes = quoteMatch ? content.replace(quoteMatch[0], '').trim() : content;

      sections.push({
        timeRange,
        section: lyrics ? 'Vocal' : 'Cue',
        intensity: '5/10',
        bpm: 120,
        styleNotes: styleNotes.replace(/^[*,;:\s()]+|[*,;:\s()]+$/g, '').trim(),
        lyrics,
      });
    }
  }

  if (sections.length === 0) {
    // Fallback single section
    sections.push({
      timeRange: '0:00 - 0:30',
      section: 'Main',
      intensity: '5/10',
      bpm: 95,
      styleNotes: text.slice(0, 150),
      lyrics: text.length > 150 ? text.slice(150) : '',
    });
  }

  return {
    bpm: sections[0]?.bpm ? Number(sections[0].bpm) : 95,
    timeline: sections,
  };
}

/**
 * Converts structured timeline JSON back into the formatted Lyria text prompt
 */
export function timelineJsonToText(obj: any): string {
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      return obj;
    }
  }

  const timeline: PromptTimelineSection[] = obj.timeline || (Array.isArray(obj) ? obj : []);

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return JSON.stringify(obj, null, 2);
  }

  return timeline
    .map((sec) => {
      const bpmPart = sec.bpm ? `  ${sec.bpm} BPM` : '';
      const notes = sec.styleNotes ? ` ${sec.styleNotes}` : '';
      const header = `[${sec.timeRange || '0:00 - 0:10'}] ${sec.section || 'Section'}: Intensity: ${sec.intensity || '5/10'}.${notes}${bpmPart}`.trim();
      const lyrics = sec.lyrics ? `\n\n${sec.lyrics}\n` : '';
      return `${header}${lyrics}`;
    })
    .join('\n\n');
}

/**
 * Generates the Python Google GenAI script matching the user's snippet
 */
export function generatePythonScript(promptText: string, model: string = 'lyria-3-pro-preview'): string {
  const escapedPrompt = promptText.replace(/"""/g, '\"\"\"');

  return `# Dependencies required:
# pip install google-genai

import os
import mimetypes
from google import genai
from google.genai import types

def save_binary_file(file_name, data):
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")

def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "${model}"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""${escapedPrompt}"""),
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_modalities=[
            "audio",
        ],
    )

    file_index = 0
    print(f"Streaming composition from {model}...")
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if not chunk.parts:
            continue

        if chunk.parts[0].inline_data and chunk.parts[0].inline_data.data:
            file_name = f"output_track_{file_index}"
            file_index += 1
            inline_data = chunk.parts[0].inline_data
            data_buffer = inline_data.data
            ext = mimetypes.guess_extension(inline_data.mime_type) or ".wav"
            save_binary_file(f"{file_name}{ext}", data_buffer)
        elif chunk.text:
            print(chunk.text)

if __name__ == "__main__":
    generate()
`;
}
