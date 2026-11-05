import { useEffect, useRef, useState } from "react";
import { moods as moodCopy } from "../../content/copy.js";
import { canAdvance } from "../../lib/progress.js";
import { Clouds, Rain } from "../Art.jsx";
import { usePlay } from "../../play/PlayContext.jsx";
import NextButton from "../NextButton.jsx";
import { useFx } from "../ParticleField.jsx";
import SceneFrame from "../SceneFrame.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

export default function MoodScene({ mood, dispatch, onNext, progress }) {
  const reduced = useReducedMotion();
  const { burst } = useFx();
  const play = usePlay();
  const [windy, setWindy] = useState(false);
  const timer = useRef(null);
  const chosen = moodCopy.options.find((item) => item.id === mood);

  useEffect(() => () => clearTimeout(timer.current), []);

  function choose(option, event) {
    dispatch({ type: "SET_MOOD", mood: option.id });
    if (option.id === "stressed" && !reduced) {
      setWindy(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setWindy(false), 1600);
    } else {
      setWindy(false);
    }
    if (option.id === "happy") {
      const rect = event.currentTarget.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26);
    }
  }

  return (
    <SceneFrame
      index={4}
      className={`scene-mood${windy ? " is-windy" : ""}`}
      data-mood={mood || "none"}
      art={
        <>
          <Clouds variant={mood === "stressed" ? "dusk" : "day"} />
          {mood === "sad" && !reduced ? <Rain /> : null}
        </>
      }
    >
      <header className="scene-head">
        <h1 id="title-4" tabIndex={-1}>
          {moodCopy.title}
        </h1>
        <p className="lede">{moodCopy.lede}</p>
      </header>
      <div className="mood-grid">
        {moodCopy.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="mood-btn"
            aria-pressed={mood === option.id}
            onClick={(event) => choose(option, event)}
          >
            <span className="mood-emoji" aria-hidden="true">
              {option.emoji}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <p className="payoff">
        {chosen ? play.moods[chosen.id] : "ไม่มีคำตอบที่ผิดตรงนี้"}
      </p>
      <NextButton id="mood" ready={canAdvance(progress, 4)} hint={moodCopy.hint} onClick={onNext}>
        {moodCopy.next}
      </NextButton>
    </SceneFrame>
  );
}
