import { useEffect, useRef } from "react";

export default function Cursor() {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const node = ref.current;
    const move = (event) => {
      const hot = Boolean(event.target.closest?.("button, a, summary"));
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) scale(${hot ? 1.3 : 1})`;
      document.documentElement.classList.add("has-cursor");
      node.classList.toggle("is-hot", hot);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
