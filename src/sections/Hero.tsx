import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import buildingDay from "../assets/images/building-day.webp";
import { CONTACT } from "../data/content";
import { gsap, ScrollTrigger } from "../lib/smoothScroll";
import { usePrefersReducedMotion, useIsTouchDevice } from "../lib/hooks";
import { EASE_CINEMATIC, EASE_SOFT } from "../animations/ease";
import "./Hero.css";

function FieldIcon({ kind }: { kind: "person" | "phone" | "mail" | "message" | "city" }) {
  const paths = {
    person: "M16 21v-2a6 6 0 0 0-12 0v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    phone: "M7 2h10v20H7zM10 5h4M11 19h2",
    mail: "M3 5h18v14H3zM3 6l9 7 9-7",
    message: "M4 3h16v14H10l-5 4v-4H4zM7 7h10M7 11h7",
    city: "M4 21h16M6 21V9l6-4 6 4v12M10 21v-5h4v5M9 12h.01M15 12h.01M9 8h.01M15 8h.01",
  };
  return <svg className="hero-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d={paths[kind]} /></svg>;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [interest, setInterest] = useState<"3bhk" | "4bhk">("4bhk");
  const [submitted, setSubmitted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Cinematic entrance timeline
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      gsap.set(
        [
          ".hero-image-frame",
          ".hero-image",
          ".hero-eyebrow",
          ".hero-celeste",
          ".hero-tagline",
          ".hero-supporting",
          ".hero-top-meta",
          ".hero-info",
          ".hero-enquiry",
        ],
        { clearProps: "all" }
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".hero-image-frame", { opacity: 0, scale: 1.08 });
      gsap.set(".hero-image", { scale: 1.08 });
      gsap.set([".hero-eyebrow", ".hero-tagline", ".hero-supporting"], { opacity: 0, y: 16 });
      gsap.set(".hero-celeste", { opacity: 0, y: 30, scale: 1.08 });
      gsap.set([".hero-top-meta", ".hero-info"], { opacity: 0, y: 10 });
      gsap.set(".hero-enquiry", { opacity: 0, y: 40, scale: 0.97 });

      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: EASE_CINEMATIC } });

      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.6 })
        .to(".hero-celeste", { opacity: 1, y: 0, scale: 1, duration: 0.95 }, "-=0.35")
        .to(".hero-image-frame", { opacity: 1, scale: 1, duration: 1.2 }, "-=0.9")
        .to(".hero-image", { scale: 1, duration: 1.2 }, "<")
        .to(".hero-tagline", { opacity: 1, y: 0, duration: 0.6 }, "-=0.55")
        .to(".hero-supporting", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to([".hero-top-meta", ".hero-info"], { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, "-=0.35")
        .to(".hero-enquiry", { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: EASE_SOFT }, "-=0.3");
    }, section);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Scroll-scrubbed architectural parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ctx = gsap.context(() => {
      const scrollVars = {
        trigger: section.querySelector(".hero-visual"),
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      };

      gsap.to(".hero-image", {
        yPercent: -8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: scrollVars,
      });
      gsap.to(".hero-ring", {
        yPercent: -14,
        rotate: 3,
        ease: "none",
        scrollTrigger: scrollVars,
      });
      gsap.to([".hero-eyebrow", ".hero-celeste", ".hero-tagline", ".hero-supporting"], {
        yPercent: -3,
        ease: "none",
        scrollTrigger: scrollVars,
      });
    }, section);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Desktop-only pointer parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion || isTouch) return;

    const image = section.querySelector<HTMLElement>(".hero-image");
    const ring = section.querySelector<HTMLElement>(".hero-ring");
    const info = section.querySelector<HTMLElement>(".hero-info");
    const topMeta = section.querySelector<HTMLElement>(".hero-top-meta");
    if (!image || !ring) return;

    const imageX = gsap.quickTo(image, "x", { duration: 0.9, ease: "power3.out" });
    const imageY = gsap.quickTo(image, "y", { duration: 0.9, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 1.1, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 1.1, ease: "power3.out" });
    const infoX = info ? gsap.quickTo(info, "x", { duration: 0.8, ease: "power3.out" }) : null;
    const infoY = info ? gsap.quickTo(info, "y", { duration: 0.8, ease: "power3.out" }) : null;
    const metaX = topMeta ? gsap.quickTo(topMeta, "x", { duration: 0.8, ease: "power3.out" }) : null;
    const metaY = topMeta ? gsap.quickTo(topMeta, "y", { duration: 0.8, ease: "power3.out" }) : null;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      imageX(nx * 8);
      imageY(ny * 8);
      ringX(nx * 14);
      ringY(ny * 14);
      infoX?.(nx * 5);
      infoY?.(ny * 5);
      metaX?.(nx * 5);
      metaY?.(ny * 5);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion, isTouch]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="hero" ref={sectionRef} className="hero">
      <div className="hero-visual">
        <div className="hero-image-frame">
          <img
            src={buildingDay}
            alt="Elysium Celeste, a stilt plus five-story residence, R.S. Puram, Coimbatore"
            className="hero-image"
          />
        </div>

        <svg className="hero-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
        </svg>
        <div className="hero-mobile-elevated">Elevated<br />Living<br />In<br />Coimbatore<i /></div>

        <div className="hero-top-meta">
          <span className="hero-coords">{CONTACT.coordinates}</span>
        </div>

        <aside className="hero-info" aria-label="Celeste location and architecture">
          <span className="hero-place">
            R.S. Puram
            <br />
            Coimbatore
          </span>
          <span className="hero-info-detail">Stilt + 5<br />Stories</span>
          <span className="hero-info-detail">RCC Framed<br />Structure</span>
        </aside>

        <div className="hero-type">
          <span className="hero-eyebrow">Elysium Properties</span>
          <h1 className="hero-celeste">Celeste</h1>
          <p className="hero-tagline">Where life always hits a high note</p>
          <p className="hero-supporting">
            Elysium Celeste is more than just a home. It is a place where life blossoms in its entirety.
          </p>
        </div>
      </div>

      <div className="hero-enquiry">
        {submitted ? (
          <div className="hero-enquiry-thanks">
            <span className="eyebrow is-accent">Thank you</span>
            <span className="hero-enquiry-thanks-title">We&rsquo;ll be in touch shortly.</span>
          </div>
        ) : (
          <>
            <div className="hero-enquiry-head">
              <h2 className="hero-enquiry-title">Register your interest</h2>
              <p className="hero-enquiry-sub">
                Only 10 homes at Celeste &mdash; leave your number and we&rsquo;ll call you back
                today.
              </p>
            </div>

            <form className="hero-enquiry-form" onSubmit={handleSubmit}>
              <label>
                Your Name
                <span className="hero-field-wrap"><FieldIcon kind="person" /><input type="text" name="name" placeholder="Your full name" required /></span>
              </label>
              <label>
                Phone Number
                <span className="hero-phone-field">
                  <span className="hero-phone-icon"><FieldIcon kind="phone" /></span>
                  <span className="hero-phone-prefix" aria-hidden="true">+91</span>
                  <input type="tel" name="phone" placeholder={mobile ? "Enter your mobile number" : "+91"} required />
                </span>
              </label>
              <label>
                Email Address
                <span className="hero-field-wrap"><FieldIcon kind="mail" /><input type="email" name="email" placeholder="your@email.com" /></span>
              </label>
              <label>
                City
                <span className="hero-field-wrap"><FieldIcon kind="city" /><input type="text" name="city" placeholder="Your city" /></span>
              </label>

              <div className="hero-enquiry-interest">
                <span className="hero-enquiry-interest-label">I&rsquo;m interested in</span>
                <div className="hero-enquiry-interest-toggle">
                  <button
                    type="button"
                    className={interest === "3bhk" ? "is-active" : ""}
                    aria-pressed={interest === "3bhk"}
                    onClick={() => setInterest("3bhk")}
                  >
                    3 BHK
                  </button>
                  <button
                    type="button"
                    className={interest === "4bhk" ? "is-active" : ""}
                    aria-pressed={interest === "4bhk"}
                    onClick={() => setInterest("4bhk")}
                  >
                    4 BHK
                  </button>
                </div>
              </div>

              <label className="hero-enquiry-message">
                Message (Optional)
                <span className="hero-field-wrap"><FieldIcon kind="message" />{mobile ? <textarea name="message" rows={3} placeholder="Tell us a bit about your requirements…" /> : <input type="text" name="message" placeholder="Tell us a bit about your requirements&hellip;" />}</span>
              </label>

              <button type="submit" className="hero-enquiry-submit">
                <span>Request a Private Conversation</span>
                <span className="hero-enquiry-submit-arrow" aria-hidden="true">
                  &#8594;
                </span>
              </button>
            </form>
          </>
        )}
      </div>
      <div className="hero-mobile-footer" aria-hidden="true"><i />Elysium Celeste<i /></div>
    </section>
  );
}
