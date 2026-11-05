import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { garden, secrets } from "../../content/copy.js";
import { canAdvance } from "../../lib/progress.js";
import { Butterfly, Clouds, Hill, Pebble, SunButton } from "../Art.jsx";
import { usePlay } from "../../play/PlayContext.jsx";
import NextButton from "../NextButton.jsx";
import SceneFrame from "../SceneFrame.jsx";
import Sunflower from "../Sunflower.jsx";
import { useFx } from "../ParticleField.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

const FIELD = [
  { left: "1%", width: 78, delay: "-0.5s" },
  { left: "14%", width: 96, delay: "-1.4s" },
  { left: "70%", width: 92, delay: "-2.1s" },
  { left: "84%", width: 72, delay: "-0.8s" },
];

export default function GardenScene({ step, dispatch, onNext, onSecret, progress }) {
  const reduced = useReducedMotion();
  const { burst } = useFx();
  const play = usePlay();
  const pebbleTaps = useRef(0);
  const bloomed = useRef(false);

  useEffect(() => {
    if (step < 1 || step >= 4) return undefined;
    const next = step === 1 ? "SUN" : step === 2 ? "WATER" : "BLOOM";
    const timer = setTimeout(() => dispatch({ type: next }), reduced ? 0 : 700);
    return () => clearTimeout(timer);
  }, [dispatch, reduced, step]);

  useLayoutEffect(() => {
    if (step !== 4 || reduced) return undefined;
    const plant = document.querySelector("#scene-1 .hero-btn .plant-scale");
    if (!plant) return undefined;
    const tween = gsap.fromTo(
      plant,
      { scale: 0.86 },
      { scale: 1, duration: 0.85, ease: "back.out(1.15)", transformOrigin: "50% 100%" },
    );
    return () => tween.kill();
  }, [reduced, step]);

  useEffect(() => {
    if (step !== 4 || bloomed.current) return;
    bloomed.current = true;
    burst(window.innerWidth / 2, window.innerHeight * 0.48, 30);
  }, [burst, step]);

  function grow(action, event) {
    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
    }
    if (step === 0 && action === "PLANT") dispatch({ type: "PLANT" });
    if (step === 1 && action === "SUN") dispatch({ type: "SUN" });
    if (step === 2 && action === "WATER") dispatch({ type: "WATER" });
    if (step >= 4) burst(window.innerWidth / 2, window.innerHeight * 0.46, 16);
  }

  return (
    <SceneFrame
      index={1}
      className="scene-garden"
      data-grow={step}
      art={
        <>
          <SunButton onClick={() => onSecret(secrets.sun)} />
          <Clouds />
          <div className="sunbeam" />
          <Butterfly className="butterfly-b" onClick={() => onSecret(secrets.butterfly)} />
          <Hill />
          <Pebble
            onClick={() => {
              pebbleTaps.current += 1;
              if (pebbleTaps.current === 3) onSecret(secrets.pebble);
            }}
          />
        </>
      }
    >
      <header className="scene-head">
        <h1 id="title-1" tabIndex={-1}>
          {garden.title}
        </h1>
        <p className="lede">{garden.lede}</p>
      </header>
      <div className="field">
        {FIELD.map((flower) => (
          <button
            key={flower.left}
            type="button"
            className="field-flower"
            style={{ left: flower.left, width: flower.width }}
            aria-label="ดอกทานตะวันในสวน"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              burst(rect.left + rect.width / 2, rect.top + 20, 12);
            }}
          >
            <Sunflower stage={4} delay={flower.delay} />
          </button>
        ))}
        <button type="button" className="hero-btn" aria-label="ดอกทานตะวันที่กำลังปลูก" onClick={(event) => grow(
          step === 0 ? "PLANT" : step === 1 ? "SUN" : "WATER",
          event,
        )}>
          <Sunflower stage={step} />
          <span className="drops" aria-hidden="true">
            <i /><i /><i />
          </span>
        </button>
      </div>
      {step === 0 && (
        <button type="button" className="btn primary" onClick={(event) => grow("PLANT", event)}>
          {garden.start}
        </button>
      )}
      {step > 0 && step < 4 && <p className="hint">{play.bloom}</p>}
      {step >= 4 && <p className="payoff">{play.garden}</p>}
      <NextButton id="garden" ready={canAdvance(progress, 1)} hint={garden.hint} onClick={onNext}>
        {garden.next}
      </NextButton>
    </SceneFrame>
  );
}
