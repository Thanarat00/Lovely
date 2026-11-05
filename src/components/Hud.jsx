import { useState } from "react";
import { hud, sceneNames } from "../content/copy.js";

export default function Hud({ scene, unlocked, onReplay, onReset, onGo }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <div className="hud">
        <span className="hud-spacer" />
        <details className="settings" key={scene} onToggle={(event) => { if (!event.currentTarget.open) setConfirm(false); }}>
          <summary className="hud-btn">{hud.settings}</summary>
          <div className="menu">
            <button type="button" className="btn" onClick={onReplay}>
              {hud.replay}
            </button>
            {confirm ? (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setConfirm(false);
                    onReset();
                  }}
                >
                  {hud.resetYes}
                </button>
                <button type="button" className="btn" onClick={() => setConfirm(false)}>
                  {hud.resetNo}
                </button>
              </>
            ) : (
              <button type="button" className="btn" onClick={() => setConfirm(true)}>
                {hud.reset}
              </button>
            )}
          </div>
        </details>
      </div>
      <nav className="dots" aria-label="ฉาก">
        {sceneNames.map((name, index) => (
          <button
            key={name}
            type="button"
            disabled={index > unlocked}
            aria-current={index === scene ? "true" : undefined}
            aria-label={name}
            onClick={() => onGo(index)}
          >
            <span className={index === scene ? "dot is-now" : "dot"} />
          </button>
        ))}
      </nav>
    </>
  );
}
