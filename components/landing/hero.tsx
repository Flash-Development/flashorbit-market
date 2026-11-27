import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { HeroEntrance } from "@/components/motion/hero-entrance";
import { HeroExperience } from "@/components/landing/hero-experience";

const revenueBars = [28, 37, 32, 48, 41, 58, 52, 69, 62, 78, 70, 94];

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <HeroEntrance className="hero-container">
        <div className="hero-copy" data-hero-reveal>
          <div className="hero-kicker" data-hero-support>
            <span className="hero-kicker-dot" />
            Built for ambitious businesses
          </div>
          <h1>
            <span className="hero-title-mask"><span className="hero-title-line" data-hero-copy-line>Run your store.</span></span>
            <span className="hero-title-mask"><span className="hero-title-line" data-hero-copy-line>Know your numbers.</span></span>
            <span className="hero-title-mask"><span className="hero-title-line hero-title-line--accent" data-hero-copy-line>Grow with confidence.</span></span>
          </h1>
          <p data-hero-support>
            Commerce, inventory and financial management for ambitious businesses.
            One connected view of the work behind every sale.
          </p>
          <div className="hero-ctas" data-hero-support>
            <a className="button button--primary" href="#dashboard">
              Explore Flash Orbit <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a className="button button--text hero-secondary-cta" href="#how-it-works">
              See how it works <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-assurance" data-hero-support>
            <span><Check size={12} aria-hidden="true" /></span>
            Nigeria first <i /> Built with Africa’s growing businesses in view
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-caption">
            <span className="visual-caption-dot" />
            ONE CLEAR VIEW OF YOUR BUSINESS
          </div>
          <HeroExperience />
          <div className="hero-product-card" role="group" aria-label="Illustrative Flash Orbit dashboard snapshot">
            <div className="hero-product-card-top">
              <span className="hero-card-store"><span className="hero-card-mark">F</span> Sample Store</span>
              <span className="hero-card-demo">DEMO DATA</span>
            </div>
            <div className="hero-card-heading">
              <span>Business overview <small>October 2026</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </div>
            <div className="hero-card-metrics">
              <div><span>Sales revenue</span><strong>₦4.86m</strong><small>Sample figures</small></div>
              <div><span>Orders</span><strong>312</strong><small>Illustrative</small></div>
            </div>
            <div className="hero-card-chart" role="img" aria-label="Illustrative weekly sales trend">
              {revenueBars.map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="hero-card-foot">
              <span>Demonstration data · NGN</span>
              <span>Sales over time <ArrowDown size={11} aria-hidden="true" /></span>
            </div>
          </div>
          <div className="hero-orbit-note" aria-hidden="true">
            <span /> Storefront <i /> Stock <i /> Finances
          </div>
        </div>
      </HeroEntrance>
    </section>
  );
}
