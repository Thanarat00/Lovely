/**
 * Original, copyright-free solo piano generated with the Web Audio API.
 * A short looping phrase written for this site. No audio files, no vocals.
 */

const BPM = 69;
const EIGHTH = 60 / BPM / 2;
const LOOP_STEPS = 64;

const PITCH = {
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
};

// step is an eighth note inside an 8-bar loop. length is in eighth notes.
const SCORE = [
  note(0, "C3", 8, 0.34),
  note(0, "E3", 8, 0.28),
  note(0, "G3", 8, 0.24),
  note(0, "E4", 4, 0.72),
  note(4, "G4", 4, 0.66),

  note(8, "A2", 8, 0.32),
  note(8, "C3", 8, 0.26),
  note(8, "E3", 8, 0.22),
  note(8, "A4", 3, 0.7),
  note(11, "G4", 1, 0.48),
  note(12, "E4", 4, 0.64),

  note(16, "F2", 8, 0.32),
  note(16, "A2", 8, 0.26),
  note(16, "C3", 8, 0.22),
  note(16, "D4", 2, 0.58),
  note(18, "E4", 2, 0.6),
  note(20, "G4", 4, 0.68),

  note(24, "G2", 8, 0.34),
  note(24, "B2", 8, 0.26),
  note(24, "D3", 8, 0.22),
  note(26, "F4", 2, 0.5),
  note(28, "E4", 2, 0.56),
  note(30, "D4", 2, 0.5),

  note(32, "C3", 8, 0.34),
  note(32, "E3", 8, 0.28),
  note(32, "G3", 8, 0.24),
  note(32, "C4", 4, 0.66),
  note(36, "E4", 4, 0.64),

  note(40, "A2", 8, 0.32),
  note(40, "C3", 8, 0.26),
  note(40, "E3", 8, 0.22),
  note(40, "G4", 2, 0.62),
  note(42, "A4", 2, 0.66),
  note(44, "C5", 3, 0.7),
  note(47, "A4", 1, 0.46),

  note(48, "F2", 8, 0.3),
  note(48, "A2", 8, 0.24),
  note(48, "C3", 8, 0.2),
  note(48, "G4", 4, 0.64),
  note(52, "E4", 2, 0.56),
  note(54, "D4", 2, 0.52),

  note(56, "G2", 8, 0.32),
  note(56, "B2", 8, 0.24),
  note(56, "D3", 8, 0.2),
  note(56, "E4", 2, 0.58),
  note(58, "D4", 2, 0.52),
  note(60, "C4", 4, 0.7),
];

function note(step, name, length, velocity) {
  return { step, freq: PITCH[name], length, velocity };
}

const PARTIALS = [
  [1, 1],
  [2.002, 0.42],
  [3.006, 0.2],
  [4.012, 0.1],
  [5.02, 0.05],
];

const GAIN = 1.45;

export function createAmbient() {
  let ctx = null;
  let master = null;
  let noise = null;
  let timer = 0;
  let running = false;
  let step = 0;
  let nextTime = 0;
  let level = 0.8;

  function ensure() {
    if (ctx) return true;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return false;
    ctx = new Context();
    master = ctx.createGain();
    master.gain.value = level * GAIN;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 8;
    limiter.ratio.value = 4;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.22;
    master.connect(limiter).connect(ctx.destination);

    const seconds = 0.08;
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return true;
  }

  function strike(freq, time, beats, velocity) {
    const decay = Math.min(3.4, Math.max(0.7, beats * EIGHTH * 1.35) * (freq > 500 ? 0.75 : 1));
    PARTIALS.forEach(([ratio, amp]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * ratio, time);
      const peak = Math.max(0.0002, velocity * amp * 0.28);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(peak * 0.42, time + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      osc.connect(gain).connect(master);
      osc.start(time);
      osc.stop(time + decay + 0.02);
    });

    const hammer = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const hammerGain = ctx.createGain();
    hammer.buffer = noise;
    filter.type = "highpass";
    filter.frequency.value = 1400;
    hammerGain.gain.setValueAtTime(velocity * 0.045, time);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
    hammer.connect(filter).connect(hammerGain).connect(master);
    hammer.start(time);
    hammer.stop(time + 0.04);
  }

  function schedule(index, time) {
    SCORE.forEach((event) => {
      if (event.step === index) strike(event.freq, time, event.length, event.velocity);
    });
  }

  function tick() {
    if (!running) return;
    if (!ctx || ctx.state !== "running") {
      timer = window.setTimeout(tick, 250);
      return;
    }
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.25) {
      schedule(step, nextTime);
      step = (step + 1) % LOOP_STEPS;
      nextTime += EIGHTH;
    }
    timer = window.setTimeout(tick, 60);
  }

  return {
    /** Call inside a tap so the browser allows sound. */
    prime() {
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
    },
    async start() {
      if (!ensure()) return false;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      if (running) return true;
      running = true;
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      tick();
      return true;
    },
    stop() {
      running = false;
      window.clearTimeout(timer);
      timer = 0;
      if (ctx && ctx.state === "running") ctx.suspend();
    },
    setVolume(value) {
      level = value;
      if (master) master.gain.setTargetAtTime(value * GAIN, ctx.currentTime, 0.05);
    },
  };
}
