import { useEffect } from "react";
import Navigation from "./components/Navigation";
import ScrollProgress from "./components/ScrollProgress";
import EnquiryModal from "./components/EnquiryModal";
import MobileActionBar from "./components/MobileActionBar";
import WhatsAppFloatButton from "./components/WhatsAppFloatButton";
import Hero from "./sections/Hero";
import LocationSection from "./sections/LocationSection";
import Residences from "./sections/Residences";
import Availability from "./sections/Availability";
import Specifications from "./sections/Specifications";
import MaterialStory from "./sections/MaterialStory";
import Gallery from "./sections/Gallery";
import Enquiry from "./sections/Enquiry";
import Footer from "./components/Footer";
import { EnquiryModalProvider } from "./lib/EnquiryModalContext";
import { initSmoothScroll, ScrollTrigger } from "./lib/smoothScroll";

export default function App() {
  useEffect(() => {
    const cleanup = initSmoothScroll();
    const refresh = () => ScrollTrigger.refresh();

    window.addEventListener("load", refresh);
    document.fonts?.ready?.then(refresh).catch(() => {});

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cleanup();
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <EnquiryModalProvider>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <LocationSection />
        <Residences />
        <Availability />
        <Specifications />
        <MaterialStory />
        <Gallery />
        <Enquiry />
      </main>
      <Footer />
      <MobileActionBar />
      <WhatsAppFloatButton />
      <EnquiryModal />
    </EnquiryModalProvider>
  );
}
