import { ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const plans = [
  {
    name: "Starter",
    price: "To be announced",
    period: "Nigeria-first pricing",
    note: "A considered foundation for independent sellers.",
    features: ["Storefront and product catalog", "Inventory and order visibility", "Essential sales summaries"],
    featured: false,
    href: "#storefront",
  },
  {
    name: "Growth",
    price: "To be announced",
    period: "Nigeria-first pricing",
    note: "More clarity across a growing operation.",
    features: ["Everything in Starter", "Financial and margin visibility", "Inventory movement and reporting"],
    featured: true,
    href: "#finance",
  },
  {
    name: "Business",
    price: "To be announced",
    period: "Plan in development",
    note: "For established teams with broader needs.",
    features: ["Expanded operational visibility", "Deeper product performance", "Plan details coming soon"],
    featured: false,
    href: "#faq",
  },
];

export function Pricing() {
  return (
    <section className="pricing-section section-space" id="pricing">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing direction"
          title="Plans shaped around how you grow."
          description="Flash is being built Nigeria first. Plan structure and pricing will be shared when availability is confirmed."
        />
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card${plan.featured ? " pricing-card--featured" : ""}`} key={plan.name}>
              {plan.featured ? <span className="popular-tag">Illustrative plan</span> : <span className="pricing-spacer" />}
              <h3>{plan.name}</h3>
              <p>{plan.note}</p>
              <div className="plan-price plan-price--tba">{plan.price}<small>{plan.period}</small></div>
              <a className={`button plan-button${plan.featured ? " button--primary" : " button--outline"}`} href={plan.href}>
                {plan.name === "Business" ? "Read product direction" : "Explore " + plan.name}
                <ArrowUpRight size={15} />
              </a>
              <div className="plan-divider" />
              <span className="plan-includes">INCLUDES</span>
              <ul>
                {plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <p className="pricing-disclaimer">Plan names and inclusions are illustrative product direction. Prices have not been set, and no purchase or payment flow is available in this preview.</p>
      </div>
    </section>
  );
}
