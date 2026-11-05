import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useStoryMotion(storyRef, enabled, unlocked, reduced, initialScene) {
  const started = useRef(false);

  useLayoutEffect(() => {
    if (!enabled || !storyRef.current) return undefined;
    const scroller = storyRef.current;

    if (!started.current) {
      started.current = true;
      const opening = scroller.querySelector(`#scene-${initialScene.current}`);
      opening?.scrollIntoView({ behavior: "auto", block: "start" });
    }

    const context = gsap.context(() => {
      if (!reduced) {
        gsap.utils.toArray(".cloud").forEach((cloud, index) => {
          gsap.to(cloud, {
            y: index % 2 === 0 ? -28 : 18,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: cloud.closest(".scene"),
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      }

      gsap.utils.toArray(".scene").forEach((scene) => {
        const index = Number(scene.dataset.index);
        const mark = () => {
          scroller.dispatchEvent(new CustomEvent("sceneactive", { bubbles: true, detail: index }));
        };
        ScrollTrigger.create({
          scroller,
          trigger: scene,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: mark,
          onEnterBack: mark,
        });
      });
    }, scroller);

    const refresh = () => ScrollTrigger.refresh();
    refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      context.revert();
    };
  }, [enabled, initialScene, reduced, storyRef, unlocked]);
}
