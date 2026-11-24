"use client";

import { useCallback, useRef, type PropsWithChildren } from "react";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

type HeroEntranceProps = PropsWithChildren<{
  className?: string;
}>;

export function HeroEntrance({ children, className }: HeroEntranceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, root: HTMLElement) => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .fromTo(
        root.querySelectorAll<HTMLElement>("[data-hero-copy-line]"),
        { opacity: 0, yPercent: 115, rotateX: -16 },
        { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.92, stagger: 0.12 },
      )
      .fromTo(
        root.querySelector("[data-hero-scene]"),
        { opacity: 0, scale: 0.88, rotate: -2 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.05 },
        0.12,
      )
      .fromTo(
        root.querySelectorAll<HTMLElement>("[data-hero-support]"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.58, stagger: 0.11, clearProps: "transform" },
        0.38,
      );
  }, []);

  useGsapAnimation(rootRef, buildAnimation);

  return (
    <div className={className} ref={rootRef}>
      {children}
    </div>
  );
}
