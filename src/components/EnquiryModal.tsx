import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useEnquiryModal } from "../lib/EnquiryModalContext";
import { gsap } from "../lib/smoothScroll";
import { usePrefersReducedMotion } from "../lib/hooks";
import "./EnquiryModal.css";

const MESSAGE_LIMIT = 300;

function FieldIcon({ kind }: { kind: "person" | "phone" | "mail" | "location" | "lock" }) {
  const paths = {
    person: "M16 21v-2a6 6 0 0 0-12 0v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    phone: "M7 2h10v20H7zM10 5h4M11 19h2",
    mail: "M3 5h18v14H3zM3 6l9 7 9-7",
    location: "M12 21s7-7.1 7-12a7 7 0 1 0-14 0c0 4.9 7 12 7 12Z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    lock: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v3",
  };
  return (
    <svg className="enquiry-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d={paths[kind]} />
    </svg>
  );
}

export default function EnquiryModal() {
  const { isOpen, closeModal } = useEnquiryModal();
  const [submitted, setSubmitted] = useState(false);
  const [interest, setInterest] = useState<"3bhk" | "4bhk">("4bhk");
  const [messageLen, setMessageLen] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setInterest("4bhk");
      setMessageLen(0);
    }
  }, [isOpen]);

  // Entrance: the panel settles in with a soft rise + fade, then the form
  // fields stagger in just after. The backdrop's own blur/darken is left
  // exactly as it already behaves.
  useEffect(() => {
    if (!isOpen || reducedMotion) return;
    const panel = panelRef.current;
    if (!panel) return;
    const fields = panel.querySelectorAll(".enquiry-field, .enquiry-modal-interest, .enquiry-submit, .enquiry-privacy");
    const ctx = gsap.context(() => {
      gsap.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(
        fields,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.045, delay: 0.18, ease: "power2.out" }
      );
    }, panel);
    return () => ctx.revert();
  }, [isOpen, reducedMotion]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="enquiry-modal" role="dialog" aria-modal="true" onClick={closeModal}>
      <div ref={panelRef} className="enquiry-modal-panel" onClick={(e) => e.stopPropagation()}>
        <svg className="enquiry-modal-arc" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="100" cy="0" r="95" />
        </svg>
        <button className="enquiry-modal-close" onClick={closeModal} aria-label="Close">
          &times;
        </button>
        {submitted ? (
          <div className="enquiry-modal-thanks">
            <span className="eyebrow is-accent">Thank you</span>
            <h3>We&rsquo;ll be in touch shortly.</h3>
            <p>Our team at Elysium Properties will reach out to you soon.</p>
          </div>
        ) : (
          <>
            <div className="enquiry-modal-head">
              <span className="eyebrow is-accent">Enquire</span>
              <h3>Tell us about you.</h3>
              <p className="enquiry-modal-sub">Share your details and our team will get in touch with you shortly.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="enquiry-modal-row">
                <label className="enquiry-field">
                  <span>Your Name</span>
                  <span className="enquiry-field-wrap">
                    <FieldIcon kind="person" />
                    <input type="text" name="name" placeholder="Your Name" required />
                  </span>
                </label>
                <label className="enquiry-field">
                  <span>Phone Number</span>
                  <span className="enquiry-field-wrap">
                    <FieldIcon kind="phone" />
                    <input type="tel" name="phone" placeholder="Phone Number" required />
                  </span>
                </label>
              </div>

              <div className="enquiry-modal-row">
                <label className="enquiry-field">
                  <span>Email Address</span>
                  <span className="enquiry-field-wrap">
                    <FieldIcon kind="mail" />
                    <input type="email" name="email" placeholder="Email Address" />
                  </span>
                </label>
                <label className="enquiry-field">
                  <span>City</span>
                  <span className="enquiry-field-wrap">
                    <FieldIcon kind="location" />
                    <input type="text" name="city" placeholder="City" />
                  </span>
                </label>
              </div>

              <div className="enquiry-modal-interest">
                <span>I&rsquo;m interested in</span>
                <div className="enquiry-modal-interest-toggle">
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

              <label className="enquiry-field enquiry-field-message">
                <span>Message (Optional)</span>
                <textarea
                  name="message"
                  rows={3}
                  maxLength={MESSAGE_LIMIT}
                  placeholder="Tell us a bit about your requirements…"
                  onChange={(e) => setMessageLen(e.target.value.length)}
                />
                <span className="enquiry-char-count">
                  {messageLen} / {MESSAGE_LIMIT}
                </span>
              </label>

              <button type="submit" className="enquiry-submit">
                <span>Submit Enquiry</span>
                <span className="enquiry-submit-arrow" aria-hidden="true">&#8594;</span>
              </button>

              <p className="enquiry-privacy">
                <span className="enquiry-privacy-line" aria-hidden="true" />
                <FieldIcon kind="lock" />
                Your information is safe with us. We respect your privacy.
                <span className="enquiry-privacy-line" aria-hidden="true" />
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
