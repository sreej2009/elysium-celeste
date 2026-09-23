import { useEffect, useState } from "react";
import { scrollToId } from "../lib/smoothScroll";
import elysiumLogo from "../assets/logo/Elysiumlogo.png";
import { useEnquiryModal } from "../lib/EnquiryModalContext";
import "./Navigation.css";

const LINKS = [
  { label: "Location", id: "location" },
  { label: "Residences", id: "residences" },
  { label: "Floor Plan", id: "floorplan" },
  { label: "Specifications", id: "specifications" },
  { label: "Interiors", id: "materials" },
  { label: "Completed Projects", id: "gallery" },
  { label: "Enquiry", id: "enquiry" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openModal } = useEnquiryModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${open ? "is-open-state" : ""}`}>
        <div className="nav-inner">
          <button className="nav-side nav-elysium" onClick={() => go("hero")}>
            <img src={elysiumLogo} alt="Elysium Properties" className="nav-logo" />
          </button>

          <div className="nav-side nav-actions">
            <button
              className="nav-enquire"
              onClick={() => {
                setOpen(false);
                openModal();
              }}
            >
              <span className="nav-enquire-label">Enquire</span>
              <span className="nav-enquire-arrow" aria-hidden="true">
                &#8594;
              </span>
            </button>
            <button
              className={`nav-menu-btn ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="nav-menu-btn-lines">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-overlay ${open ? "is-open" : ""}`}>
        <nav aria-label="Primary">
          <ul>
            {LINKS.map((l, i) => (
              <li key={l.id} style={{ transitionDelay: `${i * 0.035}s` }}>
                <button
                  onClick={() => {
                    if (l.id === "enquiry") {
                      setOpen(false);
                      openModal();
                    } else {
                      go(l.id);
                    }
                  }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-overlay-footer">
          <a href="tel:+918144000999">+91 8144 000 999</a>
          <a href="mailto:info@elysium.in">info@elysium.in</a>
        </div>
      </div>
    </>
  );
}
