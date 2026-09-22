import { useEffect, useRef } from "react";
import { SPEC_CATEGORIES } from "../data/content";
import buildingDay from "../assets/images/building-day.webp";
import buildingNight from "../assets/images/building-night.webp";
import foyerDining from "../assets/images/interior-dining-01.webp";
import bedroomMain from "../assets/images/interior-bedroom-02.webp";
import kitchenMain from "../assets/images/interior-living-01.webp";
import livingRoom from "../assets/images/interior-bedroom-01.webp";
import evChargingConcept from "../assets/images/ev-charging-concept-generated.png";
import bedroomBalconyDoor from "../assets/images/interior-kitchen-01.webp";
import loungeSpace from "../assets/images/interior-living-02.webp";
import bathroomConcept from "../assets/images/bathroom-concept-generated.png";
import FadeIn from "../components/FadeIn";
import { gsap, ScrollTrigger, getLenis } from "../lib/smoothScroll";
import { usePrefersReducedMotion, useMediaQuery } from "../lib/hooks";
import { useParallax } from "../hooks/useParallax";
import "./Specifications.css";

type SpecVisual =
  | { kind: "image"; src: string; alt: string; focal?: string }
  | { kind: "editorial"; quote: string };

// Each category has a distinct visual. Toilets/Plumbing uses a user-requested
// AI-generated bathroom concept; it is not an actual Celeste property photo.
const SPEC_VISUALS: Record<string, SpecVisual> = {
  structure: { kind: "image", src: buildingDay, alt: "Elysium Celeste's architectural facade and structure, R.S. Puram, Coimbatore", focal: "60% 35%" },
  interiors: { kind: "image", src: foyerDining, alt: "Celeste foyer corridor and dining area interior", focal: "center" },
  bedroom: { kind: "image", src: bedroomMain, alt: "Celeste bedroom interior with wardrobe storage", focal: "center 35%" },
  water: { kind: "image", src: bathroomConcept, alt: "AI-generated bathroom concept with tiled finishes, a vanity and glass shower", focal: "center 55%" },
  kitchen: { kind: "image", src: kitchenMain, alt: "Celeste kitchen interior", focal: "center" },
  electrical: { kind: "image", src: buildingNight, alt: "Elysium Celeste's facade illuminated at night", focal: "center 28%" },
  common: { kind: "image", src: livingRoom, alt: "Celeste interior living space", focal: "center 40%" },
  doors: { kind: "image", src: bedroomBalconyDoor, alt: "Celeste bedroom with a glazed door opening to the balcony", focal: "left center" },
  other: { kind: "image", src: loungeSpace, alt: "Celeste interior finishes and lounge seating", focal: "center 35%" },
};

const HIGHLIGHT_ITEM = "EV charging provisions";

// Mobile-only reorder: EV charging leads the Common Areas list instead of
// trailing it, per feedback. Desktop keeps the brochure's original order.
function mobileOrderedItems(items: string[]) {
  if (!items.includes(HIGHLIGHT_ITEM)) return items;
  return [HIGHLIGHT_ITEM, ...items.filter((item) => item !== HIGHLIGHT_ITEM)];
}

const TOTAL = SPEC_CATEGORIES.length;
const HOLD_FRACTION = 0.62;
const TRANS_HALF = (1 - HOLD_FRACTION) / 2;
// Categories 1–8 each hold for HOLD_FRACTION before transitioning into the
// next one. Category 9 has nothing to transition into, so it doesn't need
// that same hold — the viewer can keep reading it as they scroll past, same
// as any normal (non-pinned) content. It only gets a small settle buffer
// (~80-140px at typical viewport heights) before the pin releases, instead
// of a full extra unit of static pinned scroll with nothing happening.
const TAIL_HOLD = 0.15;
const TIMELINE_DURATION = TOTAL - 1 + TAIL_HOLD;

