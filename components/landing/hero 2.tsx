import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  MoreHorizontal,
  Search,
  ShoppingBag,
} from "lucide-react";

const miniBars = [34, 45, 37, 58, 49, 66, 54, 72, 60, 83, 68, 94];

function HeroDashboard() {
  return (
    <div className="hero-product" role="group" aria-label="Illustrative preview of the Tandri business dashboard">
      <div className="hero-product-top">
        <div className="hero-product-brand">
          <span className="mini-brand-mark">T</span>
          <span>Sample Store</span>
          <span className="store-status">DEMO</span>
        </div>
        <div className="hero-product-top-actions">
          <span className="dashboard-search"><Search size={13} /> Search</span>
          <span className="avatar">D</span>
        </div>
      </div>
      <div className="hero-product-body">
        <aside className="hero-sidebar">
          <div className="sidebar-store">
            <span className="sidebar-store-icon"><ShoppingBag size={14} /></span>
            <span><b>Sample Store</b><small>Store workspace</small></span>
            <ChevronDown size={13} />
          </div>
          <div className="sidebar-label">WORKSPACE</div>
          <span className="sidebar-item sidebar-item--active"><span className="sidebar-dot" /> Overview</span>
          <span className="sidebar-item"><span className="sidebar-dot" /> Orders <i>8</i></span>
          <span className="sidebar-item"><span className="sidebar-dot" /> Products</span>
          <span className="sidebar-item"><span className="sidebar-dot" /> Inventory</span>
          <span className="sidebar-item"><span className="sidebar-dot" /> Customers</span>
          <span className="sidebar-item"><span className="sidebar-dot" /> Finances</span>
          <div className="sidebar-help"><span>?</span> Help center</div>
        </aside>
        <div className="hero-dashboard-content">
          <div className="hero-dashboard-heading">
            <div><small>OCTOBER 2026</small><h3>Your business overview</h3></div>
            <span className="hero-more" aria-hidden="true"><MoreHorizontal size={19} /></span>
          </div>
          <div className="hero-metric-row">
            <div className="hero-metric-card"><span>Revenue</span><strong>₦4.86m</strong><small><b><ArrowUpRight size={11} /> 8.2%</b> sample change</small></div>
            <div className="hero-metric-card"><span>Orders</span><strong>312</strong><small><b><ArrowUpRight size={11} /> 12.4%</b> sample change</small></div>
            <div className="hero-metric-card"><span>Stock value</span><strong>₦3.42m</strong><small><b><ArrowUpRight size={11} /> 3.1%</b> sample change</small></div>
          </div>
          <div className="hero-chart-card">
            <div className="hero-chart-title"><div><span>Sales over time</span><strong>₦4,860,000</strong></div><span className="chart-period">October <ChevronDown size={12} /></span></div>
            <div className="mini-chart" aria-hidden="true">
              <div className="mini-chart-y"><span>₦5m</span><span>₦4m</span><span>₦3m</span><span>₦2m</span></div>
              <div className="mini-chart-plot">
                <div className="chart-grid"><i /><i /><i /><i /></div>
                <div className="mini-bars">{miniBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
              </div>
            </div>
            <div className="mini-chart-x"><span>Oct 1</span><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Oct 31</span></div>
          </div>
          <div className="hero-order-row">
            <div><span className="order-check"><Check size={12} /></span><span><b>Order #TD-1048</b><small>Sample order · Web store</small></span></div>
            <strong>₦82,500</strong>
          </div>
          <div className="hero-dashboard-foot"><span>Demonstration data · NGN</span><span>Platform preview <ArrowDown size={11} /></span></div>
        </div>
      </div>
      <div className="hero-float-card"><span className="float-icon"><ArrowUpRight size={15} /></span><span><b>Know what needs attention.</b><small>Sales, stock, and cash in view.</small></span></div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-container">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-spark">✳</span> The system behind every sale</div>
          <h1>Run your store.<br />Know your numbers.<br /><span>Grow with confidence.</span></h1>
          <p>Everything your business needs to sell online, manage inventory, track finances and grow — all in one place.</p>
          <div className="hero-ctas">
            <a className="button button--primary" href="#pricing">Start your store <ArrowUpRight size={16} /></a>
            <a className="button button--text" href="#dashboard">Explore platform <span>↓</span></a>
          </div>
          <div className="hero-assurance"><span><Check size={12} /></span> Nigeria first <i /> Built with Africa’s growing businesses in view</div>
        </div>
        <div className="hero-visual">
          <div className="visual-caption"><span className="visual-caption-dot" /> YOUR BUSINESS, AT A GLANCE</div>
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
