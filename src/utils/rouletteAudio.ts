class RouletteAudioManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();
  private activeSource: AudioBufferSourceNode | null = null;
  private activeGain: GainNode | null = null;
  private volume = 0.35;
  private unlocked = false;
  private lastTickAt = 0;
  private readonly minTickIntervalMs = 130;

  private readonly soundUrls = {
    process: '/sounds/PPP.mp3',
    endProcess: '/sounds/end PPP.mp3',
    openCase: '/sounds/openCase fromInvintory.mp3',
  } as const;

  private getAudioContext(): AudioContext | null {
    try {
      if (this.ctx) return this.ctx;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
      return this.ctx;
    } catch {
      return null;
    }
  }

  async unlock(): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }
    this.unlocked = true;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.activeGain) {
      this.activeGain.gain.value = this.volume;
    }
  }

  private async loadBuffer(key: keyof typeof this.soundUrls): Promise<AudioBuffer | null> {
    const existing = this.buffers.get(key);
    if (existing) return existing;

    const pending = this.loading.get(key);
    if (pending) return pending;

    const promise = (async () => {
      const ctx = this.getAudioContext();
      if (!ctx) return null;
      try {
        const response = await fetch(this.soundUrls[key], { cache: 'force-cache' });
        const arr = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arr.slice(0));
        this.buffers.set(key, audioBuffer);
        return audioBuffer;
      } catch {
        return null;
      } finally {
        this.loading.delete(key);
      }
    })();

    this.loading.set(key, promise);
    return promise;
  }

  async preload(): Promise<void> {
    await this.unlock();
    await Promise.allSettled([
      this.loadBuffer('process'),
      this.loadBuffer('endProcess'),
      this.loadBuffer('openCase'),
    ]);
  }

  private async playBuffer(key: keyof typeof this.soundUrls, loop: boolean, volume?: number): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (!this.unlocked) {
      await this.unlock();
    }

    const buffer = await this.loadBuffer(key);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume ?? this.volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (loop) {
      this.stopLoop();
      this.activeSource = source;
      this.activeGain = gainNode;
      source.onended = () => {
        if (this.activeSource === source) {
          this.activeSource = null;
          this.activeGain = null;
        }
      };
    }

    source.start(0);
  }

  async playOpenCase(): Promise<void> {
    await this.playBuffer('openCase', false);
  }

  async startProcessLoop(): Promise<void> {
    await this.playBuffer('process', true, this.volume * 0.9);
  }

  stopLoop(): void {
    try {
      if (this.activeSource) {
        this.activeSource.stop(0);
        this.activeSource.disconnect();
      }
      if (this.activeGain) {
        this.activeGain.disconnect();
      }
    } catch {
      // ignore
    } finally {
      this.activeSource = null;
      this.activeGain = null;
    }
  }

  async playTickOneShot(): Promise<void> {
    const now = Date.now();
    if (now - this.lastTickAt < this.minTickIntervalMs) return;
    this.lastTickAt = now;
    await this.playBuffer('process', false, this.volume * 0.65);
  }

  async playEnd(): Promise<void> {
    this.stopLoop();
    await this.playBuffer('endProcess', false);
  }

  stopAll(): void {
    this.stopLoop();
  }
}

export const rouletteAudio = new RouletteAudioManager();
