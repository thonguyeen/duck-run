import { RacerType } from "../types";

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playStartSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // 3 beeps sequence: 3... 2... 1... GO! (spaced 1 second apart)
  [0, 1, 2, 3].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    // First 3 beeps same pitch, last one (GO) higher
    osc.frequency.value = i < 3 ? 440 : 880; 
    
    const startTime = now + offset;
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
};

export const playAnimalSound = (type: RacerType) => {
  const ctx = initAudio();
  if (!ctx) return;
  
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'duck') {
      // Quack
      const filter = ctx.createBiquadFilter();
      osc.disconnect();
      osc.connect(filter);
      filter.connect(gain);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300 + Math.random() * 50, t);
      osc.frequency.linearRampToValueAtTime(200, t + 0.15);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(600, t + 0.15);
      filter.Q.value = 2;
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc.start(t);
      osc.stop(t + 0.2);

  } else if (type === 'horse') {
      // Neigh / Snort (Low pitch sawtooth w/ jitter)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(120, t + 0.3);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.3);

  } else if (type === 'rabbit' || type === 'squirrel') {
      // Squeak
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.05);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      
      osc.start(t);
      osc.stop(t + 0.1);
  } else if (type === 'ostrich') {
      // Low boom step
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      osc.start(t);
      osc.stop(t + 0.2);
  } else if (type === 'bee') {
      // Buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(180, t + 0.3);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.3);
  }
};

export const playFinishLineSound = () => {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.start(t);
    osc.stop(t + 0.5);
};

export const playWinSound = () => {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; 
    const duration = 0.15;
    
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const startTime = t + i * duration;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    });
};

export const playApplauseSound = () => {
    const ctx = initAudio();
    if (!ctx) return;

    // Create a buffer for white noise
    const bufferSize = 2 * ctx.sampleRate; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    // Create a filter to make it sound less like static and more like a crowd
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1; // Resonant peak

    // Play multiple instances with different envelopes
    for (let i = 0; i < 5; i++) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();

        // Varying start times
        const start = ctx.currentTime + Math.random() * 0.2;
        const duration = 1.5 + Math.random();

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.1); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration); // Decay

        source.start(start);
        source.stop(start + duration + 0.1);
    }
};