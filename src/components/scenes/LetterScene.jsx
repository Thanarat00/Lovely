import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { letter as letterCopy } from "../../content/copy.js";
import { buildLetter } from "../../lib/buildLetter.js";
import { canAdvance } from "../../lib/progress.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { usePlay } from "../../play/PlayContext.jsx";
import { useFx } from "../ParticleField.jsx";
import NextButton from "../NextButton.jsx";
import SceneFrame from "../SceneFrame.jsx";
import { SealMark } from "../Sunflower.jsx";

export default function LetterScene({ dispatch, onNext, progress }) {
  const reduced = useReducedMotion();
  const play = usePlay();
  const { burst } = useFx();
  const [phase, setPhase] = useState("sealed");
  const layoutRef = useRef(null);
  const flapRef = useRef(null);
  const tiltRef = useRef(null);

  useLayoutEffect(() => {
    const flap = flapRef.current;
    const root = layoutRef.current;
    if (!flap || !root) return undefined;
    if (reduced) {
      gsap.set(flap, { rotateX: phase === "open" ? 180 : 0 });
      return undefined;
    }
    const tween = gsap.to(flap, {
      rotateX: phase === "open" ? 180 : 0,
      duration: 0.8,
      ease: "power2.inOut",
      transformOrigin: "50% 0%",
    });
    const lines = root.querySelectorAll(".letter-line");
    const textTween = phase === "open"
      ? gsap.from(lines, {
        opacity: 0,
        y: 10,
        stagger: 0.06,
        duration: 0.45,
        delay: 0.28,
        ease: "power2.out",
        onComplete: () => gsap.set(lines, { clearProps: "opacity,transform" }),
      })
      : null;
    return () => {
      tween.kill();
      textTween?.kill();
      gsap.set(lines, { clearProps: "opacity,transform" });
    };
  }, [phase, reduced]);

  function open() {
    if (phase === "open") return;
    const seal = layoutRef.current?.querySelector(".seal");
    if (seal) {
      const rect = seal.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    }
    dispatch({ type: "OPEN_LETTER" });
    setPhase("open");
  }

  function tilt(event) {
    if (phase !== "sealed" || reduced || event.pointerType === "touch") return;
    const node = tiltRef.current;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    node.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg)`;
  }

  function untilt() {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }

  return (
    <SceneFrame index={5} className={phase === "open" ? "scene-letter is-reading" : "scene-letter"}>
      <header className="scene-head">
        <h1 id="title-5" tabIndex={-1}>
          {letterCopy.title}
        </h1>
        <p className="lede">{letterCopy.lede}</p>
      </header>
      <div className={phase === "open" ? "letter-layout is-open" : "letter-layout"} ref={layoutRef}>
        <div className="tilt">
          <div className="tilt-target" ref={tiltRef} onPointerMove={tilt} onPointerLeave={untilt}>
            <div className="envelope">
              <div className="paper-peek" />
              <div className="envelope-pocket" />
              <div className="envelope-flap" ref={flapRef}>
                <div className="envelope-flap-face" />
              </div>
              <button type="button" className="seal" onClick={open} disabled={phase === "open"} aria-label="เปิดผนึกดอกทานตะวัน">
                <SealMark />
              </button>
            </div>
          </div>
        </div>
        {phase === "open" && (
          <article className="letter-sheet" aria-label={letterCopy.title}>
            <p className="letter-line greeting">ถึงเธอคนเก่ง 🌻</p>
            {buildLetter(progress, play.letter).map((text, index) => (
              <p key={index} className="letter-line">
                {text}
              </p>
            ))}
            <p className="letter-line sign">จากคนที่อยากเห็นเธอยิ้ม ♡</p>
          </article>
        )}
      </div>
      {phase === "sealed" ? (
        <button type="button" className="btn" onClick={open}>
          {letterCopy.open}
        </button>
      ) : (
        <button type="button" className="btn" onClick={() => setPhase("sealed")}>
          {letterCopy.close}
        </button>
      )}
      <NextButton id="letter" ready={canAdvance(progress, 5)} hint={letterCopy.hint} onClick={onNext}>
        {letterCopy.next}
      </NextButton>
    </SceneFrame>
  );
}
