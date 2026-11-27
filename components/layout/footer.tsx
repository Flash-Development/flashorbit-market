import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Platform", href: "#dashboard" },
  { label: "Storefronts", href: "#storefronts" },
  { label: "Finances", href: "#finance" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <a className="brand brand--footer" href="#top" aria-label="Flash Orbit home">
              <span className="brand-mark" aria-hidden="true">
                <span>F</span>
              </span>
              <span>Flash Orbit</span>
            </a>
            <p>Run your store. Know your numbers. Grow with confidence.</p>
          </div>
          <div className="footer-nav">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#dashboard">
              Explore the platform <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Flash Orbit. All rights reserved.</span>
          <span>Product in development · Sample interfaces and figures are illustrative.</span>
        </div>
      </div>
    </footer>
  );
}
