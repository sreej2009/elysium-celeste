import { useRef } from "react";
import livingA from "../assets/images/interior-bedroom-01.webp";
import bedroomA from "../assets/images/interior-bedroom-02.webp";
import diningA from "../assets/images/interior-dining-01.webp";
import FadeIn from "../components/FadeIn";
import { useParallax } from "../hooks/useParallax";
import "./MaterialStory.css";

export default function MaterialStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const livingImgRef = useRef<HTMLImageElement>(null);
  const bedroomImgRef = useRef<HTMLImageElement>(null);
  const diningImgRef = useRef<HTMLImageElement>(null);

  const scrollOpts = { trigger: sectionRef, start: "top bottom", end: "bottom top", scrub: 0.7 } as const;
  useParallax(orbitRef, { ...scrollOpts, rotate: [0, 6] });
  useParallax(livingImgRef, { ...scrollOpts, y: [-18, 18] });
  useParallax(bedroomImgRef, { ...scrollOpts, y: [26, -26] });
  useParallax(diningImgRef, { ...scrollOpts, y: [-14, 22] });

  return (
    <section id="materials" ref={sectionRef} className="materials section-pad">
      <div className="materials-composition">
        <div ref={orbitRef} className="materials-orbit" aria-hidden="true" />
        <FadeIn className="materials-head">
          <span className="eyebrow is-accent">Life Inside Celeste</span>
          <h2 className="materials-title">Designed around the way you live.</h2>
          <p className="materials-intro">
            Elysium Celeste is more than just a home. It is a place where life blossoms in its entirety.
          </p>
        </FadeIn>
        <FadeIn as="figure" className="materials-frame materials-living" delay={80}>
          <div className="materials-frame-clip">
            <img ref={livingImgRef} src={livingA} alt="Living room interior at Elysium Celeste" loading="lazy" />
          </div>
          <figcaption><span>01</span>Living</figcaption>
        </FadeIn>
        <FadeIn as="p" className="materials-note" delay={160}>
          Revel in the joy of celebration called life.
        </FadeIn>
        <FadeIn as="figure" className="materials-frame materials-bedroom" delay={100}>
          <div className="materials-frame-clip">
            <img ref={bedroomImgRef} src={bedroomA} alt="Bedroom interior at Elysium Celeste" loading="lazy" />
          </div>
          <figcaption>
            <span>02</span>Bedroom
            <p>Rest, uninterrupted &mdash; light, warmth, and quiet materiality.</p>
          </figcaption>
        </FadeIn>
        <FadeIn as="figure" className="materials-frame materials-dining" delay={180}>
          <div className="materials-frame-clip">
            <img ref={diningImgRef} src={diningA} alt="Dining space at Elysium Celeste" loading="lazy" />
          </div>
          <figcaption>
            <span>03</span>Dining
            <p>Every surface chosen for how it wears, not just how it looks.</p>
          </figcaption>
        </FadeIn>
      </div>
    </section>
  );
}

