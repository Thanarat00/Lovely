import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

export default function CyclingLine({ lines, start = 0, interval = 5200, className = "lede" }) {
  const reduced = useReducedMotion();
  const count = lines.length;
  const [index, setIndex] = useState(() => ((start % count) + count) % count);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (count < 2) return undefined;
    let fade = 0;
    const tick = window.setInterval(() => {
      if (reduced) {
        setIndex((current) => (current + 1) % count);
        return;
      }
      setVisible(false);
      fade = window.setTimeout(() => {
        setIndex((current) => (current + 1) % count);
        setVisible(true);
      }, 420);
    }, interval);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(fade);
    };
  }, [count, interval, reduced]);

  return (
    <p className={`${className} cycle${visible ? "" : " is-dim"}`}>
      {lines[index]}
    </p>
  );
}
