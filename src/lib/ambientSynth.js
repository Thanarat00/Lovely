/**
 * Original, copyright-free background music generated with the Web Audio API.
 * Warm pad chords plus soft pentatonic "music box" notes. No audio files involved.
 */

const CHORDS = [
  [130.81, 196.0, 261.63, 329.63, 392.0], // C
  [110.0, 164.81, 220.0, 261.63, 329.63], // Am
  [87.31, 130.81, 174.61, 220.0, 261.63], // F
  [98.0, 146.83, 196.0, 246.94, 293.66], // G
];

const BELLS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
const CHORD_SECONDS = 7;
const GAIN = 1.6;

export function createAmbient() {
  let ctx = null;
  let master = null;
  let timers = [];
  let running = false;
  let chordIndex = 0;
  let level = 0.6;

  function ensure() {
    if (ctx) return true;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return false;
    ctx = new Context();
    master = ctx.createGain();
    master.gain.value = level * GAIN;
    // A gentle limiter keeps the louder mix from clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 6;
    master.connect(limiter).connect(ctx.destination);
    return true;
  }

  function pad(freq, start, length) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 8;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.13, start + 1.6);
    gain.gain.linearRampToValueAtTime(0.0001, start + length + 1.6);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + length + 1.8);
  }

  function bell() {
    const now = ctx.currentTime;
    const freq = BELLS[Math.floor(Math.random() * BELLS.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  function nextChord() {
    if (!running) return;
    if (ctx.state !== "running") {
      // Browser has not allowed sound yet; wait for the next tap instead of stacking chords.
      timers.push(setTimeout(nextChord, 400));
      return;
    }
    const now = ctx.currentTime;
    CHORDS[chordIndex % CHORDS.length].forEach((freq) => pad(freq, now, CHORD_SECONDS));
    chordIndex += 1;
    timers.push(setTimeout(nextChord, CHORD_SECONDS * 1000));
  }

  function nextBell() {
    if (!running) return;
    if (ctx.state !== "running") {
      timers.push(setTimeout(nextBell, 600));
      return;
    }
    if (Math.random() > 0.25) bell();
    timers.push(setTimeout(nextBell, 1400 + Math.random() * 2200));
  }

  return {
    /** Call inside a click so the browser lets sound start later. */
    prime() {
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
    },
    async start() {
      if (!ensure()) return false;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      if (running) return true;
      running = true;
      nextChord();
      timers.push(setTimeout(nextBell, 1800));
      return true;
    },
    stop() {
      running = false;
      timers.forEach(clearTimeout);
      timers = [];
      if (ctx && ctx.state === "running") ctx.suspend();
    },
    setVolume(value) {
      level = value;
      if (master) master.gain.setTargetAtTime(value * GAIN, ctx.currentTime, 0.05);
    },
  };
}
