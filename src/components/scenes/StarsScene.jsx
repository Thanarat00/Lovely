import { useState } from "react";
import { stars as starCopy } from "../../content/copy.js";
import { canAdvance } from "../../lib/progress.js";
import { Clouds, RainbowArt } from "../Art.jsx";
import { usePlay } from "../../play/PlayContext.jsx";
import NextButton from "../NextButton.jsx";
import { useFx } from "../ParticleField.jsx";
import SceneFrame from "../SceneFrame.jsx";

export default function StarsScene({ found, dispatch, onNext, progress }) {
  const { burst } = useFx();
  const play = usePlay();
  const [active, setActive] = useState(() => found.findIndex(Boolean));
  const count = found.filter(Boolean).length;
  const done = count === 5;

  function collect(index, event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextCount = count + (found[index] ? 0 : 1);
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, nextCount === 5 ? 34 : 14);
    setActive(index);
    if (!found[index]) dispatch({ type: "COLLECT_STAR", index });
  }

  const message = active >= 0 ? play.stars[active] : starCopy.lede;

  return (
    <SceneFrame
      index={2}
      className="scene-stars"
      art={
        <>
          <Clouds variant="dusk" />
          <RainbowArt lit={done} />
        </>
      }
    >
      <header className="scene-head">
        <h1 id="title-2" tabIndex={-1}>
          {starCopy.title}
        </h1>
        <p className="lede">{starCopy.lede}</p>
      </header>
      <ul className="star-field">
        {found.map((lit, index) => (
          <li key={play.stars[index]}>
            <button
              type="button"
              className={lit ? "star-btn is-lit" : "star-btn"}
              aria-pressed={lit}
              aria-label={`ดาวดวงที่ ${index + 1}`}
              onClick={(event) => collect(index, event)}
            >
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <path d="M32 4 L39 24 H60 L43 36 L49 56 L32 44 L15 56 L21 36 L4 24 H25 Z" fill="currentColor" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <p className="payoff">
        {message}
      </p>
      <p className="hint">
        {`${count} จาก 5`}
        {done ? ` ${starCopy.done}` : ""}
      </p>
      <NextButton id="stars" ready={canAdvance(progress, 2)} hint={starCopy.hint} onClick={onNext}>
        {starCopy.next}
      </NextButton>
    </SceneFrame>
  );
}
