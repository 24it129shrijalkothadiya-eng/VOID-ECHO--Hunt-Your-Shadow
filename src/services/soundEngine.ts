/**
 * VOID ECHO - Procedural Cyberpunk Synthesizer Audio Engine
 * Built exclusively with Web Audio API. Zero external sound files needed.
 */

import { AudioSettings } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isPlayingMusic: boolean = false;
  private musicTimer: number | null = null;
  private chaseIntensity: number = 0; // 0 to 1
  private currentStep: number = 0;

  private settings: AudioSettings = {
    masterVolume: 0.75,
    musicVolume: 0.65,
    sfxVolume: 0.8,
    isMuted: false,
  };

  private notes = {
    // Cyberpunk synth minor pentatonic / dorian notes in Hz
    bassA: 110,
    bassC: 130.81,
    bassD: 146.83,
    bassE: 164.81,
    bassG: 196.00,
    midA: 220,
    midC: 261.63,
    midD: 293.66,
    midE: 329.63,
    midG: 392.00,
    highA: 440,
    highC: 523.25,
    highD: 587.33,
    highE: 659.25,
    highG: 783.99,
  };

  constructor() {
    // Context is created on first user interaction to comply with browser autoplay policies
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.settings.isMuted ? 0 : this.settings.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music Channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.settings.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // Audio not supported in this environment
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.settings.isMuted ? 0 : this.settings.masterVolume,
        t,
        0.05
      );
    }
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.settings.musicVolume, t, 0.05);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume, t, 0.05);
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setChaseIntensity(intensity: number) {
    this.chaseIntensity = Math.max(0, Math.min(1, intensity));
  }

  // --- Dynamic Procedural Music Loop ---
  public startMusic() {
    this.init();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;
    this.scheduleNextBeat();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextBeat = () => {
    if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;

    const baseTempoBpm = 118 + this.chaseIntensity * 32; // Speeds up during chase!
    const stepDurationMs = (60 / baseTempoBpm / 4) * 1000; // 16th notes

    this.playMusicStep(this.currentStep);
    this.currentStep = (this.currentStep + 1) % 16;

    this.musicTimer = window.setTimeout(this.scheduleNextBeat, stepDurationMs);
  };

  private playMusicStep(step: number) {
    if (!this.ctx || !this.musicGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const isKick = step % 4 === 0;
    const isSnare = step === 4 || step === 12;
    const isHiHat = step % 2 === 0;

    // Rhythmic Kick
    if (isKick) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140 + this.chaseIntensity * 20, t);
      kickOsc.frequency.exponentialRampToValueAtTime(32, t + 0.12);

      kickGain.gain.setValueAtTime(0.35, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);

      kickOsc.start(t);
      kickOsc.stop(t + 0.15);
    }

    // Snare / Cyber Clack
    if (isSnare) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Hi-hat pulse
    if (isHiHat && (step % 4 !== 0 || this.chaseIntensity > 0.3)) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'highpass' as unknown as OscillatorType; // fallback to sawtooth with high freq
      osc.type = 'square';
      osc.frequency.setValueAtTime(4200, t);

      gain.gain.setValueAtTime(0.035 + this.chaseIntensity * 0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.05);
    }

    // Cyberpunk Synth Bassline / Arp
    const bassScale = [
      this.notes.bassA,
      this.notes.bassA,
      this.notes.bassC,
      this.notes.bassD,
      this.notes.bassA,
      this.notes.bassE,
      this.notes.bassG,
      this.notes.bassD,
    ];
    const bassNote = bassScale[(step >> 1) % bassScale.length];

    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bassOsc.type = this.chaseIntensity > 0.4 ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(bassNote, t);

      // Low pass filter sweeps with chase intensity
      filter.type = 'lowpass';
      const cutoff = 400 + this.chaseIntensity * 1400;
      filter.frequency.setValueAtTime(cutoff, t);
      filter.Q.setValueAtTime(3 + this.chaseIntensity * 4, t);

      bassGain.gain.setValueAtTime(0.18 + this.chaseIntensity * 0.12, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(t);
      bassOsc.stop(t + 0.2);
    }

    // Melodic Arpeggio on upper 16th notes
    if (step % 2 === 1) {
      const arpNotes = [
        this.notes.highA,
        this.notes.midE,
        this.notes.highC,
        this.notes.highE,
        this.notes.highD,
        this.notes.midG,
        this.notes.highC,
        this.notes.highG,
      ];
      const arpNote = arpNotes[step % arpNotes.length];

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpNote, t);

      arpGain.gain.setValueAtTime(0.06 + this.chaseIntensity * 0.05, t);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      arpOsc.connect(arpGain);
      arpGain.connect(this.musicGain);

      arpOsc.start(t);
      arpOsc.stop(t + 0.1);
    }
  }

  // --- Sound Effects (SFX) ---

  // Energy Orb Collection: Ascending pentatonic chord based on combo
  public playOrbCollect(comboMultiplier: number = 1) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const basePitches = [330, 392, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66];
    const pitchIndex = Math.min(basePitches.length - 1, Math.max(0, comboMultiplier - 1));
    const freq = basePitches[pitchIndex];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Echo Burst: Destroys trail, massive resonant cyber shockwave
  public playEchoBurst() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(260, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.45);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    // Resonant Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(90, t + 0.45);
    filter.Q.setValueAtTime(7, t);

    subOsc.connect(filter);
    filter.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t);
    subOsc.stop(t + 0.52);

    // High shimmer release
    const shimmerOsc = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(880, t);
    shimmerOsc.frequency.linearRampToValueAtTime(1760, t + 0.25);

    shimmerGain.gain.setValueAtTime(0.2, t);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(this.sfxGain);

    shimmerOsc.start(t);
    shimmerOsc.stop(t + 0.32);
  }

  // Phantom Flare: Decoy deployment electronic whistle & beacon hum
  public playPhantomFlare() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(1400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.3);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Near-Miss: High-speed sonic razor swish
  public playNearMiss() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.linearRampToValueAtTime(1350, t + 0.06);
    osc.frequency.linearRampToValueAtTime(950, t + 0.16);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Enemy Stunned: Digital zap distortion
  public playEnemyStun() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.14);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Sudden Death Klaxon
  public playSuddenDeathAlert() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.setValueAtTime(520, t + 0.15);
    osc.frequency.setValueAtTime(650, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.58);
  }

  // Player Captured / Game Over
  public playPlayerCaptured() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.68);
  }

  // UI Click / Navigation
  public playUiClick() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Sound Test preview function for Settings
  public previewSound(type: 'music' | 'sfx') {
    this.init();
    if (type === 'music') {
      this.playMusicStep(0);
      setTimeout(() => this.playMusicStep(2), 120);
      setTimeout(() => this.playMusicStep(4), 240);
    } else {
      this.playEchoBurst();
    }
  }
}

export const soundEngine = new SoundEngine();
