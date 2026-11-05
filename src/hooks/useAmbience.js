import { useCallback, useEffect, useRef, useState } from "react";

function createEngine() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 720;
  filter.connect(master);

  const voices = [261.63, 329.63, 392, 523.25].map((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = index === 3 ? 0.018 : 0.03;
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    return osc;
  });

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * 0.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 380;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.02;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();

  return {
    async play() {
      if (ctx.state === "suspended") await ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0.35, now + 0.7);
    },
    mute() {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0, now + 0.35);
    },
    close() {
      voices.forEach((voice) => voice.stop());
      lfo.stop();
      noise.stop();
      ctx.close();
    },
  };
}

export function useAmbience() {
  const engine = useRef(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => () => engine.current?.close(), []);

  const toggle = useCallback(async () => {
    try {
      if (!engine.current) engine.current = createEngine();
      if (on) {
        engine.current.mute();
        setOn(false);
        return;
      }
      await engine.current.play();
      setOn(true);
      setError(false);
    } catch {
      setError(true);
      setOn(false);
    }
  }, [on]);

  return { on, error, toggle };
}
