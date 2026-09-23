import { CONTACT } from "../data/content";
import elysiumLogo from "../assets/logo/Elysiumlogo.png";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer section-pad">
      <div className="site-footer-top">
        <img src={elysiumLogo} alt="Elysium Properties" className="site-footer-logo" />
        <div className="site-footer-info">
          <div className="site-footer-mark">
            <span className="site-footer-name">Elysium Celeste</span>
            <span className="site-footer-place">Coimbatore</span>
          </div>
          <div className="site-footer-contact">
            <a href={`tel:${CONTACT.phoneMobileHref}`}>{CONTACT.phoneMobileDisplay}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>&copy; {new Date().getFullYear()} Elysium Properties. All rights reserved.</span>
        <span>Visuals are artistic impressions for representation purposes only.</span>
      </div>
    </footer>
  );
}
