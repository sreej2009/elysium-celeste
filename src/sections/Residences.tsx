import { useEffect, useRef, useState } from "react";
import { APARTMENTS } from "../data/content";
import type { ApartmentType } from "../data/content";
import floorplanA2d from "../assets/images/floorplan-a-2d.webp";
import floorplanA3d from "../assets/images/floorplan-a-3d.webp";
import floorplanB2d from "../assets/images/floorplan-b-2d.webp";
import floorplanB3d from "../assets/images/floorplan-b-3d.webp";
import living from "../assets/images/interior-bedroom-01.webp";
import bedroom from "../assets/images/interior-kitchen-01.webp";
import FadeIn from "../components/FadeIn";
import { gsap, ScrollTrigger, getLenis } from "../lib/smoothScroll";
import { usePrefersReducedMotion, useMediaQuery } from "../lib/hooks";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Residences.css";

// Official Flat A / Flat B visuals from brochure pages 7 and 8.
const PLANS = {
  "4bhk": { "2d": floorplanA2d, "3d": floorplanA3d },
  "3bhk": { "2d": floorplanB2d, "3d": floorplanB3d },
};
const area = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Scroll progress (0-1 across the pinned distance) at which 3 BHK becomes dominant.
const TRANSITION_MIDPOINT = 0.575;

const FLAT_ORDER: ApartmentType["id"][] = ["4bhk", "3bhk"];

function RoomIcon({ room }: { room: string }) {
  const key = room.toLowerCase();
  let d = "M4 20h16M6 20V9l6-4 6 4v11"; // default: foyer/door
  if (key.includes("living")) d = "M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M4 18h16M4 18v2M20 18v2M6 12V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3";
  else if (key.includes("balcony")) d = "M4 10h16M6 10v10M18 10v10M9.5 10v10M14.5 10v10M4 20h16";
  else if (key.includes("bedroom")) d = "M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 19h18M3 19v2M21 19v2M5 10V6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4";
  else if (key.includes("dining")) d = "M4 21V10l8-6 8 6v11M9 21v-6h6v6M4 21h16";
  else if (key.includes("kitchen")) d = "M6 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M8 11v10M16 3c-1.7 0-3 1.6-3 4s1.3 4 3 4v10";
  return <svg className="residences-room-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d={d} /></svg>;
}

