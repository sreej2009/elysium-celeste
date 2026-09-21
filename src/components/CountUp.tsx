import { useEffect, useRef } from "react";
import { gsap } from "../lib/smoothScroll";

interface CountUpProps {
  value: number;
  decimals?: number;
  className?: string;
}

export default function CountUp({ value, decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: prev.current };
    const tween = gsap.to(obj, {
      val: value,
      duration: 1.1,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = obj.val.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
    });
    prev.current = value;
    return () => {
      tween.kill();
    };
  }, [value, decimals]);

  return <span ref={ref} className={className} />;
}
