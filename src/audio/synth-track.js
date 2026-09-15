// Procedural Ambient Jungle & Atmospheric Breakbeat Synthesizer
// Generates lush SAW85-92 pads, deep 808 sub bass, and crisp 165 BPM breakbeat pulses

export class AmbientJungleSynth {
  constructor(ctx, outputNode) {
    this.ctx = ctx;
    this.outputNode = outputNode;
    this.isPlaying = false;
    this.timerId = null;
    this.currentTrack = null;
    this.step = 0;
    this.bpm = 168;

    // Pad voices
    this.padOscs = [];
    this.padGain = null;
    this.padFilter = null;

    // Master bus for synth track
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.outputNode);

    // Reverb / delay simulation using feedback delay
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.value = 0.28; // ~3/16th at 168 bpm
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.45;
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 2400;

    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFilter.connect(this.masterGain);
  }

  start(track) {
    this.stop();
    this.currentTrack = track;
    this.bpm = track.bpm || 168;
    this.isPlaying = true;
    this.step = 0;

    this.startPad(track.key || 'F minor');
    this.scheduleNextBeat();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.stopPad();
  }

  // Atmospheric Bukem/Aphex style lush detuned pad
  startPad(keyName) {
    const t = this.ctx.currentTime;
    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.001, t);
    this.padGain.linearRampToValueAtTime(0.28, t + 2.0);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.setValueAtTime(450, t);
    this.padFilter.Q.setValueAtTime(3.0, t);

    // Modulate pad filter with gentle LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, t); // Slow 8-second breathing sweep
    lfoGain.gain.setValueAtTime(350, t);
    lfo.connect(lfoGain);
    lfoGain.connect(this.padFilter.frequency);
    lfo.start(t);

    // Chords mapped to key
    const chordFreqs = keyName.includes('Ab')
      ? [207.65, 261.63, 311.13, 392.00] // Ab maj7
      : keyName.includes('D')
      ? [146.83, 220.00, 261.63, 329.63] // D min9
      : keyName.includes('C')
      ? [130.81, 196.00, 233.08, 293.66] // C min7
      : [174.61, 261.63, 311.13, 392.00]; // F min9

    this.padOscs = [];
    chordFreqs.forEach((freq) => {
      // 2 detuned oscillators per note for stereo shimmer
      [-3.5, 3.5].forEach((detune) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);
        osc.connect(this.padFilter);
        osc.start(t);
        this.padOscs.push(osc);
      });
    });

    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.masterGain);
    this.padGain.connect(this.delayNode);
  }

  stopPad() {
    if (this.padGain) {
      const t = this.ctx.currentTime;
      this.padGain.gain.linearRampToValueAtTime(0.001, t + 0.8);
      setTimeout(() => {
        this.padOscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch {}
        });
        this.padOscs = [];
        if (this.padGain) {
          try { this.padGain.disconnect(); } catch {}
          this.padGain = null;
        }
      }, 900);
    }
  }

  // 16-step jungle rhythm sequencer (runs in 16th notes)
  scheduleNextBeat() {
    if (!this.isPlaying) return;

    const secondsPer16th = (60 / this.bpm) / 4;
    const t = this.ctx.currentTime;
    const s = this.step % 16;

    // Jungle Drum Pattern:
    // Kick: steps 0, 10
    // Snare: steps 4, 12, with syncopated ghost snares on 7, 14
    // Hats: steps 2, 4, 6, 8, 10, 12, 14
    // Sub bass: triggers on 0, 8
    if (s === 0 || s === 10) {
      this.triggerKick(t, s === 0 ? 1.0 : 0.7);
    }

    if (s === 4 || s === 12) {
      this.triggerSnare(t, 0.8);
    } else if (s === 7 || s === 14) {
      this.triggerSnare(t, 0.35, true); // Ghost snare
    }

    if (s % 2 === 0) {
      this.triggerHiHat(t, s % 4 === 2 ? 0.4 : 0.2);
    }

    if (s === 0 || s === 8) {
      const rootHz = this.currentTrack?.key?.includes('D') ? 36.7 : 43.65; // Low D1 or F1
      this.triggerSubBass(t, rootHz);
    }

    this.step++;
    this.timerId = setTimeout(() => {
      this.scheduleNextBeat();
    }, secondsPer16th * 1000);
  }

  // Crisp synthetic kick drum
  triggerKick(t, vel = 1.0) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.6 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Amen-style snappy pitched snare
  triggerSnare(t, vel = 1.0, isGhost = false) {
    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isGhost ? 240 : 210, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);

    oscGain.gain.setValueAtTime(0.3 * vel, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + (isGhost ? 0.06 : 0.12));

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Noise snap
    const bufferSize = Math.floor(this.ctx.sampleRate * (isGhost ? 0.07 : 0.16));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * vel, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + (isGhost ? 0.06 : 0.16));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    if (!isGhost) noiseGain.connect(this.delayNode);

    noise.start(t);
    noise.stop(t + 0.2);
  }

  // Fast 16th hi-hat
  triggerHiHat(t, vel = 0.3) {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(8500, t);
    filter.Q.setValueAtTime(6.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.05);
  }

  // Heavy 808-style sine sub
  triggerSubBass(t, rootHz) {
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(rootHz, t);
    sub.frequency.exponentialRampToValueAtTime(rootHz * 0.98, t + 0.6);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.55, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    sub.connect(gain);
    gain.connect(this.masterGain);

    sub.start(t);
    sub.stop(t + 0.75);
  }
}