export default function Residences() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [dominant, setDominant] = useState<ApartmentType["id"]>("4bhk");
  const viewer = useRef<HTMLDialogElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const planButtonRef = useRef<HTMLButtonElement>(null);
  const plan4Ref = useRef<HTMLImageElement>(null);
  const plan3Ref = useRef<HTMLImageElement>(null);
  const note4Ref = useRef<HTMLSpanElement>(null);
  const note3Ref = useRef<HTMLSpanElement>(null);
  const details4Ref = useRef<HTMLDivElement>(null);
  const details3Ref = useRef<HTMLDivElement>(null);
  const num4Ref = useRef<HTMLSpanElement>(null);
  const num3Ref = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const selectBtn4Ref = useRef<HTMLButtonElement>(null);
  const selectBtn3Ref = useRef<HTMLButtonElement>(null);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);
  const mobileRailRef = useRef<HTMLDivElement>(null);
  const mobileCardRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileSyncingFromScroll = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const isMobileStage = useMediaQuery("(max-width: 768px)");

  const active = APARTMENTS[dominant];
  const image = PLANS[dominant][mode];
  const openPlan = () => viewer.current?.showModal();

  const jumpTo = (id: ApartmentType["id"]) => {
    const st = pinTriggerRef.current;
    if (!st) {
      setDominant(id);
      return;
    }
    const targetProgress = id === "4bhk" ? 0.02 : 0.98;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(targetScroll, { duration: 1.2 });
    else window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  // Scroll the mobile rail to the given flat's card (native scroll-snap carousel).
  const goMobile = (id: ApartmentType["id"]) => {
    const railEl = mobileRailRef.current;
    const cardEl = mobileCardRefs.current[FLAT_ORDER.indexOf(id)];
    if (!railEl || !cardEl) {
      setDominant(id);
      return;
    }
    mobileSyncingFromScroll.current = true;
    railEl.scrollTo({ left: cardEl.offsetLeft - railEl.offsetLeft, behavior: "smooth" });
    setDominant(id);
  };

  // Keep `dominant` synced when the user swipes the mobile rail by hand.
  useEffect(() => {
    if (!isMobileStage) return;
    const railEl = mobileRailRef.current;
    if (!railEl) return;

    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (mobileSyncingFromScroll.current) {
          mobileSyncingFromScroll.current = false;
          return;
        }
        const railRect = railEl.getBoundingClientRect();
        let closest = 0;
        let closestDist = Infinity;
        mobileCardRefs.current.forEach((cardEl, i) => {
          if (!cardEl) return;
          const dist = Math.abs(cardEl.getBoundingClientRect().left - railRect.left);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setDominant(FLAT_ORDER[closest]);
      }, 120);
    };

    railEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      railEl.removeEventListener("scroll", onScroll);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [isMobileStage]);

  useScrollReveal(planButtonRef, {
    from: { opacity: 0, scale: 0.92, rotationX: 8 },
    to: { opacity: 1, scale: 1, rotationX: 0 },
    duration: 1.1,
  });

  // Static fallback for prefers-reduced-motion: no pin, instant swap driven by clicking
  // the 04 / 03 indicators (dominant state set directly in jumpTo above).
  useEffect(() => {
    if (!reducedMotion) return;
    const isFour = dominant === "4bhk";
    const four = [plan4Ref.current, details4Ref.current, note4Ref.current].filter(Boolean) as HTMLElement[];
    const three = [plan3Ref.current, details3Ref.current, note3Ref.current].filter(Boolean) as HTMLElement[];
    gsap.set(four, { clearProps: "transform", opacity: isFour ? 1 : 0 });
    gsap.set(three, { clearProps: "transform", opacity: isFour ? 0 : 1 });
    if (num4Ref.current) gsap.set(num4Ref.current, { opacity: isFour ? 1 : 0.35 });
    if (num3Ref.current) gsap.set(num3Ref.current, { opacity: isFour ? 0.35 : 1 });
    selectBtn4Ref.current?.classList.toggle("is-active", isFour);
    selectBtn3Ref.current?.classList.toggle("is-active", !isFour);
  }, [reducedMotion, dominant]);

  // Cinematic pinned scroll: 4 BHK holds, transitions into 3 BHK, then holds again
  // before the section releases. Scrub-driven, so it scrubs naturally in reverse too.
  // Desktop only — mobile uses its own horizontal swipe carousel instead of a pin.
  useEffect(() => {
    if (reducedMotion || isMobileStage) return;
    const section = sectionRef.current;
    const plan4 = plan4Ref.current;
    const plan3 = plan3Ref.current;
    const details4 = details4Ref.current;
    const details3 = details3Ref.current;
    if (!section || !plan4 || !plan3 || !details4 || !details3) return;

    const note4 = note4Ref.current;
    const note3 = note3Ref.current;
    const num4 = num4Ref.current;
    const num3 = num3Ref.current;
    const preview = previewRef.current;
    const btn4 = selectBtn4Ref.current;
    const btn3 = selectBtn3Ref.current;

    const ctx = gsap.context(() => {
      gsap.set(plan4, { opacity: 1, scale: 1, y: 0 });
      gsap.set(plan3, { opacity: 0, scale: 1.04, y: 30 });
      gsap.set(details4, { opacity: 1, x: 0 });
      gsap.set(details3, { opacity: 0, x: 30 });
      if (note4) gsap.set(note4, { opacity: 1, y: 0 });
      if (note3) gsap.set(note3, { opacity: 0, y: 8 });
      if (num4) gsap.set(num4, { opacity: 1 });
      if (num3) gsap.set(num3, { opacity: 0.35 });

      let isThreeActive = false;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: isMobileStage ? "+=300%" : "+=180%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const shouldBeThree = self.progress >= TRANSITION_MIDPOINT;
            if (shouldBeThree !== isThreeActive) {
              isThreeActive = shouldBeThree;
              btn4?.classList.toggle("is-active", !shouldBeThree);
              btn3?.classList.toggle("is-active", shouldBeThree);
              setDominant(shouldBeThree ? "3bhk" : "4bhk");
            }
          },
        },
      });
      pinTriggerRef.current = tl.scrollTrigger ?? null;

      tl.to(plan4, { scale: 0.94, opacity: 0, y: -25, duration: 0.25, ease: "power2.inOut" }, 0.45)
        .to(details4, { opacity: 0, x: -20, duration: 0.25, ease: "power2.inOut" }, 0.45)
        .fromTo(plan3, { scale: 1.04, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "power2.inOut" }, 0.45)
        .fromTo(details3, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.inOut" }, 0.45)
        .set({}, {}, 1);

      if (num4 && num3) {
        tl.to(num4, { opacity: 0.35, duration: 0.25, ease: "power2.inOut" }, 0.45)
          .fromTo(num3, { opacity: 0.35 }, { opacity: 1, duration: 0.25, ease: "power2.inOut" }, 0.45);
      }
      if (note4 && note3) {
        tl.to(note4, { opacity: 0, y: -8, duration: 0.25, ease: "power2.inOut" }, 0.45)
          .fromTo(note3, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.inOut" }, 0.45);
      }
      if (preview) {
        tl.to(preview, { opacity: 0.55, x: -8, duration: 0.2, ease: "power2.inOut" }, 0.45)
          .to(preview, { opacity: 1, x: 0, duration: 0.25, ease: "power2.inOut" }, 0.63);
      }
    }, section);

    return () => {
      pinTriggerRef.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, isMobileStage]);

  return (
    <section id="residences" className="residences section-pad" ref={sectionRef}>
      <FadeIn as="header" className="residences-head">
        <div>
          <span className="residences-eyebrow">Residences</span>
          <h2 className="residences-title">Two ways to call Celeste home.</h2>
        </div>
        <p className="residences-intro">Thoughtfully designed 3 &amp; 4 BHK residences with intelligent layouts, spacious living and refined finishes — made for a higher way of living.</p>
        <button className="residences-explore" onClick={openPlan}>
          <span>Explore<br />floor plans</span><span className="residences-arrow" aria-hidden="true">→</span>
        </button>
      </FadeIn>

      <div className="residences-stage">
        <FadeIn as="div" className="residences-selector" delay={100} role="group" aria-label="Residence type">
          <button
            ref={selectBtn4Ref}
            className="residences-select-btn is-active"
            aria-pressed={dominant === "4bhk"}
            onClick={() => jumpTo("4bhk")}
          >
            <span ref={num4Ref} className="residences-select-number">{APARTMENTS["4bhk"].bhk}</span>
            <span className="residences-select-label">BHK<br />Residence</span>
          </button>
          <button
            ref={selectBtn3Ref}
            className="residences-select-btn"
            aria-pressed={dominant === "3bhk"}
            onClick={() => jumpTo("3bhk")}
          >
            <span ref={num3Ref} className="residences-select-number">{APARTMENTS["3bhk"].bhk}</span>
            <span className="residences-select-label">BHK<br />Residence</span>
          </button>
        </FadeIn>

        <div id="floorplan" className="residences-visual">
          <div className="residences-view-toggle" role="group" aria-label="Floor plan view">
            {(["2d", "3d"] as const).map(view => (
              <button key={view} aria-pressed={mode === view} onClick={() => setMode(view)}>{view === "2d" ? "2D Plan" : "3D View"}</button>
            ))}
            <span>{active.flatCode}</span>
          </div>
          <button ref={planButtonRef} className="residences-plan-button" onClick={openPlan} aria-label={`Enlarge ${active.flatCode}, ${active.label}, official ${mode.toUpperCase()} floor plan`}>
            <img ref={plan4Ref} src={PLANS["4bhk"][mode]} alt={`${APARTMENTS["4bhk"].flatCode}, ${APARTMENTS["4bhk"].label}, official ${mode.toUpperCase()} floor plan`} className="residences-plan-img" />
            <img ref={plan3Ref} src={PLANS["3bhk"][mode]} alt={`${APARTMENTS["3bhk"].flatCode}, ${APARTMENTS["3bhk"].label}, official ${mode.toUpperCase()} floor plan`} className="residences-plan-img" />
          </button>
          <div className="residences-plan-note-wrap">
            <span ref={note4Ref} className="residences-plan-note">{APARTMENTS["4bhk"].flatCode} <span aria-hidden="true">/</span> {APARTMENTS["4bhk"].label} residence</span>
            <span ref={note3Ref} className="residences-plan-note">{APARTMENTS["3bhk"].flatCode} <span aria-hidden="true">/</span> {APARTMENTS["3bhk"].label} residence</span>
          </div>
        </div>

        <div className="residences-details-wrap" aria-live="polite">
          <div ref={details4Ref} className="residences-details">
            <span className="residences-detail-label">{APARTMENTS["4bhk"].label} Residence</span>
            <h3 className="residences-area">{area(APARTMENTS["4bhk"].superBuiltUp.sqft)} <span>Sq.Ft</span></h3>
            <p className="residences-metric">({APARTMENTS["4bhk"].superBuiltUp.sqm} M²)</p>
            <span className="residences-area-caption">Super built-up area</span>
            <dl className="residences-measurements">
              <div><dt>Built-up</dt><dd>{area(APARTMENTS["4bhk"].builtUp)} Sq.Ft</dd></div>
              <div><dt>Carpet</dt><dd>{area(APARTMENTS["4bhk"].carpet)} Sq.Ft</dd></div>
            </dl>
            <p className="residences-detail-copy">Spaces for everyday living.<br />Room to call your own.</p>
          </div>
          <div ref={details3Ref} className="residences-details">
            <span className="residences-detail-label">{APARTMENTS["3bhk"].label} Residence</span>
            <h3 className="residences-area">{area(APARTMENTS["3bhk"].superBuiltUp.sqft)} <span>Sq.Ft</span></h3>
            <p className="residences-metric">({APARTMENTS["3bhk"].superBuiltUp.sqm} M²)</p>
            <span className="residences-area-caption">Super built-up area</span>
            <dl className="residences-measurements">
              <div><dt>Built-up</dt><dd>{area(APARTMENTS["3bhk"].builtUp)} Sq.Ft</dd></div>
              <div><dt>Carpet</dt><dd>{area(APARTMENTS["3bhk"].carpet)} Sq.Ft</dd></div>
            </dl>
            <p className="residences-detail-copy">Spaces for everyday living.<br />Room to call your own.</p>
          </div>
        </div>

        <div className="residences-preview" ref={previewRef}>
          <img src={living} alt="Celeste living room interior" loading="lazy" />
          <img src={bedroom} alt="Celeste bedroom interior" loading="lazy" />
          <button className="residences-open-plan" onClick={openPlan}>View floor plan <span aria-hidden="true">→</span></button>
        </div>
      </div>

      {/* Mobile only (<=768px): horizontal swipe carousel between Flat A and Flat B,
          replacing the desktop pinned-scroll crossfade above (hidden via CSS here). */}
      <div className="residences-mobile">
        <div className="residences-mobile-switcher">
          <div className="residences-mobile-selector" role="group" aria-label="Residence type">
            {FLAT_ORDER.map((id) => (
              <button
                key={id}
                className={dominant === id ? "is-active" : ""}
                aria-pressed={dominant === id}
                onClick={() => goMobile(id)}
              >
                <span className="residences-mobile-select-number">{APARTMENTS[id].bhk}</span>
                <span className="residences-mobile-select-label">BHK<br />Residence</span>
              </button>
            ))}
          </div>
          <div className="residences-mobile-nav">
            <span className="residences-mobile-count">
              {String(FLAT_ORDER.indexOf(dominant) + 1).padStart(2, "0")} / {String(FLAT_ORDER.length).padStart(2, "0")}
            </span>
            <button
              className="residences-mobile-nav-btn"
              onClick={() => goMobile(FLAT_ORDER[Math.max(0, FLAT_ORDER.indexOf(dominant) - 1)])}
              disabled={dominant === FLAT_ORDER[0]}
              aria-label="Previous residence"
            >
              &#8249;
            </button>
            <button
              className="residences-mobile-nav-btn"
              onClick={() => goMobile(FLAT_ORDER[Math.min(FLAT_ORDER.length - 1, FLAT_ORDER.indexOf(dominant) + 1)])}
              disabled={dominant === FLAT_ORDER[FLAT_ORDER.length - 1]}
              aria-label="Next residence"
            >
              &#8250;
            </button>
          </div>
        </div>

        <div className="residences-mobile-rail" ref={mobileRailRef} role="group" aria-label="Residence floor plans, swipe to browse">
          {FLAT_ORDER.map((id, i) => {
            const flat = APARTMENTS[id];
            return (
              <article
                key={id}
                ref={(el) => { mobileCardRefs.current[i] = el; }}
                className={`residences-mobile-card ${dominant === id ? "is-active" : ""}`}
              >
                <div className="residences-mobile-card-head">
                  <span className="residences-mobile-flat-label">{flat.flatCode}</span>
                  <div className="residences-mobile-view-toggle" role="group" aria-label="Floor plan view">
                    {(["2d", "3d"] as const).map((view) => (
                      <button key={view} aria-pressed={mode === view} onClick={() => setMode(view)}>
                        {view === "2d" ? "2D Plan" : "3D View"}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="residences-mobile-plan-btn"
                  onClick={() => { setDominant(id); openPlan(); }}
                  aria-label={`Enlarge ${flat.flatCode}, ${flat.label}, official ${mode.toUpperCase()} floor plan`}
                >
                  <img src={PLANS[id][mode]} alt={`${flat.flatCode}, ${flat.label}, official ${mode.toUpperCase()} floor plan`} loading="lazy" />
                </button>
                <div className="residences-mobile-card-body">
                  <span className="residences-mobile-type">{flat.label} Residence</span>
                  <h3 className="residences-mobile-area">
                    {area(flat.superBuiltUp.sqft)} <small>Sq.Ft</small>
                  </h3>
                  <p className="residences-mobile-metric">({flat.superBuiltUp.sqm} M&sup2;)</p>
                  <span className="residences-mobile-caption">Super built-up area</span>
                  <dl className="residences-mobile-measurements">
                    <div><dt>Built-up</dt><dd>{area(flat.builtUp)} Sq.Ft</dd></div>
                    <div><dt>Carpet</dt><dd>{area(flat.carpet)} Sq.Ft</dd></div>
                  </dl>
                  <div className="residences-mobile-rooms">
                    {flat.rooms.map((room) => (
                      <div key={room} className="residences-mobile-room">
                        <RoomIcon room={room} />
                        <span>{room}</span>
                      </div>
                    ))}
                  </div>
                  <button className="residences-mobile-view-plan" onClick={() => { setDominant(id); openPlan(); }}>
                    View floor plan <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="residences-mobile-closing">A home<br />that moves with you.</p>
      </div>

      <footer className="residences-footer">
        <div className="residences-rooms" aria-label="Room categories">{active.rooms.map(room => <span key={room}>{room}</span>)}</div>
        <span className="residences-signature">Elysium Celeste</span>
      </footer>

      <dialog ref={viewer} className="residences-viewer" aria-label={`${active.label} floor plan enlarged`} onClick={event => { if (event.target === event.currentTarget) viewer.current?.close(); }}>
        <div className="residences-viewer-head">
          <span>{active.flatCode} · {active.label} · {mode.toUpperCase()} {mode === "2d" ? "Plan" : "View"}</span>
          <button onClick={() => viewer.current?.close()} aria-label="Close floor plan">Close ×</button>
        </div>
        <img src={image} alt={`${active.flatCode}, ${active.label}, official ${mode.toUpperCase()} floor plan`} />
      </dialog>
    </section>
  );
}
