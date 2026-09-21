import { useEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "../lib/smoothScroll";
import { usePrefersReducedMotion, useMediaQuery } from "../lib/hooks";

interface ParallaxOptions {
  /** Element whose scroll position drives the effect. Defaults to the target ref. */
  trigger?: RefObject<HTMLElement | null>;
  y?: [number, number];
  yPercent?: [number, number];
  scale?: [number, number];
  rotate?: [number, number];
  start?: string;
  end?: string;
  scrub?: number | boolean;
  /** Skip the effect below this viewport width (parallax reads as noise on small screens). */
  minWidth?: number;
}

/**
 * Scroll-scrubbed parallax for a single element. Restrained by design: callers
 * pass small [from, to] ranges (a handful of px / a few percent), not dramatic
 * moves. No-ops under prefers-reduced-motion or below `minWidth`.
 */
export function useParallax(target: RefObject<HTMLElement | null>, options: ParallaxOptions) {
  const reducedMotion = usePrefersReducedMotion();
  const isNarrow = useMediaQuery(`(max-width: ${(options.minWidth ?? 900) - 1}px)`);

  useEffect(() => {
    const el = target.current;
    if (!el || reducedMotion || isNarrow) return;

    const triggerEl = options.trigger?.current ?? el;
    const vars: gsap.TweenVars = {
      ease: "none",
      scrollTrigger: {
        trigger: triggerEl,
        start: options.start ?? "top bottom",
        end: options.end ?? "bottom top",
        scrub: options.scrub ?? 0.6,
      },
    };

    if (options.y) vars.y = options.y[1];
    if (options.yPercent) vars.yPercent = options.yPercent[1];
    if (options.scale) vars.scale = options.scale[1];
    if (options.rotate) vars.rotate = options.rotate[1];

    const fromVars: gsap.TweenVars = {};
    if (options.y) fromVars.y = options.y[0];
    if (options.yPercent) fromVars.yPercent = options.yPercent[0];
    if (options.scale) fromVars.scale = options.scale[0];
    if (options.rotate) fromVars.rotate = options.rotate[0];

    const ctx = gsap.context(() => {
      gsap.fromTo(el, fromVars, vars);
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, isNarrow]);
}
