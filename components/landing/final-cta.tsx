"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useCallback, useRef } from "react";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
      defaults: { ease: "power3.out" },
    });
    timeline
      .fromTo(
        section.querySelector(".final-cta-content"),
        { opacity: 0, x: -28, clipPath: "inset(0 12% 0 0)" },
        { opacity: 1, x: 0, clipPath: "inset(0 0 0 0)", duration: 0.8 },
      )
      .fromTo(
        section.querySelector(".cta-side-note"),
        { opacity: 0, x: 22 },
        { opacity: 1, x: 0, duration: 0.6 },
        0.2,
      )
      .fromTo(
        section.querySelectorAll(".cta-orb"),
        { scale: 0.86, opacity: 0.35 },
        { scale: 1, opacity: 1, duration: 1.1, stagger: 0.14 },
        0,
      );
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="final-cta-section" id="get-started" ref={sectionRef}>
      <div className="container">
        <div className="final-cta-card">
          <div className="cta-orb cta-orb--one" aria-hidden="true" />
          <div className="cta-orb cta-orb--two" aria-hidden="true" />
          <div className="final-cta-content">
            <span className="cta-eyebrow"><i /> The system behind every sale</span>
            <h2>Run your store.<br />Know your numbers.</h2>
            <p>See how Flash is being designed for the work behind every sale.</p>
            <a className="button button--light" href="#dashboard">Explore the platform <ArrowUpRight size={16} /></a>
            <span className="cta-footnote"><Check size={13} /> In development · No account or payment required</span>
          </div>
          <div className="cta-side-note"><span>BUILT WITH NIGERIA IN VIEW</span><b>Made for today.<br />Ready for what’s next.</b><i>NG → AFRICA → WORLD</i></div>
        </div>
      </div>
    </section>
  );
}
