import { useRef } from "react";
import { secrets, sky } from "../../content/copy.js";
import { Butterfly, Clouds, Hill, RainbowArt, SunButton } from "../Art.jsx";
import { usePlay } from "../../play/PlayContext.jsx";
import SceneFrame from "../SceneFrame.jsx";

export default function SkyScene({ onNext, onSecret }) {
  const taps = useRef(0);
  const play = usePlay();

  return (
    <SceneFrame
      index={0}
      className="scene-sky"
      art={
        <>
          <SunButton
            onClick={() => {
              taps.current += 1;
              if (taps.current === 5) onSecret(secrets.sun);
            }}
          />
          <Clouds />
          <RainbowArt />
          <Butterfly
            className="butterfly-a"
            onClick={() => onSecret(secrets.butterfly)}
          />
          <Hill />
        </>
      }
    >
      <div className="sky-copy">
        <h1 id="title-0" tabIndex={-1} className="display sky-reveal">
          {sky.title}
        </h1>
        <p className="lede">{play.sky}</p>
        <button type="button" className="btn primary sky-reveal" onClick={onNext}>
          {sky.cta}
        </button>
      </div>
    </SceneFrame>
  );
}
