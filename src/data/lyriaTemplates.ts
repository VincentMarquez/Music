export interface LyriaTemplate {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  description: string;
  tags: string[];
  templateText: string;
}

export const LYRIA_OPTIONS = {
  // Official Recognized Genre Taxonomy
  genreCategories: [
    {
      category: 'Electronic & Dance',
      keywords: [
        'Acid House', 'Breakbeat', 'Chillout', 'Chiptune', 'Deep House', 'Drum & Bass',
        'Dubstep', 'EDM', 'Electro Swing', 'Glitch Hop', 'Hyperpop', 'Minimal Techno',
        'Moombahton', 'Psytrance', 'Synthpop', 'Techno', 'Trance', 'Trip Hop', 'Vaporwave'
      ],
    },
    {
      category: 'Hip-Hop & R&B',
      keywords: [
        '808 Hip Hop', 'Boom-Bap', 'Contemporary R&B', 'G-funk', 'Grime',
        'Lo-Fi Hip Hop', 'Neo-Soul', 'New Jack Swing', 'Trap Beat'
      ],
    },
    {
      category: 'Rock & Alternative',
      keywords: [
        'Alternative Country', 'Blues Rock', 'Classic Rock', 'Funk Metal', 'Garage Rock',
        'Indie Folk', 'Indie Pop', 'Post-Punk', '60s Psychedelic Rock', 'Shoegaze', 'Surf Rock'
      ],
    },
    {
      category: 'Jazz, Soul & Funk',
      keywords: [
        'Acid Jazz', 'Afrobeat', 'Bossa Nova', 'Disco Funk', 'Funk', 'Jazz Fusion', 'Latin Jazz'
      ],
    },
    {
      category: 'Folk & Traditional',
      keywords: [
        'Bengal Baul', 'Bhangra', 'Bluegrass', 'Celtic Folk', 'Cumbia', 'Indian Classical',
        'Irish Folk', 'Merengue', 'Polka', 'Reggae', 'Reggaeton', 'Renaissance Music', 'Salsa'
      ],
    },
    {
      category: 'Classical & Acoustic',
      keywords: ['Baroque', 'Orchestral Score', 'Piano Ballad'],
    },
  ],

  // Official Recognized Instrument Taxonomy
  instrumentCategories: [
    {
      category: 'Keyboards & Synths',
      keywords: [
        'Buchla Synths', 'Clavichord', 'Dirty Synths', 'Harpsichord', 'Mellotron',
        'Moog Oscillations', 'Ragtime Piano', 'Rhodes Piano', 'Smooth Pianos',
        'Spacey Synths', 'Synth Pads'
      ],
    },
    {
      category: 'Bass & Drums',
      keywords: [
        '303 Acid Bass', '808 Hip Hop Beat', 'Boomy Bass', 'Conga Drums', 'Drumline',
        'Funk Drums', 'Precision Bass', 'Tabla', 'TR-909 Drum Machine'
      ],
    },
    {
      category: 'Guitars & Strings',
      keywords: [
        'Banjo', 'Balalaika', 'Bouzouki', 'Cello', 'Charango', 'Dulcimer', 'Fiddle',
        'Flamenco Guitar', 'Guitar', 'Harp', 'Koto', 'Lyre', 'Mandolin', 'Pipa',
        'Shamisen', 'Shredding Guitar', 'Sitar', 'Slide Guitar', 'Viola Ensemble',
        'Warm Acoustic Guitar'
      ],
    },
    {
      category: 'Wind & Brass',
      keywords: [
        'Alto Saxophone', 'Bagpipes', 'Bass Clarinet', 'Didgeridoo', 'Harmonica',
        'Ocarina', 'Trumpet', 'Tuba', 'Woodwinds'
      ],
    },
    {
      category: 'Percussion',
      keywords: [
        'Bongos', 'Djembe', 'Glockenspiel', 'Hang Drum', 'Kalimba', 'Maracas',
        'Marimba', 'Mbira', 'Steel Drum', 'Vibraphone'
      ],
    },
  ],

  // Official Vocal Delivery Profiles & Effects
  vocalProfiles: [
    {
      name: 'Female Soprano',
      desc: 'Clear, crystalline timbre with an agile, soaring delivery. Bright tone capable of airy, breathy textures.',
    },
    {
      name: 'Female Alto',
      desc: 'Rich, warm, and husky lower range. Smoky timbre with a soulful, resonant chest voice.',
    },
    {
      name: 'Male Tenor',
      desc: 'Bright, piercing, and energetic. Youthful timbre with high belting power that cuts through dense mixes.',
    },
    {
      name: 'Male Baritone',
      desc: 'Deep, velvet-smooth chest voice with a warm, soothing, crooning delivery.',
    },
    {
      name: 'Weathered Rocker',
      desc: 'Raspy, gritty timbre reminiscent of 1990s alternative rock. Raw emotional intensity with strained upper notes.',
    },
    {
      name: 'Instrumental Only',
      desc: 'No vocal track (<instrumental>)',
    },
  ],

  vocalEffects: [
    'A vintage radio broadcast voice introduces the song before the beat kicks in',
    'A spoken voice whispers right before the drop, followed by high-energy synths',
    'Chopped, pitch-shifted vocal samples looping as an instrumental rhythm element',
    'Center Channel, Completely Dry Point-Blank Vocal',
    'Stereo slap-delay ad-lib echo: (moving on)',
  ],

  // Structural & Timing Directives
  structuralTransitions: [
    '[Intro] -> [Verse 1] -> [Chorus] -> [Verse 2] -> [Chorus] -> [Bridge] -> [Outro]',
    'Start with a quiet piano intro, build into an energetic verse, pause for a moment of silence, then explode into the chorus.',
    'Build tension through the pre-chorus, then drop to silence before an explosive chorus.',
    'Gradual crescendo throughout the song, adding one instrument per section.',
    'A sudden stop after the bridge, followed by an a cappella chorus.',
    'Build to a beat drop at 12 seconds.',
    'The chorus kicks in at 22 seconds.',
    'Vocal sample repeats every 4 bars.',
  ],

  musicalKeys: [
    'in G major', 'in D minor', 'in C pentatonic', 'in A minor',
    'in F# minor', 'in E flat major', 'in B minor', 'in C major'
  ],

  moods: [
    'Ambient', 'Bright', 'Chill', 'Dark', 'Dreamy', 'Emotional', 'Ethereal',
    'Euphoric', 'Funky', 'Groovy', 'Melancholic', 'Nostalgic', 'Ominous',
    'Psychedelic', 'Relaxed', 'Soulful', 'Triumphant', 'Upbeat', 'Whimsical'
  ],

  sections: [
    { name: 'Intro', desc: 'Sets atmosphere, tempo, initial sound design' },
    { name: 'Verse 1', desc: 'Narrative storytelling, rhythm groove, lead vocal' },
    { name: 'Pre-Chorus', desc: 'Tension build-up, rising pitch, snare rolls' },
    { name: 'Chorus', desc: 'Highest melodic energy, full instrumentation, anthemic hook' },
    { name: 'Verse 2', desc: 'Continued narrative, added layers, syncopated stabs' },
    { name: 'Drop', desc: 'Electronic / Bass impact, rhythm peak' },
    { name: 'Bridge', desc: 'Key change, alternate rhythm, breakdown before climax' },
    { name: 'Solo', desc: 'Instrumental lead spotlight (Synth, Guitar, Sax)' },
    { name: 'Outro', desc: 'Decay, reverb tail, fade-out, resolving chord' },
  ],

  intensities: [
    '0/10 - Ambient silence / whispers',
    '2/10 - Minimal texture / solo instrument',
    '5/10 - Standard rhythm & vocal groove',
    '7/10 - Driving energy & full accompaniment',
    '9/10 - Peak chorus / festival drop',
    '10/10 - Maximum saturation / wall of sound',
  ],
};

