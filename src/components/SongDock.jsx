import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { song } from "../content/copy.js";
import { createAmbient } from "../lib/ambientSynth.js";

const VOLUME_KEY = "sunflower-sky-volume";

function readVolume() {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    if (Number.isFinite(saved) && saved > 0 && saved <= 1) return saved;
  } catch {
    /* keep the default if storage is blocked */
  }
  return 0.6;
}

const SongDock = forwardRef(function SongDock({ hidden }, ref) {
  const audioRef = useRef(null);
  const synthRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [useSynth, setUseSynth] = useState(false);
  const [volume, setVolume] = useState(readVolume);

  function synth() {
    if (!synthRef.current) synthRef.current = createAmbient();
    return synthRef.current;
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    synthRef.current?.setVolume(volume);
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* the level still applies for this visit */
    }
  }, [volume]);

  useEffect(() => () => synthRef.current?.stop(), []);

  async function startSynth() {
    const engine = synth();
    engine.setVolume(volume);
    const ok = await engine.start();
    setPlaying(ok);
  }

  function start() {
    const level = volume > 0 ? volume : 0.6;
    if (level !== volume) setVolume(level);
    if (useSynth) {
      startSynth();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = level;
    audio.play().then(() => setPlaying(true)).catch(() => {
      if (audio.error) {
        setUseSynth(true);
        startSynth();
      } else {
        setPlaying(false);
      }
    });
  }

  useImperativeHandle(ref, () => ({ start }), [useSynth, volume]);

  function changeVolume(delta) {
    setVolume((current) => Math.min(1, Math.max(0, Math.round((current + delta) * 10) / 10)));
  }

  function toggle() {
    if (playing) {
      if (useSynth) synthRef.current?.stop();
      else audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    start();
  }

  const title = useSynth ? "เพลงเบา ๆ ของวันนี้" : song.title;
  const artist = useSynth ? "ทำขึ้นเพื่อเธอ" : song.artist;

  return (
    <section className="song-dock" data-hidden={hidden ? "true" : "false"} aria-hidden={hidden || undefined} aria-label={`${title} โดย ${artist}`}>
      <audio
        ref={audioRef}
        src={song.src}
        loop
        preload="auto"
        onError={() => setUseSynth(true)}
        onPause={() => !useSynth && setPlaying(false)}
        onPlay={() => !useSynth && setPlaying(true)}
      />
      <button type="button" className="song-toggle" aria-pressed={playing} onClick={toggle} tabIndex={hidden ? -1 : 0}>
        <span className="song-meta">
          <span className="song-kicker">{artist}</span>
          <strong>{title}</strong>
        </span>
        <span className="song-action">{playing ? "หยุด" : "เล่นเพลง"}</span>
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
