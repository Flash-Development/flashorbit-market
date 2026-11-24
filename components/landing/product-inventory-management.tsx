"use client";

import { ArrowDown, ArrowUpRight, Boxes, CircleAlert, History, PackageCheck } from "lucide-react";
import { useCallback, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

const inventoryRows = [
  { sku: "APP-014", name: "Linen two-piece set", variants: "4 sizes · 2 colours", stock: 18, tone: "healthy" },
  { sku: "APP-021", name: "Everyday tote", variants: "2 colours", stock: 6, tone: "low" },
  { sku: "ACC-008", name: "Woven leather slides", variants: "5 sizes · 3 colours", stock: 32, tone: "healthy" },
];

export function ProductInventoryManagement() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 72%", once: true },
      defaults: { ease: "power2.out" },
    });
    timeline
      .fromTo(
        section.querySelectorAll(".inventory-summary > div"),
        { opacity: 0, y: 12, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.48, stagger: 0.12 },
      )
      .fromTo(
        section.querySelectorAll(".inventory-table tbody tr"),
        { opacity: 0, x: 18 },
        { opacity: 1, x: 0, duration: 0.45, stagger: 0.1 },
        0.3,
      )
      .fromTo(
        section.querySelector(".inventory-demo-footer"),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35 },
        0.76,
      );
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="story-section story-section--inventory" id="inventory" ref={sectionRef}>
      <div className="container story-grid story-grid--reverse">
        <div className="story-copy">
          <SectionHeading
            align="left"
            eyebrow="Products & inventory"
            title="Know what you have. See what’s moving."
            description="Keep product details and stock information connected—from variants and stock movement to low-stock alerts and inventory value."
          />
          <div className="inventory-points">
            <span><Boxes size={16} /> Product variants</span>
            <span><History size={16} /> Stock movement</span>
            <span><CircleAlert size={16} /> Low-stock alerts</span>
            <span><PackageCheck size={16} /> Inventory valuation</span>
          </div>
          <p className="planned-note">Illustrative inventory interface and demonstration figures.</p>
        </div>
        <div className="inventory-demo" role="group" aria-label="Sample product and inventory table">
          <div className="demo-panel-heading">
            <div><span className="demo-overline">PRODUCT CATALOG</span><h3>Stock overview</h3></div>
            <span className="demo-period">October 2026 <ArrowDown size={12} /></span>
          </div>
          <div className="inventory-summary">
            <div><span>Inventory value</span><b>₦3,420,000</b><small>Sample valuation</small></div>
            <div><span>Products to review</span><b className="inventory-warning">3 items</b><small>Below sample threshold</small></div>
          </div>
          <div className="inventory-table-scroll">
            <table className="inventory-table">
              <thead><tr><th>PRODUCT</th><th>VARIANTS</th><th>AVAILABLE</th></tr></thead>
              <tbody>
                {inventoryRows.map((item) => (
                  <tr key={item.sku}>
                    <td><span className={`inventory-product-icon inventory-product-icon--${item.tone}`}>{item.name.slice(0, 1)}</span><span><b>{item.name}</b><small>{item.sku}</small></span></td>
                    <td>{item.variants}</td>
                    <td><span className={`stock-count stock-count--${item.tone}`}>{item.stock} units</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="inventory-demo-footer"><span><i /> Updated in sample view</span><span>View stock movement <ArrowUpRight size={12} /></span></div>
        </div>
      </div>
    </section>
  );
}
