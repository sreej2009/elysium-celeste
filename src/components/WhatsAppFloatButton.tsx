import { CONTACT } from "../data/content";
import "./WhatsAppFloatButton.css";

export default function WhatsAppFloatButton() {
  const whatsappHref = `https://wa.me/${CONTACT.phoneMobileHref.replace("+", "")}?text=${encodeURIComponent(
    "Hi, I'm interested in Elysium Celeste."
  )}`;

  return (
    <a
      className="whatsapp-float"
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-cursor="WhatsApp"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="whatsapp-float-icon">
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91C21.92 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.02.24-3.42-.71-2.9-1.16-4.76-4.1-4.9-4.29-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.09 1.65.78 1.94.92.29.14.48.22.55.34.07.12.07.7-.16 1.37Z"
        />
      </svg>
      <span className="whatsapp-float-label">WhatsApp</span>
    </a>
  );
}
