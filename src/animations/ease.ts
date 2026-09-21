// Shared GSAP easing tokens, matching the CSS custom properties in index.css
// (--ease-soft / --ease-premium) so GSAP-driven motion feels identical to the
// site's existing CSS transitions.

export const EASE_SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_PREMIUM = "cubic-bezier(0.16, 1, 0.3, 1)";

// A slightly slower, more "camera-like" ease for large architectural moves
// (hero settle, image scale-ins). Restrained — no bounce/elastic.
export const EASE_CINEMATIC = "cubic-bezier(0.19, 1, 0.22, 1)";
