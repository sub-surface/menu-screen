// Procedural Web Audio Synthesizer for retro console UI sound effects
// Zero external asset dependencies — purely synthesized haptics

class RetroSFX {
  constructor() {
    this.ctx = null;
    this.volumeNode = null;
    this.enabled = true;
  }

  init(audioContext = null) {
    if (this.ctx) return;
    if (audioContext) {
      this.ctx = audioContext;
    } else {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }

    this.volumeNode = this.ctx.createGain();
    this.volumeNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.volumeNode.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    if (!this.volumeNode || !this.ctx) return;
    this.volumeNode.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
  }

  // PS2 / Late-90s cursor navigation tick:
  // Short bandpass metallic click with fast decay
  playCursor() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.035);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Select / Confirm:
  // Dual-tone harmonic crystal chime with high resonance
  playConfirm() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [880, 1320, 1760]; // A5, E6, A6

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.08);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, t);

      const amp = (0.2 / (idx + 1));
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35 + idx * 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.volumeNode);

      osc.start(t + idx * 0.02);
      osc.stop(t + 0.45);
    });
  }

  // Back / Cancel:
  // Damped low-pitched double tap buzz
  playCancel() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Scene switch / Era warp:
  // Resonant bandpass frequency sweep with noise texture
  playSceneWarp() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.4;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(4500, t + dur * 0.6);
    filter.frequency.exponentialRampToValueAtTime(800, t + dur);
    filter.Q.setValueAtTime(6.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.volumeNode);

    noise.start(t);
    noise.stop(t + dur);

    // Deep sub drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + dur);
    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    sub.connect(subGain);
    subGain.connect(this.volumeNode);
    sub.start(t);
    sub.stop(t + dur);
  }

  // Iconic PS2 BIOS boot drone chord:
  // Low resonant drone + detuned high ether shimmer
  playBootSequence() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 3.5;

    // Sub foundation
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(55, t); // A1
    sub.frequency.linearRampToValueAtTime(55, t + dur);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, t);
    subFilter.frequency.exponentialRampToValueAtTime(350, t + 1.5);
    subFilter.frequency.exponentialRampToValueAtTime(90, t + dur);

    subGain.gain.setValueAtTime(0.01, t);
    subGain.gain.linearRampToValueAtTime(0.35, t + 0.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    sub.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.volumeNode);

    sub.start(t);
    sub.stop(t + dur);

    // High crystalline shimmer chord
    const highFreqs = [440, 554.37, 659.25, 830.61]; // Amaj7 chord
    highFreqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 2, t);
      osc.frequency.linearRampToValueAtTime(f * 2.005, t + dur);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 0.6 + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(g);
      g.connect(this.volumeNode);
      osc.start(t);
      osc.stop(t + dur);
    });
  }
}

export const sfx = new RetroSFX();
