"use client";

import { ArrowUpRight, BarChart3, CircleHelp, Sparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

const performance = [
  { name: "Linen two-piece set", units: "48 sold", revenue: "₦1,240,000", width: "84%", tone: "performance-fill--one" },
  { name: "Woven leather slides", units: "37 sold", revenue: "₦986,000", width: "67%", tone: "performance-fill--two" },
  { name: "Everyday tote", units: "31 sold", revenue: "₦697,500", width: "48%", tone: "performance-fill--three" },
];

const weeklyBars = [38, 51, 45, 70, 56, 83, 64, 92, 70, 100, 78, 88];

export function AnalyticsReporting() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 72%", once: true },
      defaults: { ease: "power2.out" },
    });
    timeline
      .fromTo(
        section.querySelector(".analytics-chart-summary"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45 },
      )
      .fromTo(
        section.querySelectorAll(".analytics-bars i"),
        { scaleY: 0 },
        { scaleY: 1, duration: 0.55, stagger: 0.045, transformOrigin: "bottom center" },
        0.14,
      )
      .fromTo(
        section.querySelectorAll(".performance-row"),
        { opacity: 0, x: 20, clipPath: "inset(0 14% 0 0)" },
        { opacity: 1, x: 0, clipPath: "inset(0 0 0 0)", duration: 0.48, stagger: 0.12 },
        0.48,
      );
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="analytics-story section-space" id="analytics" ref={sectionRef}>
      <div className="container analytics-layout">
        <div className="analytics-copy">
          <SectionHeading
            align="left"
            eyebrow="Analytics & reporting"
            title="See the patterns behind performance."
            description="Follow sales over time, understand which products are contributing, and use clearer reports to decide what to do next."
          />
          <div className="analytics-benefit"><Sparkles size={15} /><span><b>Product performance</b><small>Compare revenue, units sold, and sample margins.</small></span></div>
          <div className="analytics-benefit"><BarChart3 size={15} /><span><b>Business trends</b><small>Read sales activity over a chosen period.</small></span></div>
          <p className="planned-note"><CircleHelp size={14} /> Analytics shown are product concepts using sample data.</p>
        </div>
        <div className="analytics-demo">
          <div className="analytics-demo-heading">
            <div><span className="demo-overline">SAMPLE REPORT</span><h3>Product performance</h3></div>
            <span className="demo-period">This month <ArrowUpRight size={12} /></span>
          </div>
          <div className="analytics-chart-summary"><span>Sales revenue</span><b>₦2,923,500</b><small>Top three products · sample figures</small></div>
          <div className="analytics-bars" aria-hidden="true">
            {weeklyBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
          <div className="analytics-axis"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
          <div className="performance-list">
            {performance.map((item) => (
              <div className="performance-row" key={item.name}>
                <span className="performance-name"><b>{item.name}</b><small>{item.units}</small></span>
                <span className="performance-track"><i className={item.tone} style={{ width: item.width }} /></span>
                <strong>{item.revenue}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
