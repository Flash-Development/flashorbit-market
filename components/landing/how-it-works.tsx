import { ArrowRight, CircleUserRound, PackagePlus, Store, Tags } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  { number: "01", icon: CircleUserRound, title: "Set up your workspace", text: "Start with the basics of your business and the way you sell." },
  { number: "02", icon: Store, title: "Shape your storefront", text: "Bring in your brand, store details, and the catalog customers will see." },
  { number: "03", icon: Tags, title: "Organize products and stock", text: "Add product details, variants, and opening inventory." },
  { number: "04", icon: PackagePlus, title: "Manage what comes next", text: "Follow orders and understand sales, stock, and business finances." },
];

export function HowItWorks() {
  return (
    <section className="steps-section section-space" id="how-it-works">
      <div className="container">
        <SectionHeading
          eyebrow="How Flash is designed to work"
          title="A clearer path from setup to sale."
          description="A considered onboarding flow for the work of opening and running a store."
        />
        <div className="steps-grid">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <article className="step-card" key={number}>
              <div className="step-top"><span>{number}</span><Icon size={20} strokeWidth={1.65} />{index < steps.length - 1 ? <ArrowRight className="step-connector" size={16} /> : null}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
        <p className="planned-note">Illustrative product flow. Self-serve account creation is not available in this preview.</p>
      </div>
    </section>
  );
}
