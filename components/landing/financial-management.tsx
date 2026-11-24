"use client";

import { ArrowDownRight, ArrowUpRight, CircleHelp, WalletCards } from "lucide-react";
import { useCallback, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

const financeItems = [
  { label: "Revenue", value: "₦4,860,000", change: "8.2%", direction: "up" },
  { label: "Cost of goods sold", value: "₦2,120,000", change: "3.6%", direction: "down" },
  { label: "Operating expenses", value: "₦890,000", change: "1.4%", direction: "down" },
  { label: "Net profit", value: "₦1,850,000", change: "11.8%", direction: "up" },
];

const marginItems = [
  { name: "Linen two-piece set", margin: "42%", tone: "margin-strong" },
  { name: "Everyday tote", margin: "36%", tone: "margin-mid" },
  { name: "Woven leather slides", margin: "29%", tone: "margin-light" },
];

export function FinancialManagement() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 74%", once: true },
      defaults: { ease: "power3.out" },
    });
    timeline
      .fromTo(
        section.querySelectorAll(".finance-metrics article"),
        { opacity: 0, y: 18, rotateX: -8 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.52, stagger: 0.1 },
      )
      .fromTo(
        section.querySelectorAll(".finance-detail-card"),
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.62, stagger: 0.14 },
        0.36,
      )
      .fromTo(
        section.querySelectorAll(".margin-track i"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, stagger: 0.12, transformOrigin: "left center" },
        0.58,
      );
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="finance-story section-space" id="finance" ref={sectionRef}>
      <div className="container">
        <div className="finance-story-heading">
          <div>
            <span className="finance-eyebrow"><WalletCards size={15} /> FINANCIAL MANAGEMENT</span>
            <SectionHeading
              align="left"
              eyebrow="Know your numbers"
              title="Revenue is only part of the story."
              description="See the relationship between what you sell, what it costs, what you spend, and what your business keeps."
            />
          </div>
          <span className="finance-note"><CircleHelp size={14} /> Product direction · Sample NGN figures</span>
        </div>
        <div className="finance-board">
          <div className="finance-board-top">
            <div><span className="demo-overline">OCTOBER 2026 · DEMO STORE</span><h3>Financial overview</h3></div>
            <span className="finance-range">This month <ArrowUpRight size={13} /></span>
          </div>
          <div className="finance-metrics">
            {financeItems.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small className={item.direction === "up" ? "finance-positive" : "finance-neutral"}>
                  {item.direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.change} <i>illustrative change</i>
                </small>
              </article>
            ))}
          </div>
          <div className="finance-details">
            <div className="finance-detail-card">
              <div className="finance-detail-heading"><span>Working capital signals</span><small>Sample store snapshot</small></div>
              <div className="finance-detail-row"><span><i className="detail-dot detail-dot--violet" /> Inventory valuation</span><b>₦3,420,000</b></div>
              <div className="finance-detail-row"><span><i className="detail-dot detail-dot--amber" /> Outstanding payments</span><b>₦386,000</b></div>
              <div className="finance-detail-row"><span><i className="detail-dot detail-dot--green" /> Gross profit</span><b>₦2,740,000</b></div>
            </div>
            <div className="finance-detail-card finance-margin-card">
              <div className="finance-detail-heading"><span>Product margins</span><small>Illustrative</small></div>
              {marginItems.map((item) => (
                <div className="margin-row" key={item.name}>
                  <span>{item.name}</span>
                  <div className="margin-track"><i className={item.tone} /></div>
                  <b>{item.margin}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="finance-disclaimer">Illustrative dashboard concept only. Flash is in development; financial calculations, reconciliation, and availability have not been released.</p>
      </div>
    </section>
  );
}
