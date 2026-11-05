import { useEffect, useState } from "react";
import { hud } from "../content/copy.js";

export default function BootScreen({ unlocked, onEnter }) {
  const [pct, setPct] = useState(6);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let current = 6;
    let frame = 0;
    let stop = false;
    const finish = () => {
      if (stop) return;
      stop = true;
      setPct(100);
      setReady(true);
    };
    const tick = () => {
      current = Math.min(92, current + 1.6);
      setPct(Math.round(current));
      if (current < 92) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const timer = setTimeout(finish, 1800);
    document.fonts?.ready?.then(() => {
      if (current >= 70) finish();
    });
    return () => {
      stop = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="boot" role="dialog" aria-modal="true" aria-label={hud.loading} aria-busy={!ready}>
      <div className="boot-sun" aria-hidden="true" />
      <p className="display boot-title">{hud.loading}</p>
      <div className="boot-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="hint">{pct}%</p>
      {ready && unlocked === 0 && (
        <button type="button" className="btn primary" onClick={() => onEnter("start")}>
          {hud.enter}
        </button>
      )}
      {ready && unlocked > 0 && (
        <div className="boot-choices">
          <button type="button" className="btn primary" onClick={() => onEnter("resume")}>
            {hud.resume}
          </button>
          <button type="button" className="btn" onClick={() => onEnter("replay")}>
            {hud.fromSky}
          </button>
          <button type="button" className="btn" onClick={() => onEnter("reset")}>
            {hud.resetBoot}
          </button>
        </div>
      )}
    </div>
  );
}
