import { useCallback, useEffect, useRef, useState } from "react";
import { hud } from "./content/copy.js";
import BootScreen from "./components/BootScreen.jsx";
import Cursor from "./components/Cursor.jsx";
import PageTurn from "./components/PageTurn.jsx";
import SongDock from "./components/SongDock.jsx";
import Guard from "./components/Guard.jsx";
import Hud from "./components/Hud.jsx";
import { ParticleProvider } from "./components/ParticleField.jsx";
import GardenScene from "./components/scenes/GardenScene.jsx";
import LetterScene from "./components/scenes/LetterScene.jsx";
import MoodScene from "./components/scenes/MoodScene.jsx";
import RainbowScene from "./components/scenes/RainbowScene.jsx";
import SkyScene from "./components/scenes/SkyScene.jsx";
import StarsScene from "./components/scenes/StarsScene.jsx";
import SurpriseScene from "./components/scenes/SurpriseScene.jsx";
import { useProgress } from "./hooks/useProgress.js";
import { useReducedMotion } from "./hooks/useReducedMotion.js";
import { canAdvance } from "./lib/progress.js";
import { rollPlay } from "./lib/rollPlay.js";
import { PlayProvider } from "./play/PlayContext.jsx";

export default function App() {
  const [state, dispatch] = useProgress();
  const reduced = useReducedMotion();
  const [booted, setBooted] = useState(false);
  const [turning, setTurning] = useState(false);
  const [toast, setToast] = useState("");
  const [play, setPlay] = useState(rollPlay);
  const entered = useRef(false);
  const stateRef = useRef(state);
  const toastTimer = useRef(null);
  const turnTimer = useRef(null);
  const songRef = useRef(null);
  stateRef.current = state;

  const show = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  const travel = useCallback((action) => {
    const run = () => dispatch(action);
    window.clearTimeout(turnTimer.current);
    if (reduced) {
      run();
      return;
    }
    setTurning(true);
    turnTimer.current = window.setTimeout(() => {
      run();
      window.setTimeout(() => setTurning(false), 520);
    }, 420);
  }, [dispatch, reduced]);

  const go = useCallback((index) => {
    if (index === stateRef.current.scene) return;
    travel({ type: "GO", scene: index });
  }, [travel]);

  const enter = useCallback((mode) => {
    if (entered.current) return;
    entered.current = true;
    if (mode === "replay") {
      dispatch({ type: "REPLAY" });
      setPlay(rollPlay());
    }
    if (mode === "reset") {
      dispatch({ type: "RESET" });
      setPlay(rollPlay());
    }
    setBooted(true);
    songRef.current?.start();
  }, [dispatch]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (event.target.closest("button, a, input, textarea, summary")) return;
      const current = stateRef.current;
      if (event.key === "ArrowRight") {
        const next = current.scene + 1;
        if (next <= current.unlocked || canAdvance(current, current.scene)) go(next);
        return;
      }
      if (current.scene > 0) go(current.scene - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!booted) return;
    document.getElementById(`title-${state.scene}`)?.focus({ preventScroll: true });
  }, [booted, state.scene]);

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(turnTimer.current);
  }, []);

  return (
    <div className="world" data-motion={reduced ? "reduce" : "full"} data-scene={state.scene}>
      <PageTurn active={turning} />
      <a className="skip" href="#scene-0">{hud.skip}</a>
      <ParticleProvider scene={state.scene} reduced={reduced}>
        <PlayProvider play={play}>
        <Guard>
          <main id="story" key={state.scene} inert={booted ? undefined : true}>
            {state.scene === 0 && <SkyScene onNext={() => go(1)} onSecret={show} />}
            {state.scene === 1 && (
              <GardenScene
                step={state.gardenStep}
                progress={state}
                dispatch={dispatch}
                onNext={() => go(2)}
                onSecret={show}
              />
            )}
            {state.scene === 2 && (
              <StarsScene found={state.stars} progress={state} dispatch={dispatch} onNext={() => go(3)} />
            )}
            {state.scene === 3 && (
              <RainbowScene selected={state.bands} progress={state} dispatch={dispatch} onNext={() => go(4)} />
            )}
            {state.scene === 4 && (
              <MoodScene mood={state.mood} progress={state} dispatch={dispatch} onNext={() => go(5)} />
            )}
            {state.scene === 5 && (
              <LetterScene progress={state} dispatch={dispatch} onNext={() => go(6)} />
            )}
            {state.scene === 6 && <SurpriseScene
              dispatch={dispatch}
              onHome={() => {
                window.setTimeout(() => setPlay(rollPlay()), 420);
                travel({ type: "RESET" });
              }}
            />}
          </main>
        </Guard>
        {booted && (
          <Hud
            scene={state.scene}
            unlocked={state.unlocked}
            onReplay={() => {
              setPlay(rollPlay());
              travel({ type: "REPLAY" });
            }}
            onReset={() => {
              setPlay(rollPlay());
              travel({ type: "RESET" });
            }}
            onGo={go}
          />
        )}
        <SongDock ref={songRef} hidden={!booted} />
        {toast && (
          <p className="toast" role="status">
            {toast}
          </p>
        )}
        </PlayProvider>
      </ParticleProvider>
      {!booted && <BootScreen unlocked={state.unlocked} onEnter={enter} />}
      <Cursor />
    </div>
  );
}
