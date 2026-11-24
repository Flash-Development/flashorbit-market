"use client";

import { ArrowUpRight, Check, Globe2, Smartphone, Sparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

const storefrontBenefits = [
  "A dedicated storefront for your business",
  "Your brand, products, and store details in one place",
  "Responsive shopping experience across screen sizes",
];

export function StorefrontManagement() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 72%", once: true },
      defaults: { ease: "power3.out" },
    });
    timeline
      .fromTo(
        section.querySelector(".store-builder-demo"),
        { clipPath: "inset(0 0 18% 0 round 14px)", y: 28, scale: 0.97 },
        { clipPath: "inset(0 0 0 0 round 14px)", y: 0, scale: 1, duration: 0.85 },
      )
      .fromTo(
        section.querySelector(".store-preview-object"),
        { y: 24, rotate: -4, scale: 0.92 },
        { y: 0, rotate: 5, scale: 1, duration: 0.8 },
        0.12,
      )
      .fromTo(
        section.querySelectorAll(".store-preview-products > div"),
        { opacity: 0, x: 18 },
        { opacity: 1, x: 0, duration: 0.48, stagger: 0.13 },
        0.42,
      );
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="story-section story-section--store" id="storefront" ref={sectionRef}>
      <div className="container story-grid">
        <div className="story-copy">
          <SectionHeading
            align="left"
            eyebrow="Storefront management"
            title="Your own corner of the internet."
            description="A dedicated online store gives your brand a place to tell its story, bring its catalog together, and meet customers on any screen."
          />
          <ul className="story-checklist">
            {storefrontBenefits.map((benefit) => (
              <li key={benefit}><Check size={15} />{benefit}</li>
            ))}
          </ul>
          <p className="planned-note"><Globe2 size={14} /> Custom domain support is planned, not currently available.</p>
        </div>
        <div className="store-builder-demo" role="group" aria-label="Illustrative responsive online storefront">
          <div className="builder-toolbar">
            <span className="builder-dots"><i /><i /><i /></span>
            <span>STORE PREVIEW</span>
            <span className="demo-pill"><Sparkles size={10} /> CONCEPT</span>
          </div>
          <div className="store-preview">
            <div className="store-preview-nav"><b>STUDIO / NO. 04</b><span>SHOP&nbsp;&nbsp; ABOUT&nbsp;&nbsp; CONTACT</span><Smartphone size={13} /></div>
            <div className="store-preview-hero">
              <span className="store-preview-overline">MADE TO BE WORN</span>
              <h3>Everyday,<br />with intention.</h3>
              <span className="store-preview-link">EXPLORE THE COLLECTION <ArrowUpRight size={10} /></span>
              <div className="store-preview-object" aria-hidden="true"><i /><b>04</b></div>
            </div>
            <div className="store-preview-products">
              <div><i className="store-swatch store-swatch--clay" /><span><b>Relaxed linen shirt</b><small>Sand · 4 sizes</small></span><strong>₦48,000</strong></div>
              <div><i className="store-swatch store-swatch--olive" /><span><b>Everyday tote</b><small>Olive · In stock</small></span><strong>₦22,500</strong></div>
            </div>
          </div>
          <div className="store-builder-foot"><span>Responsive layout</span><span>Sample storefront concept</span></div>
        </div>
      </div>
    </section>
  );
}
