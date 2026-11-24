import { BriefcaseBusiness, Building2, Gem, Shirt } from "lucide-react";

const audiences = [
  { label: "Independent sellers", icon: BriefcaseBusiness },
  { label: "Retail teams", icon: Building2 },
  { label: "Fashion & beauty", icon: Shirt },
  { label: "Growing brands", icon: Gem },
];

export function SocialProof() {
  return (
    <section className="social-proof" aria-label="Businesses Flash is designed to support">
      <div className="social-proof-inner">
        <p>Designed for the people moving commerce forward.</p>
        <div className="capability-list">
          {audiences.map(({ label, icon: Icon }) => (
            <span className="capability" key={label}><Icon size={16} strokeWidth={1.7} />{label}</span>
          ))}
        </div>
        <span className="market-note">Nigeria first <i /> Africa next <i /> Global in view</span>
      </div>
    </section>
  );
}
