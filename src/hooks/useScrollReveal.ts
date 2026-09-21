import { useEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "../lib/smoothScroll";
import { usePrefersReducedMotion } from "../lib/hooks";
import { EASE_CINEMATIC } from "../animations/ease";

interface ScrollRevealOptions {
  from: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  delay?: number;
  start?: string;
  ease?: string;
}

/**
 * One-shot GSAP reveal, triggered when the element scrolls into view.
 * Use for choreographed entrances that need more than FadeIn's fixed
 * opacity/translateY (e.g. scale + rotationX on the floor-plan panel).
 */
export function useScrollReveal(target: RefObject<HTMLElement | null>, options: ScrollRevealOptions) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        options.from,
        {
          ...options.to,
          duration: options.duration ?? 1.1,
          delay: options.delay ?? 0,
          ease: options.ease ?? EASE_CINEMATIC,
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}
