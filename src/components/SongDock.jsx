import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { song } from "../content/copy.js";
import { createAmbient } from "../lib/ambientSynth.js";

const VOLUME_KEY = "sunflower-sky-volume-v2";
const DEFAULT_VOLUME = 0.8;

function readVolume() {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    if (Number.isFinite(saved) && saved > 0 && saved <= 1) return saved;
  } catch {
    /* keep the default if storage is blocked */
  }
  return DEFAULT_VOLUME;
}

const SongDock = forwardRef(function SongDock({ hidden }, ref) {
  const synthRef = useRef(null);
  const wantPlay = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(readVolume);

  function synth() {
    if (!synthRef.current) synthRef.current = createAmbient();
    return synthRef.current;
  }

  useEffect(() => {
    synthRef.current?.setVolume(volume);
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* the level still applies for this visit */
    }
  }, [volume]);

  useEffect(() => () => synthRef.current?.stop(), []);

  // If the browser kept sound locked after the first tap, any later tap or key unlocks it.
  useEffect(() => {
    function unlock() {
      if (wantPlay.current) synthRef.current?.prime();
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  async function start() {
    const level = volume > 0 ? volume : DEFAULT_VOLUME;
    if (level !== volume) setVolume(level);
    wantPlay.current = true;
    const engine = synth();
    engine.prime();
    engine.setVolume(level);
    setPlaying(await engine.start());
  }

  useImperativeHandle(ref, () => ({ start }), [volume]);

  function changeVolume(delta) {
    setVolume((current) => Math.min(1, Math.max(0, Math.round((current + delta) * 10) / 10)));
  }

  function toggle() {
    if (playing) {
      wantPlay.current = false;
      synthRef.current?.stop();
      setPlaying(false);
      return;
    }
    start();
  }

  return (
    <section className="song-dock" data-hidden={hidden ? "true" : "false"} aria-hidden={hidden || undefined} aria-label={`${song.title} โดย ${song.artist}`}>
      <button type="button" className="song-toggle" aria-pressed={playing} onClick={toggle} tabIndex={hidden ? -1 : 0}>
        <span className="song-meta">
          <span className="song-kicker">{song.artist}</span>
          <strong>{song.title}</strong>
        </span>
        <span className="song-action">
          {playing && (
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
          {playing ? "หยุด" : "เล่นเพลง"}
        </span>
      </button>
      <div className="song-volume">
        <button type="button" onClick={() => changeVolume(-0.1)} disabled={hidden || volume <= 0} aria-label="ลดเสียง" tabIndex={hidden ? -1 : 0}>
          เบา
        </button>
        <span aria-live="polite">{Math.round(volume * 100)}</span>
        <button type="button" onClick={() => changeVolume(0.1)} disabled={hidden || volume >= 1} aria-label="เพิ่มเสียง" tabIndex={hidden ? -1 : 0}>
          ดัง
        </button>
      </div>
    </section>
  );
});

export default SongDock;
