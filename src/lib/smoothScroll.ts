import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    ScrollTrigger.normalizeScroll(true);
    return () => {};
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

export function getLenis() {
  return lenis;
}

export function scrollToId(id: string) {
  let el = document.getElementById(id);
  if (!el) return;
  // A target that's hidden at the current breakpoint (e.g. a desktop-only
  // layer under a mobile carousel) has zero size, so scrolling to it lands
  // in the wrong place. Fall back to its nearest visible ancestor instead.
  if (el.offsetParent === null) {
    let ancestor: HTMLElement | null = el.parentElement;
    while (ancestor && ancestor.offsetParent === null) {
      ancestor = ancestor.parentElement;
    }
    el = ancestor ?? el;
  }
  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export { gsap, ScrollTrigger };
