import { useEffect, useRef, useState } from "react";
import { APARTMENTS, BUILDING_FLOORS } from "../data/content";
import type { ApartmentType } from "../data/content";
import buildingDay from "../assets/images/building-day.webp";
import floorplanA3d from "../assets/images/floorplan-a-3d.webp";
import floorplanB3d from "../assets/images/floorplan-b-3d.webp";
import interiorLiving from "../assets/images/interior-bedroom-01.webp";
import interiorDining from "../assets/images/interior-dining-01.webp";
import { gsap, scrollToId } from "../lib/smoothScroll";
import { usePrefersReducedMotion, useMediaQuery } from "../lib/hooks";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Availability.css";

const UNIT_TYPES: { code: "A" | "B"; id: ApartmentType["id"] }[] = [
  { code: "A", id: "4bhk" },
  { code: "B", id: "3bhk" },
];

// Same official 3D plan + interior imagery already used elsewhere (Residences / Gallery),
// reused here per unit type — no per-floor assets exist, so identical units reuse them.
const PLAN_BY_TYPE: Record<ApartmentType["id"], string> = {
  "4bhk": floorplanA3d,
  "3bhk": floorplanB3d,
};
const INTERIOR_BY_TYPE: Record<ApartmentType["id"], string> = {
  "4bhk": interiorLiving,
  "3bhk": interiorDining,
};

// The automatic presentation order: every residence, floor by floor, A then B.
const PRESENTATION_SEQUENCE = BUILDING_FLOORS.flatMap((floor) =>
  UNIT_TYPES.map((u) => ({ floor, code: u.code, aptId: u.id }))
);

// Single knob for pacing — total per-unit time (hold + transition), in ms.
const UNIT_DURATION = 3500;
const UNIT_DURATION_MOBILE = 2300;

// Mobile (<=768px) floor-by-floor autoplay pacing.
const MOBILE_FLOOR_HOLD_MS = 2800;
const MOBILE_FLOOR_RESUME_MS = 3000;

