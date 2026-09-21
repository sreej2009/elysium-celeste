import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { gsap } from "../lib/smoothScroll";
import { usePrefersReducedMotion } from "../lib/hooks";
import { EASE_CINEMATIC } from "../animations/ease";

interface LineRevealProps {
  lines: string[];
  as?: ElementType;
  id?: string;
  className?: string;
  lineClassName?: string;
  /** Stagger between lines, in seconds. */
  stagger?: number;
  delay?: number;
  start?: string;
}

/**
 * Line-by-line reveal for major display headings (overflow:hidden + translateY).
 * GSAP owns the transform exclusively from a clean baseline (no CSS-authored
 * translateY on the inner span) to avoid yPercent stacking on top of a
 * resolved-matrix baseline from CSS.
 */
export default function LineReveal({
  lines,
  as: Tag = "h2",
  id,
  className = "",
  lineClassName = "",
  stagger = 0.08,
  delay = 0,
  start = "top 85%",
}: LineRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const lineEls = el.querySelectorAll<HTMLElement>(".line-reveal-inner");

    if (reducedMotion) {
      gsap.set(lineEls, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(lineEls, { yPercent: 110, opacity: 0 });
      gsap.to(lineEls, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: EASE_CINEMATIC,
        stagger,
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const Comp = Tag as React.ElementType;

  return (
    <Comp ref={containerRef} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="line-reveal-row" style={{ display: "block", overflow: "hidden" }}>
          <span className={`line-reveal-inner ${lineClassName}`} style={{ display: "block" }}>
            {line}
          </span>
        </span>
      ))}
    </Comp>
  );
}
