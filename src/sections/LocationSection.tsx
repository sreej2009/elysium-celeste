// Location image supplied by the user.
import { useRef } from "react";
import rsPuramClockTower from "../assets/images/rs-puram-tower.png";
import buildingNight from "../assets/images/building-night.webp";
import FadeIn from "../components/FadeIn";
import { scrollToId } from "../lib/smoothScroll";
import { CONTACT, LOCATION_LANDMARKS } from "../data/content";
import { useParallax } from "../hooks/useParallax";
import "./LocationSection.css";

export default function LocationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useParallax(mainImageRef, {
    trigger: sectionRef,
    scale: [1.12, 1],
    start: "top bottom",
    end: "center center",
    scrub: 0.7,
  });
  useParallax(orbitRef, {
    trigger: sectionRef,
    rotate: [0, 8],
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  });

  return (
    <section id="location" ref={sectionRef} className="location section-pad" aria-labelledby="location-title">
      <div className="grid-12 location-grid">
        <div ref={orbitRef} className="location-orbit" aria-hidden="true" />

        <div className="location-copy-col">
          <FadeIn className="location-heading">
            <span className="eyebrow is-accent">The Location</span>
            <h2 id="location-title" className="location-title">R.S. Puram.</h2>
            <span className="location-subtitle">The Heart of Coimbatore</span>
          </FadeIn>
          {/* Mobile only: the same "vibrant neighbourhood" line as the desktop
              figcaption below, just surfaced near the heading instead of
              overlaid on the image (hidden on desktop via CSS). */}
          <div className="location-mobile-blurb" aria-hidden="true">
            <span>A vibrant<br />neighbourhood<br />that keeps you<br />close to<br />everything</span>
          </div>
          <FadeIn as="p" className="location-copy" delay={80}>
            Elysium Celeste is perfectly nestled at R.S. Puram, just off Mettupalayam Road, at
            the heart of the city &mdash; one of the most sought-after locations in Coimbatore.
            All the major educational institutions, hospitals, malls and recreational clubs are
            around the corner.
          </FadeIn>
          <button className="edge-link location-explore" onClick={() => scrollToId("gallery")}>
            <span className="location-explore-label-desktop">Explore Celeste</span>
            <span className="location-explore-label-mobile">Explore the neighbourhood</span>
            <span className="edge-link-arrow" aria-hidden="true">&#8594;</span>
          </button>
        </div>

        <div className="location-visual">
          <FadeIn as="figure" className="location-main-image" delay={100}>
            <img
              ref={mainImageRef}
              src={rsPuramClockTower}
              alt="Clock Tower on D.B. Road in R.S. Puram, Coimbatore"
              loading="lazy"
            />
            <figcaption>
              A vibrant<br />
              neighbourhood<br />
              that keeps you<br />
              close to<br />
              everything.
            </figcaption>
            {/* Mobile only: small in-image location marker, hidden on desktop. */}
            <span className="location-image-pin" aria-hidden="true">
              <i />
              <span>R.S. Puram<br />Coimbatore</span>
            </span>
          </FadeIn>
          <FadeIn as="figure" className="location-sub-image" delay={180}>
            <div className="location-sub-image-frame">
              <img src={buildingNight} alt="Elysium Celeste at night in R.S. Puram" loading="lazy" />
            </div>
            <figcaption>Elysium Celeste<span>R.S. Puram</span></figcaption>
          </FadeIn>
        </div>

        <FadeIn className="location-side" delay={220}>
          <div className="location-coords">
            {CONTACT.coordinates.split(" N ").map((part, i) => (
              <span key={part}>{part}{i === 0 ? " N" : ""}</span>
            ))}
          </div>
          <a
            className="location-map-block"
            href={CONTACT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Elysium Celeste's location, Ponnurangam Rd East, R.S. Puram, in Google Maps"
          >
            <div className="location-map" aria-hidden="true">
              <svg viewBox="0 0 160 160" fill="none">
                <defs>
                  <clipPath id="location-map-boundary"><circle cx="80" cy="80" r="77" /></clipPath>
                </defs>
                <circle cx="80" cy="80" r="77" />
                <g clipPath="url(#location-map-boundary)" className="location-map-grid">
                  <circle cx="80" cy="80" r="50" />
                  <path d="M0 80H160M80 0V160M0 35H160M0 125H160M35 0V160M125 0V160M20 0L140 160M0 130L160 30" />
                </g>
                <path className="location-map-pin" d="M80 91s-9-8-9-14a9 9 0 1 1 18 0c0 6-9 14-9 14Z" />
                <circle className="location-map-pin-center" cx="80" cy="77" r="3" />
              </svg>
            </div>
            <span className="location-map-label">Ponnurangam Rd East<br />R.S. Puram</span>
          </a>
          <div className="location-nearby">
            <h3 className="location-nearby-label">Nearby</h3>
            <ul className="location-nearby-list">
              {LOCATION_LANDMARKS.map((landmark) => <li key={landmark}>{landmark}</li>)}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
