// Music catalog: m0rvidd / Sub-Surface
// Ambient jungle, atmospheric drum & bass, nostalgic lo-fi

export const TRACKS = [
  {
    id: 'TRK_01',
    title: 'Afterimage',
    artist: 'm0rvidd',
    album: 'Substrata EP',
    year: '2001 / 2026',
    bpm: 168,
    key: 'F minor',
    duration: '04:42',
    sizeKb: 64,
    sector: 'SECTOR_01 // ATMOSPHERE',
    notes: 'Lush atmospheric pads, resonant 808 sub pressure, rolling nostalgic breaks. Bukem-style melodic progression.',
    audioUrl: null // Uses procedural ambient jungle generator when null, or user file
  },
  {
    id: 'TRK_02',
    title: 'Aliasing',
    artist: 'm0rvidd',
    album: 'Substrata EP',
    year: '2002 / 2026',
    bpm: 172,
    key: 'D minor',
    duration: '05:15',
    sizeKb: 128,
    sector: 'SECTOR_02 // THE BREAK',
    notes: 'Bitcrushed vocal cuts, early anime dialogue, frenetic amen chop, high-resonance low-pass sweeps.',
    audioUrl: null
  },
  {
    id: 'TRK_03',
    title: 'Meridian',
    artist: 'm0rvidd',
    album: 'Memory Card Sessions',
    year: '2000 / 2026',
    bpm: 164,
    key: 'Ab major',
    duration: '06:08',
    sizeKb: 96,
    sector: 'SECTOR_03 // DRIFT',
    notes: 'Oceanic reverb tails, detuned Rhodes chords, warm tape decay, late-night transit melancholy.',
    audioUrl: null
  },
  {
    id: 'TRK_04',
    title: 'Substrata',
    artist: 'm0rvidd',
    album: 'Memory Card Sessions',
    year: '2003 / 2026',
    bpm: 174,
    key: 'C minor',
    duration: '04:58',
    sizeKb: 80,
    sector: 'SECTOR_04 // PRESSURE',
    notes: 'Heavy sub frequency envelope, metallic percussion, dystopian corridor atmosphere, dark tech-step influence.',
    audioUrl: null
  },
  {
    id: 'TRK_05',
    title: 'Memory Card 2001',
    artist: 'm0rvidd',
    album: 'System BIOS Archive',
    year: '2001 / 2026',
    bpm: 160,
    key: 'G minor',
    duration: '03:50',
    sizeKb: 112,
    sector: 'SECTOR_05 // MONOLITH',
    notes: 'Ethereal PS2 BIOS boot chords sampled and pitched, woven into slow-building ambient jungle breakbeats.',
    audioUrl: null
  }
];

export const SCENES = [
  {
    id: 'bios',
    name: 'TOWERS OF MEMORY',
    era: 'SONY PS2 BIOS // 2000',
    subtitle: 'System Browser & Memory Void',
    accent: '#4488ff',
    bg: '#04060d'
  },
  {
    id: 'wipeout',
    name: 'AG TELEMETRY',
    era: 'PULSE / WIPEOUT // 1999',
    subtitle: 'Anti-Gravity Circuit Diagnostics',
    accent: '#ff6600',
    bg: '#08080c'
  },
  {
    id: 'gt',
    name: 'SPEC LOUNGE',
    era: 'A-SPEC / GT3 // 2001',
    subtitle: 'Turntable Precision Showroom',
    accent: '#00d4ff',
    bg: '#070b14'
  },
  {
    id: 'codec',
    name: 'CODEC VR',
    era: 'TACTICAL VR // 2002',
    subtitle: 'Signal Intercept & Frequency Tuner',
    accent: '#44ff88',
    bg: '#020d06'
  }
];
