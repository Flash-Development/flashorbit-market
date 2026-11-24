import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const stores = [
  {
    category: "FASHION",
    name: "Aso & Form",
    description: "A focused storefront for a considered collection.",
    className: "showcase-fashion",
    art: <><div className="fashion-sun" /><div className="fashion-product"><span>SS</span></div><div className="fashion-product-small" /></>,
    cta: "Fashion & accessories",
  },
  {
    category: "ELECTRONICS",
    name: "Everyday Devices",
    description: "A clean catalog for products with more detail.",
    className: "showcase-tech",
    art: <><div className="tech-product"><div /></div><div className="tech-product-small" /></>,
    cta: "Electronics & gadgets",
  },
  {
    category: "BEAUTY",
    name: "Botanical Ritual",
    description: "A warm, brand-led home for daily essentials.",
    className: "showcase-beauty",
    art: <><div className="beauty-product"><i /><span>morrow<br /><small>BOTANICAL SERUM</small></span></div><div className="beauty-product-small" /></>,
    cta: "Beauty & personal care",
  },
];

export function StorefrontShowcase() {
  return (
    <section className="showcase-section section-space" id="storefronts">
      <div className="container">
        <div className="showcase-heading-row">
          <SectionHeading
            align="left"
            eyebrow="Storefront examples"
            title="One platform. Different kinds of stores."
            description="Explore illustrative storefront directions for fashion, electronics, and beauty businesses."
          />
          <a className="inline-link" href="#storefront">Explore storefront tools <ArrowUpRight size={15} /></a>
        </div>
        <div className="showcase-grid">
          {stores.map((store) => (
            <article className={`showcase-card ${store.className}`} key={store.name}>
              <div className="showcase-art">{store.art}<div className="showcase-browser"><i /><i /><i /><span>yourbrand.com</span><MoveUpRight size={11} /></div></div>
              <div className="showcase-card-info">
                <div><span className="showcase-category">{store.category}</span><h3>{store.name}</h3><p>{store.description}</p></div>
                <span className="showcase-arrow"><ArrowUpRight size={16} /></span>
              </div>
              <div className="showcase-tagline">{store.cta}</div>
            </article>
          ))}
        </div>
        <p className="showcase-note">Illustrative storefront concepts, not live merchant stores or customer endorsements.</p>
      </div>
    </section>
  );
}
