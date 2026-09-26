'use client';

export type SfxType = 'hover' | 'click' | 'scroll' | 'whoosh' | 'transition' | 'tab';

const SFX_PATHS: Record<'hover' | 'click' | 'scroll' | 'energy', string> = {
  hover: '/audio/sfx/hover.wav',
  click: '/audio/sfx/click.wav',
  scroll: '/audio/sfx/scroll.wav',
  energy: '/audio/sfx/energy.mp3',
};

const SFX_VOLUMES: Record<'hover' | 'click' | 'scroll' | 'energy', number> = {
  hover: 0.34,
  scroll: 0.48,
  click: 0.58,
  energy: 0.54,
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private muted = false;
  private volume = 0.85;

  private lastHoverTime = 0;
  private lastScrollTime = 0;
  private lastEnergyTime = 0;
  private lastIntroTickTime = 0;

  // Decoded Web Audio buffers + HTMLAudioElement fallback pools for zero-latency SFX
  private sfxBuffers: Partial<Record<'hover' | 'click' | 'scroll' | 'energy', AudioBuffer>> = {};
  private sfxRawData: Partial<Record<'hover' | 'click' | 'scroll' | 'energy', ArrayBuffer>> = {};
  private sfxHtmlElements: Partial<Record<'hover' | 'click' | 'scroll' | 'energy', HTMLAudioElement>> = {};

  // Dual-deck seamless crossfade loop engine for soft background music (/audio/ambient.mp3)
  private decks: [HTMLAudioElement, HTMLAudioElement] | null = null;
  private activeDeckIdx: 0 | 1 = 0;
  private isCrossfading = false;
  private bgStarted = false;
  private readonly bgMaxVolume = 0.30; // Slightly warmer, fuller soft background music level
  private readonly startOffset = 0.35; // Start right on the opening motif with zero blank gap
  private readonly crossfadeDuration = 3.8; // Seconds of overlap crossfade at loop boundary
  private readonly loopLeadTime = 4.2; // Start next loop before trailing silence

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupBackgroundMusic();
      this.preloadSfxFiles();
      this.init();

      const unlock = () => {
        if (!this.isInitialized || (this.ctx && this.ctx.state === 'suspended')) {
          this.init();
        }
        if (!this.bgStarted) {
          this.ensureBackgroundPlaying();
        }
      };
      window.addEventListener('pointerdown', unlock, { once: false, passive: true });
      window.addEventListener('pointermove', unlock, { once: false, passive: true });
      window.addEventListener('wheel', unlock, { once: false, passive: true });
      window.addEventListener('keydown', unlock, { once: false, passive: true });
      window.addEventListener('touchstart', unlock, { once: false, passive: true });
    }
  }

  private getTargetBgVolume(): number {
    return this.muted ? 0 : this.bgMaxVolume * this.volume;
  }

  private preloadSfxFiles() {
    if (typeof window === 'undefined') return;

    (Object.keys(SFX_PATHS) as Array<keyof typeof SFX_PATHS>).forEach((key) => {
      const url = SFX_PATHS[key];

      // Preload HTML5 Audio element for instant fallback
      const el = new Audio(url);
      el.preload = 'auto';
      this.sfxHtmlElements[key] = el;

      // Pre-fetch raw ArrayBuffer so Web Audio API can decode it immediately once AudioContext is ready
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          this.sfxRawData[key] = buf;
          if (this.ctx) {
            this.decodeSfxBuffer(key, buf);
          }
        })
        .catch(() => {});
    });
  }

  private decodeSfxBuffer(key: keyof typeof SFX_PATHS, rawBuf: ArrayBuffer) {
    if (!this.ctx || this.sfxBuffers[key]) return;
    // Clone buffer in case decodeAudioData detaches it
    const copy = rawBuf.slice(0);
    this.ctx.decodeAudioData(
      copy,
      (decoded) => {
        this.sfxBuffers[key] = decoded;
      },
      () => {}
    );
  }

  private setupBackgroundMusic() {
    if (typeof window === 'undefined' || this.decks) return;

    const createDeck = () => {
      const audio = new Audio('/audio/ambient.mp3');
      audio.preload = 'auto';
      audio.loop = false; // Managed by seamless crossfader (with fallback on ended)
      audio.volume = 0;
      return audio;
    };

    const deckA = createDeck();
    const deckB = createDeck();
    this.decks = [deckA, deckB];

    // Fallback in case tab is backgrounded and timer is throttled across the loop point
    const handleEnded = (idx: 0 | 1) => {
      if (!this.decks || this.activeDeckIdx !== idx || this.isCrossfading) return;
      const active = this.decks[idx];
      active.currentTime = this.startOffset;
      active.volume = this.getTargetBgVolume();
      active.play().catch(() => {});
    };

    deckA.addEventListener('ended', () => handleEnded(0));
    deckB.addEventListener('ended', () => handleEnded(1));

    // Monitor playback position for gapless overlap crossfading
    window.setInterval(() => {
      if (!this.decks || !this.bgStarted || this.isCrossfading) return;
      const active = this.decks[this.activeDeckIdx];
      if (active.paused) return;

      const effectiveDuration =
        Number.isFinite(active.duration) && active.duration > 10 && active.duration < 900
          ? active.duration
          : 770;
      const remaining = effectiveDuration - active.currentTime;
      if (remaining <= this.loopLeadTime) {
        this.crossfadeToNextDeck();
      }
    }, 180);

    // Attempt immediate soft fade-in on page load
    this.ensureBackgroundPlaying();
  }

  private ensureBackgroundPlaying() {
    if (!this.decks || this.bgStarted) return;
    const active = this.decks[this.activeDeckIdx];
    if (active.currentTime < this.startOffset) {
      try {
        active.currentTime = this.startOffset;
      } catch {
        // Metadata not yet loaded; will seek on play
      }
    }
    const targetVol = this.getTargetBgVolume();
    const initialVol = targetVol * 0.45;
    active.volume = initialVol;

    const playPromise = active.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (this.bgStarted) return;
          this.bgStarted = true;
          if (active.currentTime < this.startOffset) {
            try {
              active.currentTime = this.startOffset;
            } catch {}
          }
          this.fadeAudioElement(active, initialVol, this.getTargetBgVolume(), 0.9);
        })
        .catch(() => {
          // Autoplay blocked until first user gesture — unlock listeners will retry automatically
        });
    }
  }

  private crossfadeToNextDeck() {
    if (!this.decks || this.isCrossfading) return;
    this.isCrossfading = true;

    const prevIdx = this.activeDeckIdx;
    const nextIdx: 0 | 1 = prevIdx === 0 ? 1 : 0;
    this.activeDeckIdx = nextIdx;

    const outgoing = this.decks[prevIdx];
    const incoming = this.decks[nextIdx];

    incoming.currentTime = this.startOffset; // Start directly on the opening note
    incoming.volume = 0;
    incoming.play().catch(() => {});

    const startTime = performance.now();
    const durationMs = this.crossfadeDuration * 1000;
    const startOutVol = outgoing.volume;

    const step = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      // Equal-power cosine crossfade curve so perceived loudness stays completely constant
      const fadeOut = Math.cos(t * Math.PI * 0.5);
      const fadeIn = Math.sin(t * Math.PI * 0.5);
      const targetVol = this.getTargetBgVolume();

      outgoing.volume = Math.max(0, Math.min(1, startOutVol * fadeOut));
      incoming.volume = Math.max(0, Math.min(1, targetVol * fadeIn));

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        outgoing.pause();
        outgoing.currentTime = this.startOffset;
        outgoing.volume = 0;
        incoming.volume = this.getTargetBgVolume();
        this.isCrossfading = false;
      }
    };

    requestAnimationFrame(step);
  }

  private fadeAudioElement(
    audio: HTMLAudioElement,
    fromVol: number,
    toVol: number,
    durationSec: number
  ) {
    const startTime = performance.now();
    const durationMs = durationSec * 1000;

    const step = (now: number) => {
      if (this.isCrossfading) return;
      const t = Math.min((now - startTime) / durationMs, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      const currentTarget = this.muted ? 0 : toVol;
      audio.volume = Math.max(0, Math.min(1, fromVol + (currentTarget - fromVol) * ease));
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  init() {
    if (typeof window === 'undefined') return;

    this.setupBackgroundMusic();
    this.ensureBackgroundPlaying();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);

      // Decode any pre-fetched SFX buffers
      (Object.keys(this.sfxRawData) as Array<keyof typeof SFX_PATHS>).forEach((key) => {
        const raw = this.sfxRawData[key];
        if (raw) {
          this.decodeSfxBuffer(key, raw);
        }
      });

      this.isInitialized = true;
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  play(sfxName: SfxType | string) {
    if (typeof window === 'undefined' || this.muted) return;
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const nowMs = performance.now();

    // Map logical event names to the 4 uploaded SFX assets:
    // - 'transition' / 'whoosh' / 'tab' -> energy field sound (/audio/sfx/energy.mp3)
    // - 'click' -> sci-fi select click (/audio/sfx/click.wav)
    // - 'scroll' -> crisp orbital step click (/audio/sfx/scroll.wav)
    // - 'hover' -> subtle tactile tick (/audio/sfx/hover.wav)
    let key: keyof typeof SFX_PATHS = 'click';

    if (sfxName === 'hover') {
      if (nowMs - this.lastHoverTime < 65) return;
      this.lastHoverTime = nowMs;
      key = 'hover';
    } else if (sfxName === 'scroll') {
      if (nowMs - this.lastScrollTime < 90) return;
      this.lastScrollTime = nowMs;
      key = 'scroll';
    } else if (sfxName === 'transition' || sfxName === 'whoosh' || sfxName === 'tab') {
      if (nowMs - this.lastEnergyTime < 140) return;
      this.lastEnergyTime = nowMs;
      key = 'energy';
    } else {
      key = 'click';
    }

    const gainLevel = SFX_VOLUMES[key];

    // Prefer zero-latency Web Audio API AudioBuffer playback
    const buffer = this.sfxBuffers[key];
    if (this.ctx && this.masterGain && buffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.value = gainLevel;

      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(0);
      return;
    }

    // Fallback to cloned HTMLAudioElement if Web Audio buffer is still decoding
    const baseEl = this.sfxHtmlElements[key];
    if (baseEl) {
      const clone = baseEl.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, gainLevel * this.volume));
      clone.play().catch(() => {});
    }
  }

  /**
   * Layered camera-shutter sound effect for each letter scroll / lock-in during the IntroSequence.
   * Stacks primary shutter ('scroll.wav') + staggered secondary curtain ('hover.wav') with rising pitch.
   */
  playIntroLetterTick(progress = 0.5, isLockIn = false) {
    if (typeof window === 'undefined' || this.muted) return;
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const nowMs = performance.now();
    if (!isLockIn && nowMs - this.lastIntroTickTime < 46) return;
    this.lastIntroTickTime = nowMs;

    const jitter = (Math.random() - 0.5) * 0.08;
    const rateA = 1.04 + progress * 0.24 + jitter;
    const rateB = 1.18 + progress * 0.28 - jitter * 0.7;
    const gainA = isLockIn ? 0.36 : 0.24;
    const gainB = isLockIn ? 0.28 : 0.18;

    const scrollBuf = this.sfxBuffers.scroll;
    const hoverBuf = this.sfxBuffers.hover;
    const clickBuf = this.sfxBuffers.click;

    if (this.ctx && this.ctx.state === 'running' && this.masterGain && (scrollBuf || hoverBuf)) {
      const t0 = this.ctx.currentTime;

      if (scrollBuf) {
        const srcA = this.ctx.createBufferSource();
        srcA.buffer = scrollBuf;
        srcA.playbackRate.value = rateA;
        const gA = this.ctx.createGain();
        gA.gain.setValueAtTime(gainA, t0);
        srcA.connect(gA);
        gA.connect(this.masterGain);
        srcA.start(t0);
      }

      if (hoverBuf) {
        const srcB = this.ctx.createBufferSource();
        srcB.buffer = hoverBuf;
        srcB.playbackRate.value = rateB;
        const gB = this.ctx.createGain();
        gB.gain.setValueAtTime(gainB, t0 + 0.016);
        srcB.connect(gB);
        gB.connect(this.masterGain);
        srcB.start(t0 + 0.016);
      }

      if (isLockIn && clickBuf) {
        const srcC = this.ctx.createBufferSource();
        srcC.buffer = clickBuf;
        srcC.playbackRate.value = 1.08 + progress * 0.16;
        const gC = this.ctx.createGain();
        gC.gain.setValueAtTime(0.22, t0 + 0.026);
        srcC.connect(gC);
        gC.connect(this.masterGain);
        srcC.start(t0 + 0.026);
      }
      return;
    }

    // HTMLAudioElement fallback with layered shutter playbackRate
    const scrollEl = this.sfxHtmlElements.scroll;
    if (scrollEl) {
      const cloneA = scrollEl.cloneNode() as HTMLAudioElement;
      cloneA.preservesPitch = false;
      cloneA.playbackRate = rateA;
      cloneA.volume = Math.max(0, Math.min(1, gainA * this.volume));
      cloneA.play().catch(() => {});
    }
    const hoverEl = this.sfxHtmlElements.hover;
    if (hoverEl) {
      window.setTimeout(() => {
        if (this.muted) return;
        const cloneB = hoverEl.cloneNode() as HTMLAudioElement;
        cloneB.preservesPitch = false;
        cloneB.playbackRate = rateB;
        cloneB.volume = Math.max(0, Math.min(1, gainB * this.volume));
        cloneB.play().catch(() => {});
      }, 16);
    }
  }

  /**
   * One celestial swoosh sound effect when the shooting star streaks across the screen in the IntroSequence.
   */
  playIntroStarSwoosh() {
    if (typeof window === 'undefined' || this.muted) return;
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const energyBuf = this.sfxBuffers.energy;
    const scrollBuf = this.sfxBuffers.scroll;

    if (this.ctx && this.ctx.state === 'running' && this.masterGain && energyBuf) {
      const t0 = this.ctx.currentTime;

      const src = this.ctx.createBufferSource();
      src.buffer = energyBuf;
      src.playbackRate.setValueAtTime(1.18, t0);
      src.playbackRate.exponentialRampToValueAtTime(0.96, t0 + 0.72);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.58, t0);

      src.connect(gain);
      gain.connect(this.masterGain);
      src.start(t0);

      if (scrollBuf) {
        const accent = this.ctx.createBufferSource();
        accent.buffer = scrollBuf;
        accent.playbackRate.value = 0.84;
        const accentGain = this.ctx.createGain();
        accentGain.gain.setValueAtTime(0.24, t0);
        accent.connect(accentGain);
        accentGain.connect(this.masterGain);
        accent.start(t0);
      }
      return;
    }

    const energyEl = this.sfxHtmlElements.energy;
    if (energyEl) {
      const clone = energyEl.cloneNode() as HTMLAudioElement;
      clone.preservesPitch = false;
      clone.playbackRate = 1.15;
      clone.volume = Math.max(0, Math.min(1, 0.58 * this.volume));
      clone.play().catch(() => {});
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.decks) {
      if (!m && !this.bgStarted) {
        this.ensureBackgroundPlaying();
      } else {
        const active = this.decks[this.activeDeckIdx];
        const other = this.decks[this.activeDeckIdx === 0 ? 1 : 0];
        if (m) {
          active.volume = 0;
          other.volume = 0;
        } else if (!this.isCrossfading) {
          this.fadeAudioElement(active, active.volume, this.getTargetBgVolume(), 0.45);
        }
      }
    }
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
    if (this.decks && !this.muted && !this.isCrossfading) {
      this.decks[this.activeDeckIdx].volume = this.getTargetBgVolume();
    }
  }
}

export const audioManager = new AudioManager();


