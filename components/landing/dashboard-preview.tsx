"use client";

import { useCallback, useRef } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Boxes,
  ChevronDown,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionHeading } from "@/components/ui/section-heading";
import { useGsapAnimation } from "@/components/motion/use-gsap-animation";

const salesData = [
  { day: "Oct 01", sales: 245000, previous: 190000 },
  { day: "Oct 05", sales: 410000, previous: 280000 },
  { day: "Oct 09", sales: 365000, previous: 330000 },
  { day: "Oct 13", sales: 590000, previous: 420000 },
  { day: "Oct 17", sales: 505000, previous: 460000 },
  { day: "Oct 21", sales: 710000, previous: 560000 },
  { day: "Oct 25", sales: 650000, previous: 610000 },
  { day: "Oct 30", sales: 885000, previous: 690000 },
];

const transactions = [
  { ref: "FL-1048", detail: "Online order · Today, 10:42", amount: "+₦82,500", tone: "lilac" },
  { ref: "FL-1047", detail: "Retail order · Today, 09:18", amount: "+₦45,000", tone: "peach" },
  { ref: "FL-1046", detail: "Online order · Yesterday", amount: "+₦68,000", tone: "mint" },
];

const products = [
  { name: "Linen two-piece set", sold: "48 units", revenue: "₦1,240,000", margin: "42%" },
  { name: "Woven leather slides", sold: "37 units", revenue: "₦986,000", margin: "29%" },
  { name: "Everyday tote", sold: "31 units", revenue: "₦697,500", margin: "36%" },
];

function DashboardSidebar() {
  const navGroups: {
    title: string;
    items: { label: string; icon: LucideIcon; active?: boolean; count?: string }[];
  }[] = [
    { title: "OVERVIEW", items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }] },
    { title: "SELL", items: [{ label: "Orders", icon: ShoppingCart, count: "8" }, { label: "Products", icon: Package }, { label: "Inventory", icon: Boxes }, { label: "Customers", icon: Users }] },
    { title: "UNDERSTAND", items: [{ label: "Finances", icon: CreditCard }, { label: "Analytics", icon: Activity }] },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo"><span className="mini-brand-mark">F</span><span>Flash</span></div>
      <div className="store-switcher"><span className="store-switcher-icon"><ShoppingBag size={14} /></span><span><b>Sample Store</b><small>Demo workspace</small></span><ChevronDown size={14} /></div>
      <nav aria-label="Sample dashboard navigation">
        {navGroups.map((group) => (
          <div className="dashboard-nav-group" key={group.title}>
            <span className="dashboard-nav-label">{group.title}</span>
            {group.items.map(({ label, icon: Icon, count, active }) => (
              <span className={`dashboard-nav-item${active ? " dashboard-nav-item--active" : ""}`} key={label}>
                <Icon size={15} strokeWidth={1.8} />{label}{count ? <i>{count}</i> : null}
              </span>
            ))}
          </div>
        ))}
      </nav>
      <div className="dashboard-sidebar-bottom">
        <span className="dashboard-nav-item"><Settings size={15} /> Settings</span>
        <span className="dashboard-nav-item"><CircleHelp size={15} /> Help center</span>
        <div className="dashboard-profile"><span className="profile-avatar">D</span><span><b>Demo workspace</b><small>Sample account</small></span><ChevronDown size={13} /></div>
      </div>
    </aside>
  );
}

