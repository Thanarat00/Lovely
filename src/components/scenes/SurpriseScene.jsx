import { useEffect, useState } from "react";
import { surprise as surpriseCopy } from "../../content/copy.js";
import { usePlay } from "../../play/PlayContext.jsx";
import { useFx } from "../ParticleField.jsx";
import SceneFrame from "../SceneFrame.jsx";
import Sunflower from "../Sunflower.jsx";

export default function SurpriseScene({ dispatch, onHome }) {
  const { burst } = useFx();
  const play = usePlay();
  const [playId, setPlayId] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const note = play.notes[noteIndex % play.notes.length];

  useEffect(() => {
    dispatch({ type: "PLAY_SURPRISE" });
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      burst(window.innerWidth / 2, window.innerHeight * 0.42, 32);
    }, 280);
    return () => clearTimeout(timer);
  }, [burst, playId]);

  function again() {
    setNoteIndex((current) => (current + 1) % play.notes.length);
    setPlayId((value) => value + 1);
  }

  return (
    <SceneFrame index={6} className="scene-surprise">
      <header className="scene-head">
        <h1 id="title-6" tabIndex={-1} className="display">
          {surpriseCopy.title}
        </h1>
        <p className="lede">{surpriseCopy.lede}</p>
      </header>
      <div className="gift" key={playId}>
        <div className="bouquet" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="rise" style={{ animationDelay: `${index * 0.16}s` }}>
              <Sunflower stage={4} delay={`${-index * 0.4}s`} />
            </span>
          ))}
        </div>
        <div className="present">
          <div className="lid" />
          <p className="note">{note}</p>
        </div>
      </div>
      <button type="button" className="btn" onClick={again}>
        {surpriseCopy.replay}
      </button>
      <p className="hint">กดแล้วได้คำปลอบใหม่ และดอกไม้บานอีกรอบ</p>
      <button type="button" className="btn primary" onClick={onHome}>
        {surpriseCopy.home}
      </button>
    </SceneFrame>
  );
}
