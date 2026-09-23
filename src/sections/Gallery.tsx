import { useEffect, useRef, useState } from "react";
import address from "../assets/images/completed/address.jpg";
import boulevard from "../assets/images/completed/boulevard.jpg";
import villaPrimero from "../assets/images/completed/villa-primero.jpg";
import goldCrest from "../assets/images/completed/gold-crest.jpg";
import villaPark from "../assets/images/completed/villa-park.jpg";
import flushingMeadows from "../assets/images/completed/flushing-meadows.jpg";
import palacio from "../assets/images/completed/palacio.jpg";
import acropolis from "../assets/images/completed/acropolis.jpg";
import gardenia from "../assets/images/completed/gardenia.jpg";
import vistara from "../assets/images/completed/vistara.jpg";
import FadeIn from "../components/FadeIn";
import { gsap } from "../lib/smoothScroll";
import { usePrefersReducedMotion } from "../lib/hooks";
import "./Gallery.css";

// Elysium Properties' completed, fully sold-out residential projects across
// Coimbatore — sourced from https://elysium.in/completed/. Villa Primero and
// Casa Del Sol share one photo on the source site itself (Casa Del Sol has no
// separate image there), so that repetition is preserved rather than invented.
// Slide order per feedback: positions 4, 5 and 7 rotate (old 5 -> 4,
// old 7 -> 5, old 4 -> 7); each project keeps its own real photo, only the
// carousel position changes.
const ITEMS = [
  { src: address, name: "Elysium The Address", location: "Race Course, Coimbatore" },
  { src: boulevard, name: "Elysium Boulevard", location: "ATT Colony, Coimbatore" },
  { src: villaPrimero, name: "Elysium Villa Primero", location: "Saravanampatti, Coimbatore" },
  { src: goldCrest, name: "Elysium Gold Crest", location: "G.V. Residency, Coimbatore" },
  { src: flushingMeadows, name: "Elysium Flushing Meadows", location: "Off Avinashi Road, Coimbatore" },
  { src: villaPark, name: "Elysium Villa Park", location: "Off Avinashi Road, Coimbatore" },
  { src: villaPrimero, name: "Elysium Casa Del Sol", location: "Saravanampatti, Coimbatore" },
  { src: palacio, name: "Elysium Palacio", location: "Peelamedu, Coimbatore" },
  { src: acropolis, name: "Elysium Acropolis", location: "Peelamedu, Coimbatore" },
  { src: gardenia, name: "Elysium Gardenia", location: "Krishna Colony, Coimbatore" },
  { src: vistara, name: "Elysium Vistara", location: "Peelamedu, Coimbatore" },
];