export function DashboardPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const buildAnimation = useCallback((gsap: typeof import("gsap").gsap, section: HTMLElement) => {
    const frame = section.querySelector<HTMLElement>(".dashboard-frame");
    if (!frame) return;

    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 1200px) and (min-height: 900px)",
        compact: "(max-width: 1199px), (max-height: 899px)",
      },
      ({ conditions }) => {
        const desktopPin =
          Boolean(conditions?.desktop) && frame.offsetHeight + 129 <= window.innerHeight;
        const metrics = gsap.utils.toArray<HTMLElement>("[data-dashboard-metric]", section);
        const chartPaths = gsap.utils.toArray<SVGPathElement>(".recharts-area-curve", section);
        const dashboard = gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: desktopPin ? "top 105px" : "top 82%",
            end: desktopPin ? () => `+=${Math.round(window.innerHeight * 0.95)}` : undefined,
            scrub: desktopPin ? 0.7 : false,
            pin: desktopPin ? frame : false,
            pinSpacing: desktopPin,
            anticipatePin: desktopPin ? 1 : 0,
            invalidateOnRefresh: true,
            once: !desktopPin,
          },
          defaults: { ease: "power2.out" },
        });

        dashboard
          .fromTo(
            section.querySelector(".dashboard-greeting"),
            { opacity: 0.65, y: 12 },
            { opacity: 1, y: 0, duration: 0.38 },
          )
          .fromTo(
            metrics,
            { opacity: 0.65, y: 20, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.52, stagger: 0.09 },
            0.12,
          )
          .fromTo(
            section.querySelectorAll(".dashboard-middle > article"),
            { opacity: 0.52, y: 22 },
            { opacity: 1, y: 0, duration: 0.56, stagger: 0.13 },
            0.55,
          )
          .fromTo(
            section.querySelectorAll(".dashboard-bottom > article"),
            { opacity: 0.52, y: 20 },
            { opacity: 1, y: 0, duration: 0.52, stagger: 0.12 },
            1,
          );

        chartPaths.forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: `${length} ${length}`, strokeDashoffset: length });
          dashboard.to(path, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, 0.48);
        });

        return () => dashboard.kill();
      },
    );
    return () => media.revert();
  }, []);
  useGsapAnimation(sectionRef, buildAnimation, true);

  return (
    <section className="dashboard-section section-space" id="dashboard" ref={sectionRef}>
      <div className="container">
        <SectionHeading
          eyebrow="Inside the platform"
          title="One clear view of the work behind every sale."
          description="An illustrative Flash workspace for revenue, orders, stock, and product performance."
        />
        <div className="dashboard-frame">
          <DashboardSidebar />
          <div className="dashboard-main">
            <div className="dashboard-topbar">
              <div className="breadcrumb">Sample Store <span>/</span> Overview</div>
              <div className="dashboard-top-actions">
                <span className="dashboard-top-search"><Search size={14} /> Search workspace</span>
                <span className="dashboard-bell"><Bell size={16} /><i /></span>
                <span className="dashboard-date">Oct 1 – 31, 2026 <ChevronDown size={13} /></span>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-greeting">
                <div><span className="dashboard-date-label">DEMONSTRATION WORKSPACE</span><h3>Your business at a glance.</h3></div>
                <span className="dashboard-period">October 2026 <ChevronDown size={14} /></span>
              </div>
              <div className="dashboard-kpis">
                <article data-dashboard-metric><span>Sales revenue</span><b data-count-value="4860000" data-currency="true">₦4,860,000</b><small><i className="positive"><ArrowUpRight size={12} /> 8.2%</i> sample change</small><div className="kpi-sparkline"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article data-dashboard-metric><span>Total orders</span><b data-count-value="312">312</b><small><i className="positive"><ArrowUpRight size={12} /> 12.4%</i> sample change</small><div className="kpi-sparkline kpi-sparkline--blue"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article data-dashboard-metric><span>Inventory value</span><b data-count-value="3420000" data-currency="true">₦3,420,000</b><small><i className="neutral"><ArrowUpRight size={12} /> 3.1%</i> sample change</small><div className="kpi-sparkline kpi-sparkline--amber"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article data-dashboard-metric><span>Gross profit</span><b data-count-value="2740000" data-currency="true">₦2,740,000</b><small><i className="positive"><ArrowUpRight size={12} /> 11.8%</i> sample change</small><div className="kpi-sparkline kpi-sparkline--violet"><i /><i /><i /><i /><i /><i /><i /></div></article>
              </div>
              <div className="dashboard-middle">
                <article className="sales-chart-card">
                  <div className="dashboard-card-heading"><div><span>Sales over time</span><small>Daily revenue · NGN</small></div><span className="dashboard-mock-select">October <ChevronDown size={12} /></span></div>
                  <div className="chart-legend"><span><i /> This period</span><span><i /> Previous period</span></div>
                  <div className="sales-chart" role="img" aria-label="Illustrative sales chart comparing current and previous sample periods">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 8, right: 3, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#635bff" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#eef0f4" strokeDasharray="3 4" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#9199a8", fontSize: 10 }} tickMargin={11} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9199a8", fontSize: 10 }} tickFormatter={(value: number) => `₦${(value / 1000000).toFixed(1)}m`} />
                        <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString("en-NG")}`, "Revenue"]} contentStyle={{ border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 20px #121a2b12" }} />
                        <Area type="monotone" dataKey="previous" stroke="#c7cbd4" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" isAnimationActive={false} />
                        <Area type="monotone" dataKey="sales" stroke="#635bff" strokeWidth={2.2} fill="url(#salesFill)" activeDot={{ r: 4, fill: "#635bff", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>
                <article className="stock-alert-card">
                  <div className="dashboard-card-heading"><div><span>Inventory alerts</span><small>Sample items to review</small></div><span className="alert-count">3</span></div>
                  <div className="stock-alert-list">
                    <div className="stock-alert-row"><span className="alert-product alert-product--peach">L</span><span><b>Linen two-piece set</b><small>APP-014 · 2 variants low</small></span><i>6 left</i></div>
                    <div className="stock-alert-row"><span className="alert-product alert-product--blue">T</span><span><b>Everyday tote</b><small>APP-021 · Reorder soon</small></span><i>8 left</i></div>
                    <div className="stock-alert-row"><span className="alert-product alert-product--green">S</span><span><b>Woven leather slides</b><small>ACC-008 · 1 variant low</small></span><i>4 left</i></div>
                  </div>
                  <div className="stock-alert-foot"><span><i /> Sample reorder thresholds</span><span>Stock overview <ArrowUpRight size={12} /></span></div>
                </article>
              </div>
              <div className="dashboard-bottom">
                <article className="dashboard-transactions">
                  <div className="dashboard-card-heading"><div><span>Recent transactions</span><small>Demonstration activity · NGN</small></div><span className="dashboard-mock-select">This week <ChevronDown size={12} /></span></div>
                  <div className="transaction-table">
                    {transactions.map((transaction) => (
                      <div className="transaction-row" key={transaction.ref}>
                        <span className={`transaction-avatar transaction-avatar--${transaction.tone}`}><ShoppingBag size={12} /></span>
                        <span className="transaction-name"><b>Order {transaction.ref}</b><small>{transaction.detail}</small></span>
                        <span className="transaction-status"><i /> Recorded</span>
                        <b className="transaction-amount">{transaction.amount}</b>
                      </div>
                    ))}
                  </div>
                </article>
                <article className="product-performance-card">
                  <div className="dashboard-card-heading"><div><span>Product performance</span><small>Sample revenue and margin</small></div><span className="dashboard-mock-select">October <ChevronDown size={12} /></span></div>
                  <div className="product-performance-list">
                    {products.map((product) => (
                      <div className="product-performance-row" key={product.name}>
                        <span><b>{product.name}</b><small>{product.sold}</small></span>
                        <span><b>{product.revenue}</b><small>{product.margin} sample margin</small></span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
              <div className="dashboard-sample-note"><span>Entire workspace uses demonstration data</span><span>Amounts shown in Nigerian naira (NGN)</span></div>
            </div>
          </div>
        </div>
        <p className="dashboard-disclaimer">Product interface is illustrative. Flash is in development; no live store, inventory, order, or financial data is connected.</p>
      </div>
    </section>
  );
}
