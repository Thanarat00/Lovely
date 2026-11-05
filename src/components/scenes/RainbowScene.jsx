import { useState } from "react";
import { rainbow as rainbowCopy } from "../../content/copy.js";
import { canAdvance } from "../../lib/progress.js";
import { Clouds } from "../Art.jsx";
import { usePlay } from "../../play/PlayContext.jsx";
import NextButton from "../NextButton.jsx";
import { useFx } from "../ParticleField.jsx";
import SceneFrame from "../SceneFrame.jsx";

export default function RainbowScene({ selected, dispatch, onNext, progress }) {
  const { burst } = useFx();
  const play = usePlay();
  const [active, setActive] = useState(() => selected.findIndex(Boolean));
  const current = active >= 0 ? rainbowCopy.bands[active] : null;

  function choose(index, event) {
    const rect = event.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    setActive(index);
    if (!selected[index]) dispatch({ type: "SELECT_BAND", index });
  }

  return (
    <SceneFrame
      index={3}
      className="scene-rainbow"
      style={{ "--glow": current?.color || "#d7f0ff" }}
      art={<Clouds />}
    >
      <header className="scene-head">
        <h1 id="title-3" tabIndex={-1}>
          {rainbowCopy.title}
        </h1>
        <p className="lede">{rainbowCopy.lede}</p>
      </header>
      <div className="band-stack" role="group" aria-label={rainbowCopy.title}>
        {rainbowCopy.bands.map((band, index) => (
          <button
            key={band.name}
            type="button"
            className={selected[index] ? "band is-on" : "band"}
            style={{ background: band.color, width: `${100 - index * 8}%` }}
            aria-pressed={selected[index]}
            onClick={(event) => choose(index, event)}
          >
            {band.name}
          </button>
        ))}
      </div>
      <p className="payoff">
        {active >= 0 ? play.rainbow[active] : "เลือกสีที่อยากให้วันนี้เบาลง"}
      </p>
      <NextButton id="rainbow" ready={canAdvance(progress, 3)} hint={rainbowCopy.hint} onClick={onNext}>
        {rainbowCopy.next}
      </NextButton>
    </SceneFrame>
  );
}
