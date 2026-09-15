import { sfx } from './sfx.js';
import { AmbientJungleSynth } from './synth-track.js';
import { TRACKS } from '../tracks.js';

class AudioPlayer {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.masterGain = null;
    this.audioEl = null;
    this.sourceNode = null;
    this.synth = null;

    this.tracks = [...TRACKS];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.8;

    // Analyzer data arrays
    this.freqData = new Uint8Array(64);
    this.timeData = new Uint8Array(64);

    this.listeners = new Set();
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    sfx.init(this.ctx);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128; // 64 frequency bins
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Synth generator
    this.synth = new AmbientJungleSynth(this.ctx, this.masterGain);

    // Native audio element for files
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';
    this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
    this.sourceNode.connect(this.masterGain);

    this.audioEl.addEventListener('ended', () => this.next());
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentIndex];
  }

  playTrack(index) {
    this.ensureContext();
    if (index >= 0 && index < this.tracks.length) {
      this.currentIndex = index;
    }
    const track = this.getCurrentTrack();
    this.isPlaying = true;

    if (track.audioUrl) {
      if (this.synth) this.synth.stop();
      this.audioEl.src = track.audioUrl;
      this.audioEl.play().catch(() => {});
    } else {
      if (this.audioEl) this.audioEl.pause();
      if (this.synth) this.synth.start(track);
    }

    this.emitChange();
  }

  togglePlay() {
    this.ensureContext();
    if (this.isPlaying) {
      this.pause();
    } else {
      this.playTrack(this.currentIndex);
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.audioEl) this.audioEl.pause();
    if (this.synth) this.synth.stop();
    this.emitChange();
  }

  next() {
    const nextIdx = (this.currentIndex + 1) % this.tracks.length;
    this.playTrack(nextIdx);
  }

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playTrack(prevIdx);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.emitChange();
  }

  // Load custom local audio file from drag and drop
  loadCustomFile(file) {
    this.ensureContext();
    const url = URL.createObjectURL(file);
    const newTrack = {
      id: `USR_${Date.now().toString(36).toUpperCase()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'm0rvidd (Local Master)',
      album: 'Direct Memory Card Ingest',
      year: '2026',
      bpm: 170,
      key: 'Custom',
      duration: '--:--',
      sizeKb: Math.round(file.size / 1024),
      sector: 'USER_SECTOR // INGEST',
      notes: `Ingested master file: ${file.name}`,
      audioUrl: url
    };

    this.tracks.unshift(newTrack);
    this.playTrack(0);
  }

  // Audio reactive values for 3D shaders and visualizers
  // Returns { bass, mid, treble, energy, waveform } normalized [0, 1]
  getAnalysis() {
    if (!this.analyser || !this.isPlaying) {
      return { bass: 0, mid: 0, treble: 0, energy: 0, waveform: this.timeData };
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    // Bin calculations (64 bins total)
    // Low / Sub: bins 0..6 (~0-400Hz)
    // Mid: bins 7..24 (~400-2500Hz)
    // Treble: bins 25..55 (~2500-10000Hz)
    let bSum = 0;
    for (let i = 0; i <= 6; i++) bSum += this.freqData[i];
    const bass = (bSum / 7) / 255;

    let mSum = 0;
    for (let i = 7; i <= 24; i++) mSum += this.freqData[i];
    const mid = (mSum / 18) / 255;

    let tSum = 0;
    for (let i = 25; i <= 55; i++) tSum += this.freqData[i];
    const treble = (tSum / 31) / 255;

    const energy = (bass * 0.5 + mid * 0.3 + treble * 0.2);

    return { bass, mid, treble, energy, waveform: this.timeData };
  }

  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  emitChange() {
    this.listeners.forEach(cb => cb({
      track: this.getCurrentTrack(),
      isPlaying: this.isPlaying,
      volume: this.volume,
      index: this.currentIndex
    }));
  }
}

export const player = new AudioPlayer();
