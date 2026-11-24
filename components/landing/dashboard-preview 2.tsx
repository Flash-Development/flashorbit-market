"use client";

import {
  Activity,
  ArrowDownRight,
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

const salesData = [
  { day: "May 01", sales: 1800, previous: 1400 },
  { day: "May 05", sales: 2400, previous: 1900 },
  { day: "May 09", sales: 2050, previous: 1650 },
  { day: "May 13", sales: 3300, previous: 2200 },
  { day: "May 17", sales: 2900, previous: 2500 },
  { day: "May 21", sales: 3900, previous: 3000 },
  { day: "May 25", sales: 3500, previous: 2750 },
  { day: "May 30", sales: 4800, previous: 3300 },
];

const transactions = [
  { initials: "AL", name: "Alexandra Lee", detail: "Order #1048 · Today, 10:42 am", amount: "+$128.00", tone: "lilac" },
  { initials: "JR", name: "Jordan Rivera", detail: "Order #1047 · Today, 9:18 am", amount: "+$76.50", tone: "peach" },
  { initials: "MK", name: "Morgan Kim", detail: "Order #1046 · Yesterday", amount: "+$214.00", tone: "mint" },
];

function DashboardSidebar() {
  const navGroups: {
    title: string;
    items: { label: string; icon: LucideIcon; active?: boolean; count?: string }[];
  }[] = [
    { title: "OVERVIEW", items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }] },
    { title: "SELL", items: [{ label: "Orders", icon: ShoppingCart, count: "8" }, { label: "Products", icon: Package }, { label: "Inventory", icon: Boxes }, { label: "Customers", icon: Users }] },
    { title: "GROW", items: [{ label: "Finances", icon: CreditCard }, { label: "Analytics", icon: Activity }] },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo"><span className="mini-brand-mark">M</span><span>meridian</span></div>
      <button className="store-switcher" type="button"><span className="store-switcher-icon"><ShoppingBag size={14} /></span><span><b>Goodform Goods</b><small>Starter plan</small></span><ChevronDown size={14} /></button>
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
        <div className="dashboard-profile"><span className="profile-avatar">JM</span><span><b>Jamie Morgan</b><small>Store owner</small></span><ChevronDown size={13} /></div>
      </div>
    </aside>
  );
}

export function DashboardPreview() {
  return (
    <section className="dashboard-section section-space" id="dashboard">
      <div className="container">
        <SectionHeading
          eyebrow="A closer look"
          title="Your business, with the full picture."
          description="A single, calm command center for the details that keep your day moving. This preview uses sample store data."
        />
        <div className="dashboard-frame">
          <DashboardSidebar />
          <div className="dashboard-main">
            <div className="dashboard-topbar"><div className="breadcrumb">Goodform Goods <span>/</span> Overview</div><div className="dashboard-top-actions"><span className="dashboard-top-search"><Search size={14} /> Search anything...</span><span className="dashboard-bell"><Bell size={16} /><i /></span><span className="dashboard-date">May 1 – 30, 2025 <ChevronDown size={13} /></span></div></div>
            <div className="dashboard-content">
              <div className="dashboard-greeting"><div><span className="dashboard-date-label">FRIDAY, MAY 30, 2025</span><h3>Here’s your store at a glance.</h3></div><button type="button" className="dashboard-period">Last 30 days <ChevronDown size={14} /></button></div>
              <div className="dashboard-kpis">
                <article><span>Total sales</span><b>$24,680.50</b><small><i className="positive"><ArrowUpRight size={12} /> 12.8%</i> vs. previous period</small><div className="kpi-sparkline"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article><span>Orders</span><b>342</b><small><i className="positive"><ArrowUpRight size={12} /> 8.4%</i> vs. previous period</small><div className="kpi-sparkline kpi-sparkline--blue"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article><span>Average order value</span><b>$72.16</b><small><i className="negative"><ArrowDownRight size={12} /> 2.1%</i> vs. previous period</small><div className="kpi-sparkline kpi-sparkline--amber"><i /><i /><i /><i /><i /><i /><i /></div></article>
                <article><span>Returning customers</span><b>28.4%</b><small><i className="positive"><ArrowUpRight size={12} /> 4.6%</i> vs. previous period</small><div className="kpi-sparkline kpi-sparkline--violet"><i /><i /><i /><i /><i /><i /><i /></div></article>
              </div>
              <div className="dashboard-middle">
                <article className="sales-chart-card">
                  <div className="dashboard-card-heading"><div><span>Sales over time</span><small>Daily sales, compared with previous period</small></div><button type="button" aria-label="Chart options">•••</button></div>
                  <div className="chart-legend"><span><i /> This period</span><span><i /> Previous period</span></div>
                  <div className="sales-chart" role="img" aria-label="Sample sales chart comparing the current and previous period">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 8, right: 3, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5c5ce2" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="#5c5ce2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#eef0f4" strokeDasharray="3 4" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#9199a8", fontSize: 10 }} tickMargin={11} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9199a8", fontSize: 10 }} tickFormatter={(value: number) => `$${value / 1000}k`} />
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Sales"]} contentStyle={{ border: "1px solid #e8eaf0", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 20px #121a2b12" }} />
                        <Area type="monotone" dataKey="previous" stroke="#c7cbd4" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" />
                        <Area type="monotone" dataKey="sales" stroke="#5c5ce2" strokeWidth={2.2} fill="url(#salesFill)" activeDot={{ r: 4, fill: "#5c5ce2", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>
                <article className="stock-alert-card">
                  <div className="dashboard-card-heading"><div><span>Stock to watch</span><small>Products that may need a restock</small></div><button type="button" aria-label="View all inventory">View all</button></div>
                  <div className="stock-alert-list">
                    <div className="stock-alert-row"><span className="alert-product alert-product--peach">T</span><span><b>Everyday Canvas Tote</b><small>SKU · BAG-014</small></span><i>8 left</i></div>
                    <div className="stock-alert-row"><span className="alert-product alert-product--blue">B</span><span><b>Stoneware Bottle</b><small>SKU · HOM-028</small></span><i>4 left</i></div>
                    <div className="stock-alert-row"><span className="alert-product alert-product--green">C</span><span><b>Ribbed Cotton Cap</b><small>SKU · ACC-006</small></span><i>6 left</i></div>
                  </div>
                  <div className="stock-alert-foot"><span><i /> 3 items below reorder point</span><span>Manage inventory <ArrowUpRight size={12} /></span></div>
                </article>
              </div>
              <div className="dashboard-transactions">
                <div className="dashboard-card-heading"><div><span>Recent transactions</span><small>Your latest store activity</small></div><button type="button" aria-label="View all transactions">View all</button></div>
                <div className="transaction-table">
                  {transactions.map((transaction) => (
                    <div className="transaction-row" key={transaction.initials}>
                      <span className={`transaction-avatar transaction-avatar--${transaction.tone}`}>{transaction.initials}</span>
                      <span className="transaction-name"><b>{transaction.name}</b><small>{transaction.detail}</small></span>
                      <span className="transaction-type">Online store</span>
                      <span className="transaction-status"><i /> Paid</span>
                      <b className="transaction-amount">{transaction.amount}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-sample-note"><span>Sample data for illustration only</span><span>All amounts shown in USD</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
