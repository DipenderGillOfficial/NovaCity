/**
 * Bloomfield Smart City Environmental Soundscape Synthesizer Engine
 * 
 * Uses Web Audio API to procedurally generate immersive low-frequency background waves,
 * simulating real-time audio feeds of different city sectors (Upper Lake Oasis, Solar Highlands, etc.)
 * with zero external assets or downloading requirements.
 */

class CitySoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: any[] = [];
  private currentFeed: string = "off";
  private volume: number = 0.35;

  init() {
    if (this.ctx) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Failed to initialize Web Audio API:", e);
    }
  }

  stopAll() {
    this.activeSources.forEach(s => {
      try {
        if (typeof s.stop === "function") {
          s.stop();
        }
      } catch (e) {}
    });
    this.activeSources = [];
    this.currentFeed = "off";
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.15);
    }
  }

  getVolume() {
    return this.volume;
  }

  playFeed(feed: string) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.stopAll();
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.currentFeed = feed;
    
    if (feed === "lake") {
      // Wind / lake wave soundscape (filtered white noise modulated slowly)
      try {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);
        filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // slow wave period of ~8 seconds
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(160, this.ctx.currentTime); // sweep range

        const boosterGain = this.ctx.createGain();
        boosterGain.gain.setValueAtTime(1.8, this.ctx.currentTime); // boosted gain

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        noiseNode.connect(filter);
        filter.connect(boosterGain);
        boosterGain.connect(this.masterGain);

        lfo.start();
        noiseNode.start();
        
        this.activeSources.push(lfo, noiseNode);
      } catch (err) {
        console.error("Error creating wind wave soundscape:", err);
      }

    } else if (feed === "transit") {
      // Deep 55Hz (A1) electric motor/subway hum with detuned harmonics
      try {
        const osc1 = this.ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // subharmonic hum

        const osc2 = this.ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(55.3, this.ctx.currentTime); // detuned beats

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(130, this.ctx.currentTime);

        const boosterGain = this.ctx.createGain();
        boosterGain.gain.setValueAtTime(1.5, this.ctx.currentTime); // boosted transit hum

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(boosterGain);
        boosterGain.connect(this.masterGain);

        osc1.start();
        osc2.start();
        
        this.activeSources.push(osc1, osc2);
      } catch (err) {
        console.error("Error creating electric transit hum:", err);
      }

    } else if (feed === "solar") {
      // Solar grid inverter harmonic micro-drone
      try {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);
        filter.Q.setValueAtTime(12, this.ctx.currentTime);

        const modLfo = this.ctx.createOscillator();
        modLfo.frequency.setValueAtTime(0.3, this.ctx.currentTime);
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(25, this.ctx.currentTime);

        const boosterGain = this.ctx.createGain();
        boosterGain.gain.setValueAtTime(2.2, this.ctx.currentTime); // boosted drone

        modLfo.connect(modGain);
        modGain.connect(filter.frequency);
        osc.connect(filter);
        filter.connect(boosterGain);
        boosterGain.connect(this.masterGain);

        osc.start();
        modLfo.start();

        this.activeSources.push(osc, modLfo);
      } catch (err) {
        console.error("Error creating solar micro-drone:", err);
      }

    } else if (feed === "park") {
      // Synthesized forest biosphere / park chirps
      try {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        
        const chirpGain = this.ctx.createGain();
        chirpGain.gain.setValueAtTime(0, this.ctx.currentTime);

        const boosterGain = this.ctx.createGain();
        boosterGain.gain.setValueAtTime(1.8, this.ctx.currentTime); // boosted chirps

        osc.connect(chirpGain);
        chirpGain.connect(boosterGain);
        boosterGain.connect(this.masterGain);
        osc.start();

        let chirpInterval: any;
        const triggerChirp = () => {
          if (!this.ctx || this.currentFeed !== "park") return;
          const now = this.ctx.currentTime;
          
          // Generate a rapid frequency sweep representing a bird-like chirp
          osc.frequency.setValueAtTime(1400 + Math.random() * 300, now);
          osc.frequency.exponentialRampToValueAtTime(2500 + Math.random() * 600, now + 0.07);
          
          chirpGain.gain.setValueAtTime(0, now);
          chirpGain.gain.linearRampToValueAtTime(0.35, now + 0.01);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        };

        chirpInterval = setInterval(triggerChirp, 1500); // slightly more frequent chirps
        this.activeSources.push({
          stop: () => {
            clearInterval(chirpInterval);
            try { osc.stop(); } catch(e){}
          }
        });
      } catch (err) {
        console.error("Error creating park soundscape:", err);
      }
    }
  }

  getCurrentFeed() {
    return this.currentFeed;
  }
}

export const soundscapeEngine = new CitySoundscapeEngine();
