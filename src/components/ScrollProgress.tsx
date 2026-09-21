import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/smoothScroll";
import "./ScrollProgress.css";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(barRef.current, { scaleY: self.progress });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-fill" />
    </div>
  );
}
