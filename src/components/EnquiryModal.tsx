import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useEnquiryModal } from "../lib/EnquiryModalContext";
import "./EnquiryModal.css";

export default function EnquiryModal() {
  const { isOpen, closeModal } = useEnquiryModal();
  const [submitted, setSubmitted] = useState(false);
  const [interest, setInterest] = useState<"3bhk" | "4bhk">("4bhk");

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="enquiry-modal" role="dialog" aria-modal="true" onClick={closeModal}>
      <div className="enquiry-modal-panel" onClick={(e) => e.stopPropagation()}>
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
          <form onSubmit={handleSubmit}>
            <span className="eyebrow is-accent">Enquire</span>
            <h3>Tell us about you.</h3>
            <label>
              Name
              <input type="text" name="name" required />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" required />
            </label>
            <label>
              Email
              <input type="email" name="email" />
            </label>
            <label>
              City
              <input type="text" name="city" />
            </label>

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

            <label>
              Message (Optional)
              <textarea name="message" rows={3} placeholder="Tell us a bit about your requirements…" />
            </label>

            <button type="submit" className="edge-link enquiry-submit">
              <span>Submit</span>
              <span className="edge-link-arrow">&#8594;</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
