import { useRef } from "react";
import buildingNight from "../assets/images/building-night.webp";
import FadeIn from "../components/FadeIn";
import { CONTACT } from "../data/content";
import { useEnquiryModal } from "../lib/EnquiryModalContext";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Enquiry.css";

export default function Enquiry() {
  const { openModal } = useEnquiryModal();
  const imageRef = useRef<HTMLImageElement>(null);

  useScrollReveal(imageRef, {
    from: { scale: 1.12 },
    to: { scale: 1 },
    duration: 1.4,
    start: "top 90%",
  });

  return (
    <section id="enquiry" className="enquiry">
      <img ref={imageRef} src={buildingNight} alt="Elysium Celeste, R.S. Puram, Coimbatore" className="enquiry-image" />
      <div className="enquiry-scrim" aria-hidden="true" />

      <div className="enquiry-content section-pad">
        <FadeIn as="span" className="eyebrow enquiry-eyebrow">
          Elysium
        </FadeIn>
        <FadeIn as="h2" className="enquiry-title" delay={40}>Celeste</FadeIn>

        <FadeIn as="div" className="enquiry-cta-row" delay={160}>
          <span className="enquiry-question">Interested?</span>
          <div className="enquiry-links">
            <button className="edge-link" onClick={openModal}>
              <span>Get in touch</span>
              <span className="edge-link-arrow">&#8594;</span>
            </button>
            <button className="edge-link" onClick={openModal}>
              <span>Book now</span>
              <span className="edge-link-arrow">&#8594;</span>
            </button>
          </div>
        </FadeIn>

        <FadeIn as="div" className="enquiry-details" delay={220}>
          <a href={`tel:${CONTACT.phoneMobileHref}`}>{CONTACT.phoneMobileDisplay}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <span>R.S. Puram, Coimbatore</span>
          <span className="enquiry-office-address">{CONTACT.address}</span>
        </FadeIn>
      </div>

      <div className="enquiry-location">
        <span>R.S. Puram<br />Coimbatore</span>
        <span className="enquiry-coordinates">
          {CONTACT.coordinates.split(" N ").map((part, i) => (
            <span key={part}>{part}{i === 0 ? " N" : ""}</span>
          ))}
        </span>
      </div>
    </section>
  );
}
