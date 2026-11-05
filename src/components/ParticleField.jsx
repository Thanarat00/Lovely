import { createContext, useContext, useEffect, useMemo, useRef } from "react";

const FxContext = createContext({ burst() {} });
const COLORS = ["#F6C94C", "#F6B7C8", "#FFF2BD", "#CDB8F5", "#BBDDB8"];

export function useFx() {
  return useContext(FxContext);
}

function spawnPetal(width, height, anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -20,
    r: 4 + Math.random() * 5,
    speed: 0.28 + Math.random() * 0.55,
    rot: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.02,
    sway: Math.random() * Math.PI * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export function ParticleProvider({ scene, reduced, children }) {
  const bursts = useRef([]);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const api = useMemo(
    () => ({
      burst(x, y, count = 16) {
        bursts.current.push({ x, y, count });
      },
    }),
    [],
  );

  return (
    <FxContext.Provider value={api}>
      {children}
      <ParticleCanvas bursts={bursts} sceneRef={sceneRef} reduced={reduced} />
    </FxContext.Provider>
  );
}

function ParticleCanvas({ bursts, sceneRef, reduced }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const count = reduced ? 0 : coarse ? 14 : 30;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let wind = 0;
    let running = true;
    let frame = 0;
    let star = null;
    const petals = [];
    const sparks = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    for (let index = 0; index < count; index += 1) petals.push(spawnPetal(width, height, true));

    const onMove = (event) => {
      wind = (event.clientX / Math.max(width, 1) - 0.5) * 0.7;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(loop);
    };

    const loop = () => {
      if (!running) return;
      frame = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, width, height);

      while (bursts.current.length && sparks.length < 90) {
        const burst = bursts.current.pop();
        const amount = Math.min(burst.count, 40);
        for (let index = 0; index < amount; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 0.8 + Math.random() * 2.3;
          sparks.push({
            x: burst.x,
            y: burst.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 0.5,
            life: 1,
            r: 2 + Math.random() * 2.4,
            color: COLORS[index % COLORS.length],
          });
        }
      }

      if (!reduced) {
        petals.forEach((petal) => {
          petal.sway += 0.01;
          petal.y += petal.speed;
          petal.x += Math.sin(petal.sway) * 0.35 + wind;
          petal.rot += petal.spin;
          if (petal.y > height + 16) {
            petal.y = -16;
            petal.x = Math.random() * width;
          }
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate(petal.rot);
          ctx.fillStyle = petal.color;
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.ellipse(0, 0, petal.r, petal.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        const scene = sceneRef.current;
        if ((scene === 0 || scene === 2) && !star && Math.random() < 0.004) {
          star = { x: Math.random() * width * 0.7, y: Math.random() * height * 0.35, life: 1 };
        }
        if (star) {
          star.x += 6;
          star.y += 2.4;
          star.life -= 0.02;
          ctx.strokeStyle = `rgba(255, 250, 240, ${Math.max(star.life, 0)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - 28, star.y - 10);
          ctx.stroke();
          if (star.life <= 0) star = null;
        }
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.035;
        spark.life -= 0.02;
        if (spark.life <= 0) {
          sparks.splice(index, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(spark.life, 0);
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.ellipse(spark.x, spark.y, spark.r, spark.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bursts, reduced, sceneRef]);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