export default function Availability() {
  const [selected, setSelected] = useState<{ floor: number; code: "A" | "B" } | null>(null);
  const [type, setType] = useState<ApartmentType["id"]>("4bhk");
  const selectedApt = selected ? APARTMENTS[UNIT_TYPES.find((u) => u.code === selected.code)!.id] : null;

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const elevationRef = useRef<HTMLDivElement>(null);
  const buildingImgRef = useRef<HTMLImageElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const mobileUnitsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Drives both the existing autoplay pacing AND (below) which layout renders:
  // <=768px gets the horizontal floor selector + 2-card mobile view instead of
  // the full elevation grid. Desktop (>768px) is completely unaffected.
  const isMobileTiming = useMediaQuery("(max-width: 767px)");
  const [mobileFloorIndex, setMobileFloorIndex] = useState(0);
  const floorAutoplayRef = useRef<{ paused: boolean; advanceTimer: ReturnType<typeof setTimeout> | null }>({ paused: false, advanceTimer: null });

  const floorClearAdvance = () => {
    const state = floorAutoplayRef.current;
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  };

  const floorScheduleAdvance = () => {
    floorClearAdvance();
    floorAutoplayRef.current.advanceTimer = setTimeout(() => {
      if (!floorAutoplayRef.current.paused) {
        mobileTransitionTo(() => setMobileFloorIndex((i) => (i + 1) % BUILDING_FLOORS.length));
      }
      floorScheduleAdvance();
    }, MOBILE_FLOOR_HOLD_MS);
  };

  // Called from every manual mobile interaction (floor pill, arrow, unit card,
  // BHK switcher): pauses the floor autoplay immediately and resumes it a
  // short while later. No-ops outside the mobile floor-selector layout.
  const floorPauseAndResume = () => {
    if (!isMobileTiming) return;
    const state = floorAutoplayRef.current;
    state.paused = true;
    floorClearAdvance();
    state.advanceTimer = setTimeout(() => {
      floorAutoplayRef.current.paused = false;
      floorScheduleAdvance();
    }, MOBILE_FLOOR_RESUME_MS);
  };

  // Crossfades the mobile unit cards + detail panel out, applies the state
  // change (floor/BHK), then fades the new content back in — instead of the
  // content just snapping to the new floor/unit with no transition at all.
  const mobileTransitionTo = (updater: () => void) => {
    const targets = [mobileUnitsRef.current, detailRef.current].filter(Boolean) as HTMLElement[];
    if (reducedMotion || targets.length === 0) {
      updater();
      return;
    }
    gsap.to(targets, {
      opacity: 0,
      y: -8,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        updater();
        gsap.fromTo(targets, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" });
      },
    });
  };

  useScrollReveal(headingRef, {
    from: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
    to: { clipPath: "inset(0 0 0% 0)", opacity: 1 },
    duration: 0.9,
  });
  useScrollReveal(switcherRef, { from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, duration: 0.7, delay: 0.15 });
  useScrollReveal(buildingImgRef, { from: { opacity: 0, scale: 1.1 }, to: { opacity: 1, scale: 1 }, duration: 1.1 });
  useScrollReveal(detailRef, { from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 }, duration: 0.8, delay: 0.2 });

  useEffect(() => {
    const rows = elevationRef.current?.querySelectorAll<HTMLElement>(".availability-row");
    if (!rows || rows.length === 0) return;

    if (reducedMotion) {
      gsap.set(rows, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(rows, { opacity: 0, y: 26 });
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: elevationRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, elevationRef);

    return () => ctx.revert();
  }, [reducedMotion, isMobileTiming]);

  // Mobile floor selector: keep `selected`/`type` in sync with whichever floor
  // and BHK code are currently active, so the existing detail-panel JSX (which
  // already renders from `selected`/`selectedApt`) works unchanged for mobile.
  useEffect(() => {
    if (!isMobileTiming) return;
    setSelected({ floor: BUILDING_FLOORS[mobileFloorIndex], code: type === "4bhk" ? "A" : "B" });
  }, [isMobileTiming, mobileFloorIndex, type]);

  // Mobile floor autoplay: cycles Floor 5 -> 4 -> 3 -> 2 -> 1 -> 5... on a
  // fixed real-time interval. Not scroll-linked — only the floor/unit content
  // changes, the page itself never scrolls. Pauses on any manual interaction
  // via floorPauseAndResume() and resumes a few seconds later.
  useEffect(() => {
    if (!isMobileTiming || reducedMotion) return;
    floorAutoplayRef.current.paused = false;
    floorScheduleAdvance();
    return () => floorClearAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileTiming, reducedMotion]);

  // Automatic residence presentation: once the section enters the viewport, every
  // unit (A5, B5, A4, B4 ... A1, B1) is presented in turn on a real-time GSAP
  // timeline. This is NOT scroll-linked (no scrub/pin) — it plays independently of
  // scroll position and simply stops after B1. Existing manual click-to-select on
  // the elevation grid keeps working throughout and afterwards. Desktop only —
  // mobile (<=768px) uses the floor-autoplay effect above instead.
  useEffect(() => {
    if (reducedMotion || isMobileTiming) return;
    const section = sectionRef.current;
    const buildingImg = buildingImgRef.current;
    const detail = detailRef.current;
    if (!section || !detail) return;

    const durationMs = isMobileTiming ? UNIT_DURATION_MOBILE : UNIT_DURATION;
    const TRANSITION = isMobileTiming ? 0.8 : 1;
    const HOLD = Math.max(0.6, durationMs / 1000 - TRANSITION);
    const seq = PRESENTATION_SEQUENCE;

    let observer: IntersectionObserver | null = null;

    const ctx = gsap.context(() => {
      const goTo = (index: number) => {
        const state = seq[index];
        setSelected({ floor: state.floor, code: state.code });
        setType(state.aptId);
      };

      const tl = gsap.timeline({ paused: true });

      tl.call(() => goTo(0))
        .fromTo(detail, { opacity: 0, scale: 1.02, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: TRANSITION / 2, ease: "power3.inOut" });

      for (let i = 0; i < seq.length - 1; i++) {
        tl.to({}, { duration: HOLD });
        tl.to(detail, { opacity: 0, scale: 0.98, y: -15, duration: TRANSITION / 2, ease: "power3.inOut" });
        if (buildingImg) tl.to(buildingImg, { scale: 1.03, y: -5, duration: TRANSITION / 2, ease: "power3.inOut" }, "<");
        tl.call(() => goTo(i + 1));
        tl.fromTo(detail, { opacity: 0, scale: 1.02, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: TRANSITION / 2, ease: "power3.inOut" });
        if (buildingImg) tl.to(buildingImg, { scale: 1, y: 0, duration: TRANSITION / 2, ease: "power3.inOut" });
      }
      tl.to({}, { duration: HOLD });

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            tl.play(0);
            observer?.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      observer.observe(section);
    }, section);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, isMobileTiming]);

  return (
    <section id="availability" className="availability" aria-labelledby="availability-title" ref={sectionRef}>
      <div className="availability-micro" aria-hidden="true">Homes <i /> People <i /> A brighter tomorrow</div>
      <div className="availability-body">
        <div className="availability-left">
          <header className="availability-head">
            <span className="eyebrow is-accent">Availability <i /></span>
            <h2 ref={headingRef} id="availability-title" className="availability-title">Select a residence<br />from the elevation.</h2>
            <p className="availability-subtitle">Thoughtfully planned. Beautifully yours.</p>
          </header>
          <div ref={switcherRef} className="availability-switcher" role="group" aria-label="Residence type">
            {UNIT_TYPES.map((u) => (
              <button key={u.id} aria-pressed={type === u.id} onClick={() => {
                if (isMobileTiming) {
                  mobileTransitionTo(() => {
                    setType(u.id);
                    if (selected) setSelected({ floor: selected.floor, code: u.code });
                  });
                  floorPauseAndResume();
                } else {
                  setType(u.id);
                  if (selected) setSelected({ floor: selected.floor, code: u.code });
                }
              }}>{APARTMENTS[u.id].label}</button>
            ))}
          </div>

          {isMobileTiming ? (
            <>
              <div className="availability-floor-nav" role="group" aria-label="Floor selector">
                <button type="button" className="availability-floor-arrow" aria-label="Previous floor" onClick={() => {
                  mobileTransitionTo(() => setMobileFloorIndex((i) => (i - 1 + BUILDING_FLOORS.length) % BUILDING_FLOORS.length));
                  floorPauseAndResume();
                }}><span aria-hidden="true">‹</span></button>
                <div className="availability-floor-pills">
                  {BUILDING_FLOORS.map((floor, i) => (
                    <button key={floor} type="button"
                      className={`availability-floor-pill ${i === mobileFloorIndex ? "is-active" : ""}`}
                      aria-pressed={i === mobileFloorIndex}
                      onClick={() => { mobileTransitionTo(() => setMobileFloorIndex(i)); floorPauseAndResume(); }}>
                      Floor {floor}
                    </button>
                  ))}
                </div>
                <button type="button" className="availability-floor-arrow" aria-label="Next floor" onClick={() => {
                  mobileTransitionTo(() => setMobileFloorIndex((i) => (i + 1) % BUILDING_FLOORS.length));
                  floorPauseAndResume();
                }}><span aria-hidden="true">›</span></button>
              </div>

              <div className="availability-floor-heading"><span>Floor {BUILDING_FLOORS[mobileFloorIndex]}</span><i /></div>

              <div ref={mobileUnitsRef} className="availability-mobile-units">
                {UNIT_TYPES.map((u) => {
                  const floor = BUILDING_FLOORS[mobileFloorIndex];
                  const isActive = selected?.floor === floor && selected?.code === u.code;
                  return (
                    <button key={u.code} type="button" className={`availability-unit ${isActive ? "is-active" : ""}`}
                      aria-pressed={isActive} aria-controls="availability-detail"
                      aria-label={`Unit ${u.code}${floor}, ${APARTMENTS[u.id].label}, enquire for availability`}
                      onClick={() => { mobileTransitionTo(() => setType(u.id)); floorPauseAndResume(); }}>
                      <span className="availability-unit-code">{u.code}{floor}</span>
                      <span className="availability-unit-bhk">{APARTMENTS[u.id].label}</span>
                      <span className="availability-unit-status"><i />Enquire</span>
                      <span className="availability-unit-arrow" aria-hidden="true">→</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div ref={elevationRef} className="availability-elevation">
              {BUILDING_FLOORS.map((floor) => (
                <div className="availability-row" key={floor}>
                  <span className="availability-floor-label">Floor {floor}</span>
                  <div className="availability-units">
                    {UNIT_TYPES.map((u) => {
                      const isActive = selected?.floor === floor && selected?.code === u.code;
                      return (
                        <button key={u.code} className={`availability-unit ${isActive ? "is-active" : ""}`}
                          aria-pressed={isActive} aria-controls="availability-detail"
                          aria-label={`Unit ${u.code}${floor}, ${APARTMENTS[u.id].label}, enquire for availability`}
                          onClick={() => { setType(u.id); setSelected(isActive ? null : { floor, code: u.code }); }}>
                          <span className="availability-unit-code">{u.code}{floor}</span>
                          <span className="availability-unit-status"><i />Enquire</span>
                          <span className="availability-unit-arrow" aria-hidden="true">→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="availability-note"><span aria-hidden="true">ⓘ</span> Availability is subject to change. Please get in touch for the latest updates.</p>
        </div>

        <div className="availability-visual">
          <img ref={buildingImgRef} className="availability-building" src={buildingDay} alt="Celeste's contemporary facade in R.S. Puram, Coimbatore" loading="lazy" />
          <div className="availability-metadata">
            <p>R.S. Puram<br />Coimbatore</p><i />
            <p>Stilt + 5<br />Stories</p><i />
            <p>RCC framed<br />Structure</p>
          </div>
          <svg className="availability-seal" viewBox="0 0 120 120" aria-hidden="true">
            <defs><path id="availability-seal-top" d="M 17,60 A 43,43 0 0,1 103,60" /><path id="availability-seal-bottom" d="M 14,62 A 46,46 0 0,0 106,62" /></defs>
            <circle cx="60" cy="60" r="57" />
            <text><textPath href="#availability-seal-top" startOffset="50%" textAnchor="middle">ELEVATED LIVING</textPath></text>
            <text><textPath href="#availability-seal-bottom" startOffset="50%" textAnchor="middle">IN COIMBATORE</textPath></text>
            <path className="availability-compass" d="M60 42 63 57 78 60 63 63 60 78 57 63 42 60 57 57Z" />
          </svg>
          <div ref={detailRef} id="availability-detail" className="availability-detail" aria-live="polite" aria-atomic="true">
            {selectedApt && selected ? (
              <>
                <span className="availability-detail-unit">Unit {selected.code}{selected.floor} · Floor {selected.floor}</span>
                <h3 className="availability-detail-title">{selectedApt.label} Residence</h3>
                <div className="availability-detail-stats">
                  <div><span className="availability-detail-caption">Super Built-Up</span><span className="availability-detail-value">{selectedApt.superBuiltUp.sqft.toLocaleString("en-IN")} Sq.Ft</span></div>
                  <div><span className="availability-detail-caption">Carpet Area</span><span className="availability-detail-value">{selectedApt.carpet.toLocaleString("en-IN")} Sq.Ft</span></div>
                </div>
                <div className="availability-detail-media" aria-hidden="true">
                  <img src={PLAN_BY_TYPE[selectedApt.id]} alt="" loading="lazy" />
                  <img src={INTERIOR_BY_TYPE[selectedApt.id]} alt="" loading="lazy" />
                </div>
              </>
            ) : (
              <>
                <h3 className="availability-detail-title">Select a unit to view details</h3>
                <p className="availability-placeholder">Select any unit on the elevation to view its residence type and dimensions. Unit A is the 4&nbsp;BHK, Unit B is the 3&nbsp;BHK — identical on every floor.</p>
              </>
            )}
            <div className="availability-detail-bottom">
              <p className="availability-footnote">For current availability, please get in touch.</p>
              <button className="availability-enquire" onClick={() => scrollToId("enquiry")} aria-label={selected ? `Enquire about ${selected.code}${selected.floor}` : "Enquire about availability"}><span aria-hidden="true">→</span></button>
            </div>
          </div>
        </div>
      </div>
      <div className="availability-brand" aria-hidden="true">Elysium Celeste <i /></div>
    </section>
  );
}