const DRAG_THRESHOLD = 56;
const AUTOPLAY_HOLD_MS = 3600;
const AUTOPLAY_RESUME_MS = 3500;
// Autoplay only cycles through the first 7 slides, looping back to the
// first; manual navigation (arrows/dots/drag) is unrestricted and can
// still reach slides 8-11.
const AUTOPLAY_LIMIT = 7;

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isFirstIndexRender = useRef(true);
  const reducedMotion = usePrefersReducedMotion();
  const autoplayRef = useRef<{ paused: boolean; advanceTimer: ReturnType<typeof setTimeout> | null }>({ paused: false, advanceTimer: null });
  const indexRef = useRef(0);

  const go = (i: number) => {
    const next = (i + ITEMS.length) % ITEMS.length;
    indexRef.current = next;
    setIndex(next);
  };

  const clearAutoplayAdvance = () => {
    const state = autoplayRef.current;
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  };

  const scheduleAutoplayAdvance = () => {
    clearAutoplayAdvance();
    autoplayRef.current.advanceTimer = setTimeout(() => {
      if (!autoplayRef.current.paused) {
        const current = indexRef.current;
        // Stay within slides 1-7; if a manual jump left us past that
        // range, the next autoplay tick brings it back to the first slide.
        go(current < AUTOPLAY_LIMIT - 1 ? current + 1 : 0);
      }
      scheduleAutoplayAdvance();
    }, AUTOPLAY_HOLD_MS);
  };

  // Any manual interaction (arrow, dot, drag, keyboard) pauses autoplay
  // immediately and resumes it a few seconds later, rather than stopping it
  // for good — the carousel keeps auto-advancing on a continuous loop.
  const pauseAutoplayAndResume = () => {
    const state = autoplayRef.current;
    state.paused = true;
    clearAutoplayAdvance();
    state.advanceTimer = setTimeout(() => {
      state.paused = false;
      scheduleAutoplayAdvance();
    }, AUTOPLAY_RESUME_MS);
  };

  // Start autoplay once the carousel actually enters the viewport.
  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          scheduleAutoplayAdvance();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      clearAutoplayAdvance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, index]);

  // Pause autoplay while the lightbox has focus; resume a while after closing.
  const isFirstExpandedRender = useRef(true);
  useEffect(() => {
    if (isFirstExpandedRender.current) {
      isFirstExpandedRender.current = false;
      return;
    }
    if (expanded) {
      autoplayRef.current.paused = true;
      clearAutoplayAdvance();
    } else {
      pauseAutoplayAndResume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Smooth "settle" transition on the active slide + counter whenever the index changes.
  useEffect(() => {
    if (isFirstIndexRender.current) {
      isFirstIndexRender.current = false;
      return;
    }
    if (reducedMotion) return;

    const activeImg = trackRef.current?.querySelector<HTMLElement>(".gallery-slide.is-active img");
    if (activeImg) {
      gsap.fromTo(
        activeImg,
        { scale: 0.96, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
    if (counterRef.current) {
      gsap.fromTo(counterRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [index, reducedMotion]);

  // Drag / swipe on the rail (pointer events cover mouse + touch + pen).
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track || reducedMotion) return;

    let startX = 0;
    let dragging = false;
    const dragX = gsap.quickTo(track, "x", { duration: 0.3, ease: "power3.out" });

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      rail.classList.add("is-dragging");
      rail.setPointerCapture(e.pointerId);
      pauseAutoplayAndResume();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const delta = e.clientX - startX;
      // resistance: only a fraction of the raw drag distance
      dragX(delta * 0.35);
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove("is-dragging");
      const delta = e.clientX - startX;
      dragX(0);
      if (delta > DRAG_THRESHOLD) go(index - 1);
      else if (delta < -DRAG_THRESHOLD) go(index + 1);
    };

    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("pointermove", onMove);
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);

    return () => {
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("pointermove", onMove);
      rail.removeEventListener("pointerup", endDrag);
      rail.removeEventListener("pointercancel", endDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reducedMotion]);

  // Keyboard arrows when the rail has focus; horizontal trackpad wheel nudges the carousel.
  const onRailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { go(index + 1); pauseAutoplayAndResume(); }
    if (e.key === "ArrowLeft") { go(index - 1); pauseAutoplayAndResume(); }
  };
  const wheelLock = useRef(false);
  const onRailWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; // let vertical scroll pass through
    if (wheelLock.current) return;
    if (Math.abs(e.deltaX) < 12) return;
    wheelLock.current = true;
    pauseAutoplayAndResume();
    go(e.deltaX > 0 ? index + 1 : index - 1);
    setTimeout(() => {
      wheelLock.current = false;
    }, 420);
  };

  return (
    <section id="gallery" ref={sectionRef} className="gallery" aria-label="Elysium Properties completed projects">
      <div className="gallery-orbit" aria-hidden="true" />
      <div className="gallery-container">
        <div className="gallery-head">
          <FadeIn className="gallery-heading">
            <span className="eyebrow is-accent">Completed Projects</span>
            <h2 className="gallery-title">Homes delivered across Coimbatore.</h2>
          </FadeIn>
          <div className="gallery-controls">
            <span className="gallery-index" aria-live="polite" aria-atomic="true">
              <span ref={counterRef}>{String(index + 1).padStart(2, "0")}</span> / {String(ITEMS.length).padStart(2, "0")}
            </span>
            <button className="gallery-arrow" onClick={() => { go(index - 1); pauseAutoplayAndResume(); }} aria-label="Previous project">
              &#8592;
            </button>
            <button className="gallery-arrow" onClick={() => { go(index + 1); pauseAutoplayAndResume(); }} aria-label="Next project">
              &#8594;
            </button>
            <button className="gallery-explore" onClick={() => setExpanded(true)}>
              Explore<br />the portfolio
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="gallery-rail"
          tabIndex={0}
          role="group"
          aria-label="Completed projects carousel, use arrow keys or drag to browse"
          onKeyDown={onRailKeyDown}
          onWheel={onRailWheel}
        >
          <div ref={trackRef} className="gallery-track">
            {[-1, 0, 1].map((offset) => {
              const slideIndex = (index + offset + ITEMS.length) % ITEMS.length;
              const item = ITEMS[slideIndex];
              return (
                <button
                  key={offset}
                  className={`gallery-slide ${offset === 0 ? "is-active" : ""}`}
                  onClick={() => { pauseAutoplayAndResume(); if (offset === 0) { setExpanded(true); } else { go(slideIndex); } }}
                  aria-label={offset === 0 ? `View ${item.name}, ${item.location}` : `Show ${item.name}`}
                >
                  <img key={item.src} src={item.src} alt={`${item.name}, ${item.location} — a completed Elysium Properties project`} loading="lazy" />
                  <span className="gallery-slide-number" aria-hidden="true">
                    {String(slideIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="gallery-slide-status" aria-hidden="true">Sold Out</span>
                  <span className="gallery-caption">
                    {item.name}
                    <small>{item.location}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="gallery-pagination" aria-label="Choose a project">
          {ITEMS.map((item, i) => (
            <button
              key={`${item.name}-${i}`}
              className={i === index ? "is-active" : ""}
              aria-label={`Show ${item.name}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => { go(i); pauseAutoplayAndResume(); }}
            />
          ))}
        </div>

        <div className="gallery-footer">
          <span>A legacy of<br />delivered homes.</span>
          <span className="gallery-footer-rule" aria-hidden="true" />
          <span className="gallery-footer-brand">Elysium Properties</span>
        </div>
      </div>

      {expanded && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged project photograph">
          <button className="gallery-lightbox-close" onClick={() => setExpanded(false)} aria-label="Close">
            &times;
          </button>
          <button className="gallery-lightbox-nav gallery-lightbox-prev" onClick={() => go(index - 1)} aria-label="Previous project">
            &#8592;
          </button>
          <img src={ITEMS[index].src} alt={`${ITEMS[index].name}, ${ITEMS[index].location}`} />
          <span className="gallery-lightbox-caption">{ITEMS[index].name} &mdash; {ITEMS[index].location}</span>
          <button className="gallery-lightbox-nav gallery-lightbox-next" onClick={() => go(index + 1)} aria-label="Next project">
            &#8594;
          </button>
        </div>
      )}
    </section>
  );
}