export const LYRIA_TEMPLATES: LyriaTemplate[] = [
  {
    id: 'stella-aura-runway-forensic',
    name: 'Stella Aura (Runway Obey) – Forensic Master',
    genre: 'Dark Electronic / Runway Fashion',
    bpm: 120,
    description: 'Second-by-second forensic runway breakdown with vocal throws, mechanical commands, dynamic drops, and psychological critique.',
    tags: ['Stella Aura', 'Runway', '808 Bass', 'Forensic', 'Dark Wave'],
    templateText: `[0:00 - 0:02] Atmosphere: Intensity: 1/10. Ambient synth pad swell, low-pass filter gradually opens with subtle white-noise sweep. 120 BPM
[0:02 - 0:03] Lead Vocal: Intensity: 2/10. "Stella Aura" (Clean lead vocal placed dead-center).
[0:03 - 0:04] Lead Vocal: Intensity: 2/10. "Astra Light"
[0:04 - 0:08] Atmosphere: Intensity: 3/10. Ambient synth pads hold and pulse rhythmically; atmospheric riser begins building.
[0:09 - 0:10] Lead Vocal: Intensity: 3/10. "Fashion lights"
[0:10 - 0:12] Lead Vocal: Intensity: 3/10. "Flashing lights"
[0:12 - 0:14] Filter Sweep: Intensity: 4/10. High-pass/low-pass filter sweep peaks, all atmospheric sound abruptly chokes.
[0:14 - 0:15] Pause: Intensity: 0/10. Complete vacuum silence to build tension.
[0:15 - 0:16] Percussive Click: Intensity: 2/10. Isolated dry transient on beat 4 acting as downbeat trigger.

[0:16 - 0:18] Verse 1: Intensity: 6/10. Kick drops (four-on-the-floor) + driving 8th-note synth bassline + claps on beats 2 & 4. Lead vocal enters: "I see you on the runway". 120 BPM
[0:18 - 0:20] Instrumental Pocket: Intensity: 5/10. Kick and bass groove breathe; vocal space open.
[0:20 - 0:22] Verse 1: Intensity: 6/10. "Looking like a dream"
[0:22 - 0:23] Instrumental Pocket: Intensity: 5/10. Sub-bass emphasis.
[0:23 - 0:25] Verse 1: Intensity: 6/10. "Spotlight on your face"
[0:25 - 0:27] Verse 1: Intensity: 6/10. "Your name up on the screen"
[0:27 - 0:28] Vocal Ad-lib: Intensity: 7/10. "Woo!" (High-register hype ad-lib acting as rhythmic divider).
[0:28 - 0:31] Verse 1: Intensity: 6/10. Synth rhythm stabs open up: "Turn toward the camera"
[0:31 - 0:33] Stereo Delay Throw: Intensity: 6/10. "(the camera)" (Panned wide with quarter-note slap delay).
[0:33 - 0:35] Verse 1: Intensity: 6/10. "Give them your good side"
[0:35 - 0:36] Percussion: Intensity: 7/10. Closed 16th-note hi-hats enter.
[0:36 - 0:38] Verse 1: Intensity: 6/10. "They tell you when to move"
[0:38 - 0:42] Verse 1: Intensity: 6/10. "They tell you when to smile"
[0:42 - 0:44] Build: Intensity: 8/10. 16th-note snare roll + rising pitch synth sweep; low frequencies duck before chorus.

[0:44 - 0:46] Chorus 1: Intensity: 9/10. Full dynamic drop: Upbeat open hi-hats, bright high-register synth lead hook. Staccato lead vocal: "Walk!". 120 BPM
[0:46 - 0:48] Chorus 1: Intensity: 9/10. "Po-o-se" (Sustained melodic vocal with pitch modulation).
[0:48 - 0:51] Chorus 1: Intensity: 8/10. "Look this way"
[0:51 - 0:54] Chorus 1: Intensity: 8/10. "Do what they say"
[0:54 - 0:58] Harmonic Stack: Intensity: 9/10. "Now obey..." (Harmonic vocal stack widens into stereo field).
[0:58 - 0:59] Transition: Intensity: 6/10. Open hats cut out; high synth lead resolves down to root note.

[0:59 - 1:03] Verse 2: Intensity: 6/10. Arrangement strips back to driving kick and synth bass. "The keys are not in your hand". 120 BPM
[1:03 - 1:05] Verse 2: Intensity: 6/10. "You do not start the car"
[1:05 - 1:07] Doubled Vocal Repeat: Intensity: 5/10. "(You do not start the car)" (Soft, robotic backing echo).
[1:07 - 1:11] Verse 2: Intensity: 6/10. "They say you are going places"
[1:11 - 1:13] Verse 2: Intensity: 6/10. "You are still where you are"
[1:13 - 1:15] Doubled Vocal Repeat: Intensity: 5/10. "(You are still where you are)"
[1:15 - 1:16] Vocal Ad-lib: Intensity: 7/10. "Woo!" + Bright arpeggiated synth motif enters in high frequencies.
[1:16 - 1:19] Verse 2: Intensity: 6/10. "Your face is in the window"
[1:19 - 1:21] Verse 2: Intensity: 6/10. "Your name is on the tag"
[1:21 - 1:23] Doubled Vocal Repeat: Intensity: 5/10. "(Your name is on the tag)"
[1:23 - 1:25] Syncopated Stabs: Intensity: 7/10. Syncopated chord stabs hit on upbeats: "They sell you your own image".
[1:25 - 1:28] Verse 2: Intensity: 7/10. "And you buy it back"
[1:28 - 1:29] Build: Intensity: 8/10. Accelerating snare roll + filter sweep riser.

[1:29 - 1:31] Chorus 2: Intensity: 9/10. Peak energy drop with full rhythm section: "Walk!". 120 BPM
[1:31 - 1:33] Chorus 2: Intensity: 9/10. "Po-o-se" (Layered with thicker octave harmonies).
[1:33 - 1:36] Chorus 2: Intensity: 8/10. "Smile when they say"
[1:36 - 1:38] Chorus 2: Intensity: 8/10. "Do what they say"
[1:38 - 1:40] Vocal Echo Throw: Intensity: 7/10. "(what they say)"
[1:40 - 1:43] Vocal Stack: Intensity: 9/10. "Now obey..." (Multi-tracked vocal chorus).
[1:43 - 1:45] Vacuum Choke: Intensity: 0/10. Sudden arrangement choke: drums, bass, and synth leads abruptly drop off.

[1:45 - 1:48] Bridge: Intensity: 3/10. Drums/percussion completely removed, deep sub-bass pad drone, filtered texture, low-register intimate breathy vocal: "Chin up...". 120 BPM
[1:48 - 1:52] Bridge: Intensity: 3/10. "...eyes down, hold that smile"
[1:52 - 1:56] Tension Build: Intensity: 4/10. Ambient pad filter slowly opens, adding tension: "Turn around...".
[1:56 - 2:00] Bridge: Intensity: 5/10. "...you are in the car"

[2:00 - 2:04] Pre-Chorus Climax: Intensity: 7/10. Four-on-the-floor kick returns unaccompanied, urgent heartbeat pulse: "They hold the keys, tell you what to want...". 120 BPM
[2:04 - 2:07] Build: Intensity: 7/10. 8th-note snare roll begins; vocal stack enters: "...tell you what to be".
[2:07 - 2:08] Vocal Double: Intensity: 6/10. "(tell you what to be)"
[2:08 - 2:11] Build: Intensity: 8/10. Snare accelerates into 16th-note rolls; wide supersaw synth chords swell: "You start to lose your mind...".
[2:11 - 2:12] Vocal Echo: Intensity: 7/10. "(lose your mind)"
[2:12 - 2:16] Climax Peak: Intensity: 10/10. All instruments reach peak cutoff; high-pitch noise riser soars: "One command at a time".

[2:16 - 2:19] Outro: Intensity: 6/10. Full rhythm groove returns beneath original intro motif: "Stella Aura". 120 BPM
[2:19 - 2:21] Outro: Intensity: 6/10. "Astra Light"
[2:21 - 2:23] Outro: Intensity: 6/10. "Fashion lights"
[2:23 - 2:25] Outro: Intensity: 6/10. "Flashing lights"
[2:25 - 2:27] Spoken Cut: Intensity: 2/10. Drums and synth bass suddenly mute; rhythm cuts to silence. Dry spoken vocal: "Walk...".
[2:27 - 2:29] Spoken Cut: Intensity: 2/10. "Po-o-se..."
[2:29 - 2:31] Spoken Cut: Intensity: 1/10. "Obey"
[2:31 - 2:34] Reverb Decay: Intensity: 0/10. Long reverb and stereo delay tail decay into silence.`,
  },
  {
    id: 'synthwave-80s',
    name: 'Neon Cyberpunk 80s',
    genre: 'Retrowave / Synthwave',
    bpm: 124,
    description: 'Arpeggiated analog synth, pulsing bassline, gated snare, and nostalgic vocal melody.',
    tags: ['80s', 'Synthwave', 'Analog', 'Arpeggio', 'Cyberpunk'],
    templateText: `[0:00 - 0:15] Intro: Intensity: 3/10. Analog Juno-106 synth arpeggio, tape saturation, city rain at night. 124 BPM

[0:15 - 0:35] Verse: Intensity: 6/10. Driving 16th-note synth bass, gated reverb snare, vocoder vocals. 124 BPM

Driving through neon streets at 2 AM,
Headlights reflecting on the wet pavement,
Lost in the glow of the electric sky,
Chasing memories that will never die.

[0:35 - 0:55] Chorus: Intensity: 9/10. Massive analog brass swell, soaring vocal, full drum kit. 124 BPM

Take me back to 1984!
Shadows dancing on the boulevard floor!
In the neon light we will never fade!
To the rhythm of the promises we made!

[0:55 - 1:15] Solo: Intensity: 8/10. Screaming electric guitar solo with stereo chorus delay. 124 BPM

[1:15 - 1:30] Outro: Intensity: 2/10. Synthesizer filter sweeping closed, tape slowdown effect.`,
  },
  {
    id: 'lofi-midnight-chill',
    name: 'Midnight Lo-Fi Vinyl Beat',
    genre: 'Lo-Fi Hip Hop / Chillout',
    bpm: 84,
    description: 'Vinyl crackle, warm Rhodes chords, relaxed boom-bap drums, and smooth saxophone.',
    tags: ['Lo-Fi', 'Rhodes', 'Vinyl', 'Chill', 'Boom-Bap'],
    templateText: `[0:00 - 0:12] Intro: Intensity: 2/10. Heavy vinyl crackle, tape flutter, warm Rhodes electric piano chords. 84 BPM

[0:12 - 0:32] Verse: Intensity: 5/10. Dusty boom-bap kick and snare, mellow upright bass groove. 84 BPM

Coffee cup steaming by the window sill,
Midnight thoughts when the world is still,
Pages turning in a quiet room,
Chasing the light through the gentle gloom.

[0:32 - 0:52] Chorus: Intensity: 7/10. Smoky tenor saxophone melody weaving through Rhodes harmony. 84 BPM

Floating on midnight clouds,
Far above the noisy crowds,
Every heartbeat keeps the time,
In this peaceful state of mind.

[0:52 - 1:10] Outro: Intensity: 1/10. Rhodes chord decays with rain sound effect on the window. 84 BPM`,
  },
  {
    id: 'cinematic-epic-trailer',
    name: 'Hans Zimmer Cinematic Trailer',
    genre: 'Orchestral / Film Score',
    bpm: 110,
    description: 'Ticking clock, low cello ostinato, giant French horn swells, and thunderous taiko drums.',
    tags: ['Cinematic', 'Orchestral', 'Trailer', 'Hans Zimmer', 'Epic'],
    templateText: `[0:00 - 0:15] Intro: Intensity: 2/10. Ticking clock sound effect, low sub-bass drone, solitary cello ostinato. 110 BPM

[0:15 - 0:35] Build: Intensity: 5/10. French horns enter with heroic minor motif, string section swells. 110 BPM

[0:35 - 0:55] Climax: Intensity: 10/10. Thunderous taiko drums, massive brass braam hits, choir chanting in Latin, maximum wall of sound. 110 BPM

[0:55 - 1:15] Outro: Intensity: 1/10. Piano plays slow resolving chord, clock tick slows and stops.`,
  },
  {
    id: 'acoustic-indie-folk',
    name: 'Golden Hour Indie Folk',
    genre: 'Acoustic / Indie Folk',
    bpm: 96,
    description: 'Fingerstyle acoustic guitar, warm room ambience, fiddle harmonies, and heartfelt vocal.',
    tags: ['Acoustic', 'Folk', 'Guitar', 'Warmth', 'Indie'],
    templateText: `[0:00 - 0:15] Intro: Intensity: 3/10. Fingerstyle acoustic guitar picking in DADGAD tuning, warm tape room. 96 BPM

[0:15 - 0:35] Verse: Intensity: 5/10. Intimate male vocal, warm upright bass, gentle shaker. 96 BPM

We packed our bags before the break of dawn,
Left all the shadows on the overgrown lawn,
Rivers are calling and the mountains rise,
Reflecting gold in your morning eyes.

[0:35 - 0:55] Chorus: Intensity: 8/10. Acoustic guitar strumming, soaring vocal harmonies, lively fiddle melody. 96 BPM

Oh we were born to wander free!
Underneath the endless prairie sea!
Take my hand before the daylight ends!
Where the river meets the road again!

[0:55 - 1:15] Outro: Intensity: 2/10. Final acoustic guitar harmonics ringing into silent mountain breeze. 96 BPM`,
  },
  {
    id: 'pop-anthem-official',
    name: 'Pop Anthem (Road Trip in G Major)',
    genre: 'Indie Pop / Feel-Good',
    bpm: 122,
    description: 'Official Guide: Upbeat indie-pop in G major at 122 BPM. Bright acoustic guitar, driving kick drum, handclaps, and warm female vocal harmonies.',
    tags: ['Official Guide', 'Indie-Pop', 'G Major', 'Handclaps', 'Anthemic'],
    templateText: `[0:00 - 0:15] Intro: Intensity: 4/10. Bright acoustic guitar strumming in G major, four-on-the-floor kick drum, crisp handclaps on 2 and 4. 122 BPM

[0:15 - 0:35] Verse 1: Intensity: 6/10. Driving beat, warm female alto vocal delivery, upbeat rhythm. 122 BPM
Rolling down the window, golden summer sun,
Radio is playing and the weekend has begun,
Heading for the coastline, leaving all the weight,
Tires on the asphalt running through the golden gate!

[0:35 - 0:50] Pre-Chorus: Intensity: 7/10. Snare roll builds, backing harmonies enter. 122 BPM
Can you feel the rhythm in the ocean air?
Singing every chorus like we have no care!

[0:50 - 1:10] Chorus: Intensity: 9/10. Anthemic uplifting chorus, soaring vocal stack, full band explosion. 122 BPM
We keep moving on (moving on)!
Until the morning light!
Everything will be alright!
We are chasing the horizon into the wild blue sky!

[1:10 - 1:25] Outro: Intensity: 3/10. Acoustic guitar strumming rings out with handclaps fading into warm laughter. 122 BPM`,
  },
  {
    id: 'cinematic-cyberpunk-official',
    name: 'Cinematic Cyberpunk (D Minor 110 BPM)',
    genre: 'Cyberpunk Synthwave / Cinematic',
    bpm: 110,
    description: 'Official Guide: Dark cinematic cyberpunk in D minor at 110 BPM. Distorted bass, ominous analog synths, metallic percussion, ethereal female vocalise.',
    tags: ['Official Guide', 'Cyberpunk', 'D Minor', 'Distorted Bass', 'Cinematic'],
    templateText: `[0:00 - 0:18] Intro: Intensity: 3/10. Ominous arpeggiated analog synthesizers in D minor, distant metallic percussion reverb. 110 BPM

[0:18 - 0:40] Build: Intensity: 6/10. Heavy distorted 303 acid bassline cuts through crisp, tight hi-hats, dark industrial pulse. 110 BPM

[0:40 - 1:05] Climax / Drop: Intensity: 10/10. Maximum dynamic explosion, wall of sound fuzz synthesizers, ethereal female vocalise soaring through dense stereo field. 110 BPM
A spoken voice whispers right before the drop: "System overload."

[1:05 - 1:20] Outro: Intensity: 2/10. Low-pass filter sweeps closed on distorted bass, industrial drone fading into silence. 110 BPM`,
  },
  {
    id: 'lofi-study-beat-official',
    name: 'Lo-Fi Study Beat (30s Instrumental 82 BPM)',
    genre: 'Lo-Fi Hip Hop / Chillout',
    bpm: 82,
    description: 'Official Guide: Dusty vinyl crackle, mellow Rhodes piano chords, relaxed boom-bap drum groove at 82 BPM, warm upright bassline. Instrumental only.',
    tags: ['Official Guide', 'Lo-Fi', 'Instrumental', '82 BPM', 'Rhodes'],
    templateText: `[0:00 - 0:08] Intro: Intensity: 2/10. Dusty vinyl crackle, tape hiss, mellow Rhodes piano chords in relaxed progression. 82 BPM

[0:08 - 0:22] Main: Intensity: 5/10. Relaxed boom-bap drum groove, unquantized kick and snare, warm upright acoustic bassline, gentle jazz piano fills. 82 BPM

<instrumental>

[0:22 - 0:30] Outro: Intensity: 2/10. Gentle tape flutter slowdown, Rhodes piano chord decays into vinyl crackle and soft rain. 82 BPM`,
  },
];
