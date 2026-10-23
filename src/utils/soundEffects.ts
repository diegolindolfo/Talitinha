// Zero-dependency procedural Web Audio API retro 16-bit synthesizer for romantic cues

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playSceneTransition(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5 warm major triad
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.065);

      gain.gain.setValueAtTime(0.001, now + i * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.06, now + i * 0.065 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.065 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.065);
      osc.stop(now + i * 0.065 + 0.3);
    });
  }

  public playLetterOpen(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.07 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.07 + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.45);
    });
  }

  public playCelebrationFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Romantic 16-bit RPG victory/love melody
    const melody = [
      { freq: 523.25, delay: 0.0, dur: 0.14 }, // C5
      { freq: 659.25, delay: 0.13, dur: 0.14 }, // E5
      { freq: 783.99, delay: 0.26, dur: 0.14 }, // G5
      { freq: 987.77, delay: 0.39, dur: 0.22 }, // B5
      { freq: 1046.5, delay: 0.6, dur: 0.55 }, // C6
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      gain.gain.setValueAtTime(0.001, now + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.11, now + note.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.dur + 0.04);
    });
  }
}

export const soundEngine = new RetroSoundEngine();
