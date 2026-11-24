import { ArrowUpRight, Boxes, ChartNoAxesCombined, Store } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const pillars = [
  {
    number: "01",
    icon: Store,
    title: "A store that’s yours.",
    text: "Give your brand a dedicated online home, with your catalog and identity at the center of the experience.",
    tag: "Your brand, your storefront",
  },
  {
    number: "02",
    icon: Boxes,
    title: "Operations that stay connected.",
    text: "Keep products, stock, and orders in view together—so the details behind each sale are easier to follow.",
    tag: "Products to fulfillment",
  },
  {
    number: "03",
    icon: ChartNoAxesCombined,
    title: "Numbers you can act on.",
    text: "Bring revenue, costs, and product performance into a clearer picture of how your business is doing.",
    tag: "Know the story behind a sale",
  },
];

export function ValueProposition() {
  return (
    <section className="value-section section-space" id="why-flash">
      <div className="container">
        <SectionHeading
          eyebrow="The Flash approach"
          title="The system behind every sale."
          description="Your storefront is only one part of the business. Flash brings commerce, inventory, and financial management into one connected view."
        />
        <div className="value-grid">
          {pillars.map(({ number, icon: Icon, title, text, tag }) => (
            <article className="value-card" key={number}>
              <div className="value-card-top"><span>{number}</span><Icon size={20} strokeWidth={1.7} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="value-card-tag"><i />{tag}<ArrowUpRight size={13} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
