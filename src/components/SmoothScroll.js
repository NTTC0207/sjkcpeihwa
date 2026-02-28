"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll Component
 * Integrates Lenis for momentum-based inertial scrolling.
 * Works seamlessly with Framer Motion and standard browser behaviors.
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4ba6
      direction: "vertical",
      gestureDirection: "vertical",
      smoothHover: true, // Smooth scrolling on hoverable elements
      smoothTouch: false, // Standard touch behavior is usually preferred on mobile
      touchMultiplier: 2,
    });

    // Handle scroll events for GSAP or Framer Motion if needed
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