// Mobile (<768px) editorial carousel pacing.
const CAROUSEL_HOLD_MS = 2800;
const CAROUSEL_RESUME_MS = 3000;
const CAROUSEL_TWEEN_S = 0.8;

export default function Specifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const imageLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostNumberRef = useRef<HTMLSpanElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carouselStateRef = useRef<{
    index: number;
    paused: boolean;
    advanceTimer: ReturnType<typeof setTimeout> | null;
    settleTimer: ReturnType<typeof setTimeout> | null;
  }>({ index: 0, paused: false, advanceTimer: null, settleTimer: null });
  const reducedMotion = usePrefersReducedMotion();
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const isMobileCarousel = useMediaQuery("(max-width: 767px)");
  // <768px gets the horizontal editorial carousel (unless reduced motion, which
  // gets the static list instead, same accessible-fallback pattern used
  // everywhere else in this app). Everything >=768px is completely untouched:
  // 768-900px keeps the existing static list, >900px keeps the pinned desktop
  // catalogue — neither of those branches or their breakpoints changed.
  const showCarousel = isMobileCarousel && !reducedMotion;
  const showSimpleList = !showCarousel && (reducedMotion || isNarrow);
  const showPinned = !showCarousel && !showSimpleList;

  // Content reveal for whichever card becomes active — on top of the slide
  // itself, so arriving at a new card feels like more than a flat horizontal
  // scroll: the number/image settle in and the bullets stagger up.
  const carouselAnimateCardIn = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const number = card.querySelector(".specs-carousel-number");
    const image = card.querySelector(".specs-carousel-image");
    const bullets = card.querySelectorAll(".specs-content-list li");
    if (number) gsap.fromTo(number, { opacity: 0.25, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    if (image) gsap.fromTo(image, { opacity: 0.4, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
    if (bullets.length) gsap.fromTo(bullets, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05, delay: 0.15 });
  };

  const carouselGoTo = (index: number) => {
    const track = trackRef.current;
    const clamped = ((index % TOTAL) + TOTAL) % TOTAL;
    carouselStateRef.current.index = clamped;
    const target = cardRefs.current[clamped];
    if (track && target) {
      gsap.to(track, { scrollLeft: target.offsetLeft, duration: CAROUSEL_TWEEN_S, ease: "power3.inOut" });
    }
    carouselAnimateCardIn(clamped);
  };

  const carouselClearAdvance = () => {
    const state = carouselStateRef.current;
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
    }
  };

  const carouselScheduleAdvance = () => {
    carouselClearAdvance();
    carouselStateRef.current.advanceTimer = setTimeout(() => {
      if (!carouselStateRef.current.paused) {
        carouselGoTo(carouselStateRef.current.index + 1);
      }
      carouselScheduleAdvance();
    }, CAROUSEL_HOLD_MS);
  };

  const carouselOnArrowClick = (dir: 1 | -1) => {
    const state = carouselStateRef.current;
    state.paused = true;
    carouselClearAdvance();
    carouselGoTo(state.index + dir);
  };

  const jumpTo = (index: number) => {
    const st = pinTriggerRef.current;
    if (!st) return;
    const targetProgress = (index + 0.25) / TIMELINE_DURATION;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(targetScroll, { duration: 1.2 });
    else window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  useParallax(orbitRef, { rotate: [0, 10], start: "top bottom", end: "bottom top", scrub: 1 });

  useEffect(() => {
    if (!showPinned) return;
    const items = navRef.current?.querySelectorAll<HTMLElement>(".specs-index-item");
    if (!items || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, x: -16 });
      gsap.to(items, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: navRef.current, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }, navRef);

    return () => ctx.revert();
  }, [showPinned]);

  // Pinned editorial catalogue: one ~100vh scroll slice per category. Every
  // category's image + content panel is pre-rendered and stacked; scroll
  // progress crossfades between adjacent layers (opacity/scale/transform
  // only — no display toggling), so reverse scroll scrubs identically.
  useEffect(() => {
    if (!showPinned) return;
    const section = sectionRef.current;
    if (!section) return;
    const images = imageLayerRefs.current;
    const contents = contentLayerRefs.current;
    const navItems = navItemRefs.current;
    const ghost = ghostNumberRef.current;
    if (images.length < TOTAL || contents.length < TOTAL) return;

    const ctx = gsap.context(() => {
      gsap.set(images[0], { opacity: 1, scale: 1, x: 0 });
      gsap.set(contents[0], { opacity: 1, y: 0 });
      for (let i = 1; i < TOTAL; i++) {
        gsap.set(images[i], { opacity: 0, scale: 1.05, x: 20 });
        gsap.set(contents[i], { opacity: 0, y: 25 });
      }
      if (ghost) gsap.set(ghost, { opacity: 0.045, scale: 1 });

      let activeIndex = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // ScrollTrigger's "+=" relative end doesn't parse a "vh" suffix — it's
          // pixels only — so this is computed from innerHeight and re-evaluated
          // on every refresh (function form) to stay correct across resizes.
          end: () => `+=${window.innerHeight * TIMELINE_DURATION}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            // Derive the active index from the timeline's own (scrub-lagged)
            // position, not the raw scroll progress — scrub smoothing means the
            // visible crossfade trails the scroll input, so using self.progress
            // here would desync the nav/ghost number from what's actually shown.
            const idx = Math.min(TOTAL - 1, Math.floor(tl.time()));
            if (idx !== activeIndex) {
              activeIndex = idx;
              navItems.forEach((btn, i) => btn?.classList.toggle("is-active", i === idx));
              // Text content, not a tween: set directly from idx (not via a
              // one-shot .call() on the timeline) so it corrects itself the
              // same way in either scroll direction, including fast reverses
              // that skip past the exact transition midpoint.
              if (ghost) ghost.textContent = SPEC_CATEGORIES[idx].index;
            }
          },
        },
      });
      pinTriggerRef.current = tl.scrollTrigger ?? null;

      for (let i = 0; i < TOTAL - 1; i++) {
        const label = `cat${i}`;
        tl.addLabel(label, i + HOLD_FRACTION);
        tl.to(images[i], { opacity: 0, scale: 1.05, x: -20, duration: TRANS_HALF, ease: "power3.inOut" }, label);
        tl.to(contents[i], { opacity: 0, y: -25, duration: TRANS_HALF, ease: "power3.inOut" }, label);
        if (ghost) tl.to(ghost, { opacity: 0.02, scale: 0.96, duration: TRANS_HALF, ease: "power3.inOut" }, label);

        const midLabel = `${label}+=${TRANS_HALF}`;
        tl.fromTo(images[i + 1], { opacity: 0, scale: 1.05, x: 20 }, { opacity: 1, scale: 1, x: 0, duration: TRANS_HALF, ease: "power3.inOut" }, midLabel);
        tl.fromTo(contents[i + 1], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: TRANS_HALF, ease: "power3.inOut" }, midLabel);
        if (ghost) tl.to(ghost, { opacity: 0.08, scale: 1, duration: TRANS_HALF, ease: "power3.inOut" }, midLabel);
      }
      tl.set({}, {}, TIMELINE_DURATION);

      // App.tsx already refreshes ScrollTrigger globally on load/fonts-ready;
      // this section's images load lazily though, so refresh again once they
      // do, in case that shifts anything before the initial global refresh.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh()).catch(() => {});
    }, section);

    return () => {
      pinTriggerRef.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPinned]);

  // Mobile carousel: autoplay advances one card at a time; a real touch/pointer
  // gesture pauses it immediately, and it resumes ~3s after the resulting
  // scroll settles (whether that settle came from a swipe or an arrow click).
  useEffect(() => {
    if (!showCarousel) return;
    const track = trackRef.current;
    if (!track) return;

    const state = carouselStateRef.current;
    state.index = 0;
    state.paused = false;

    const onPointerDown = () => {
      state.paused = true;
      carouselClearAdvance();
    };

    const onScroll = () => {
      if (state.settleTimer) clearTimeout(state.settleTimer);
      state.settleTimer = setTimeout(() => {
        const first = cardRefs.current[0];
        const second = cardRefs.current[1];
        const step = first && second ? second.offsetLeft - first.offsetLeft : track.clientWidth;
        const previousIndex = state.index;
        state.index = Math.min(TOTAL - 1, Math.max(0, Math.round(track.scrollLeft / (step || 1))));
        // A genuine swipe landed on a different card than goTo() last set —
        // give it the same content reveal goTo() gives autoplay/arrow moves.
        if (state.index !== previousIndex) carouselAnimateCardIn(state.index);
        if (state.paused) {
          if (state.advanceTimer) clearTimeout(state.advanceTimer);
          state.advanceTimer = setTimeout(() => {
            state.paused = false;
            carouselScheduleAdvance();
          }, CAROUSEL_RESUME_MS);
        }
      }, 130);
    };

    track.addEventListener("pointerdown", onPointerDown, { passive: true });
    track.addEventListener("scroll", onScroll, { passive: true });
    carouselAnimateCardIn(0);
    carouselScheduleAdvance();

    return () => {
      carouselClearAdvance();
      if (state.settleTimer) clearTimeout(state.settleTimer);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCarousel]);

  return (
    <section id="specifications" className="specs" aria-labelledby="specs-title" ref={sectionRef}>
      <div className="specs-spread">
        <div className="specs-micro" aria-hidden="true">Homes <i /> People <i /> A brighter tomorrow</div>
        <FadeIn as="header" className="specs-head">
          <span className="eyebrow is-accent">Specifications <i /></span>
          <h2 id="specs-title" className="specs-title">Every detail, specified with intent.</h2>
        </FadeIn>

        {showCarousel ? (
          <div className="specs-carousel" aria-roledescription="carousel" aria-label="Specification categories">
            <div ref={trackRef} className="specs-carousel-track">
              {SPEC_CATEGORIES.map((cat, i) => {
                const visual = SPEC_VISUALS[cat.id];
                return (
                  <div key={cat.id} ref={(el) => { cardRefs.current[i] = el; }} className="specs-carousel-card">
                    <span className="specs-carousel-number">{cat.index}</span>
                    <span className="specs-content-category">{cat.title}</span>
                    <div className="specs-carousel-image">
                      {visual.kind === "image" ? (
                        <img src={visual.src} alt={visual.alt} loading={i === 0 ? "eager" : "lazy"} style={{ objectPosition: visual.focal }} />
                      ) : (
                        <div className="specs-carousel-editorial"><p>{visual.quote}</p></div>
                      )}
                    </div>
                    <div className="specs-carousel-bullets">
                      <ul className="specs-content-list">
                        {mobileOrderedItems(cat.items).map((item) => (
                          <li key={item} className={item === HIGHLIGHT_ITEM ? "is-highlight" : ""}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="specs-carousel-controls">
                      <div className="specs-carousel-progress">
                        <span><b>{cat.index}</b> / {String(TOTAL).padStart(2, "0")}</span>
                        <div className="specs-carousel-bar"><div className="specs-carousel-bar-fill" style={{ width: `${((i + 1) / TOTAL) * 100}%` }} /></div>
                      </div>
                      <div className="specs-carousel-arrows">
                        <button type="button" aria-label="Previous specification" onClick={() => carouselOnArrowClick(-1)}><span aria-hidden="true">←</span></button>
                        <button type="button" aria-label="Next specification" onClick={() => carouselOnArrowClick(1)}><span aria-hidden="true">→</span></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : showSimpleList ? (
          <div className="specs-mobile-list">
            {SPEC_CATEGORIES.map((cat) => {
              const visual = SPEC_VISUALS[cat.id];
              return (
                <FadeIn key={cat.id} as="article" className="specs-mobile-item">
                  <div className="specs-mobile-head">
                    <span className="specs-mobile-number">{cat.index}</span>
                    <h3 className="specs-mobile-title">{cat.title}</h3>
                  </div>
                  {visual.kind === "image" ? (
                    <img className="specs-mobile-image" src={visual.src} alt={visual.alt} loading="lazy" style={{ objectPosition: visual.focal }} />
                  ) : (
                    <p className="specs-mobile-editorial">{visual.quote}</p>
                  )}
                  <ul className="specs-content-list">
                    {mobileOrderedItems(cat.items).map((item) => (
                      <li key={item} className={item === HIGHLIGHT_ITEM ? "is-highlight" : ""}>{item}</li>
                    ))}
                  </ul>
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="specs-body">
            <div className="specs-navigation">
              <nav ref={navRef} className="specs-index" aria-label="Specification categories">
                {SPEC_CATEGORIES.map((cat, i) => (
                  <button key={cat.id} ref={(el) => { navItemRefs.current[i] = el; }}
                    className={`specs-index-item ${i === 0 ? "is-active" : ""}`}
                    aria-controls="specs-selected"
                    onClick={() => jumpTo(i)}>
                    <span className="specs-index-number">{cat.index}</span>
                    <span className="specs-index-title">{cat.title}</span>
                  </button>
                ))}
              </nav>
              <div className="specs-brand" aria-hidden="true">Elysium Celeste <i /></div>
            </div>

            <figure className="specs-hero-image">
              {SPEC_CATEGORIES.map((cat, i) => {
                const visual = SPEC_VISUALS[cat.id];
                return (
                  <div key={cat.id} ref={(el) => { imageLayerRefs.current[i] = el; }} className="specs-image-layer">
                    {visual.kind === "image" ? (
                      <img src={visual.src} alt={visual.alt} style={{ objectPosition: visual.focal }} loading={i === 0 ? "eager" : "lazy"} />
                    ) : (
                      <div className="specs-editorial-visual">
                        <span aria-hidden="true">{cat.index}</span>
                        <p>{visual.quote}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </figure>

            <div id="specs-selected" className="specs-content" aria-live="polite" aria-atomic="true">
              <span ref={ghostNumberRef} className="specs-ghost-number" aria-hidden="true">{SPEC_CATEGORIES[0].index}</span>
              <div className="specs-content-stack">
                {SPEC_CATEGORIES.map((cat, i) => {
                  const visual = SPEC_VISUALS[cat.id];
                  return (
                    <div key={cat.id} ref={(el) => { contentLayerRefs.current[i] = el; }} className="specs-content-inner specs-content-layer">
                      <span className="specs-content-index">{cat.index}</span>
                      <span className="specs-content-category">{cat.title}</span>
                      <h3 className="specs-content-title">{cat.title}</h3>
                      <ul className="specs-content-list">
                        {cat.items.map((item) => (
                          <li key={item} className={item === HIGHLIGHT_ITEM ? "is-highlight" : ""}>{item}</li>
                        ))}
                      </ul>
                      <div className="specs-detail-composition">
                        {visual.kind === "image" ? (
                          <img className="specs-detail-image" src={cat.id === "common" ? evChargingConcept : visual.src} alt={cat.id === "common" ? "AI-generated concept of EV charging in a residential parking bay" : ""} loading="lazy" style={{ objectPosition: cat.id === "common" ? "center" : visual.focal }} />
                        ) : (
                          <div className="specs-detail-editorial" aria-hidden="true"><span>{cat.index}</span></div>
                        )}
                        <div className="specs-editorial-note"><span>Elysium<br />Celeste</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="specs-side-note" aria-hidden="true">R.S.<br />Puram<i />Coimbatore</div>
            </div>
          </div>
        )}
        <div ref={orbitRef} className="specs-orbit" aria-hidden="true" />
      </div>
    </section>
  );
}
