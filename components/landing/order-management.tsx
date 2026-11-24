import { ArrowUpRight, Check, Clock3, PackageCheck, ShoppingBag } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const orderRows = [
  { id: "FL-1048", item: "Linen two-piece set", time: "Today · 10:42", status: "To fulfill", amount: "₦82,500", tone: "order-waiting" },
  { id: "FL-1047", item: "Everyday tote × 2", time: "Today · 09:18", status: "Processing", amount: "₦45,000", tone: "order-progress" },
  { id: "FL-1046", item: "Woven leather slides", time: "Yesterday · 16:05", status: "Completed", amount: "₦68,000", tone: "order-complete" },
];

export function OrderManagement() {
  return (
    <section className="story-section story-section--orders" id="orders">
      <div className="container story-grid">
        <div className="story-copy">
          <SectionHeading
            align="left"
            eyebrow="Order management"
            title="Every order, with a clear next step."
            description="Bring orders into one queue, see where each one stands, and keep fulfillment from getting lost between messages and spreadsheets."
          />
          <div className="order-workflow">
            <span><ShoppingBag size={15} /> New order</span><i /><span><Clock3 size={15} /> In progress</span><i /><span><PackageCheck size={15} /> Fulfilled</span>
          </div>
          <p className="planned-note">Order rows and statuses are illustrative. No live orders or payment processing.</p>
        </div>
        <div className="orders-demo" role="group" aria-label="Sample order queue">
          <div className="demo-panel-heading">
            <div><span className="demo-overline">SAMPLE ORDER QUEUE</span><h3>Orders to keep moving</h3></div>
            <span className="demo-count">3</span>
          </div>
          <div className="orders-demo-tabs"><span className="is-active">All orders <b>12</b></span><span>To fulfill <b>4</b></span><span>Completed</span></div>
          <div className="order-list">
            {orderRows.map((order) => (
              <div className="order-list-row" key={order.id}>
                <span className="order-list-check">{order.tone === "order-complete" ? <Check size={13} /> : <ShoppingBag size={13} />}</span>
                <span className="order-list-main"><b>Order #{order.id}</b><small>{order.item} · {order.time}</small></span>
                <span className={`order-status ${order.tone}`}>{order.status}</span>
                <strong>{order.amount}</strong>
              </div>
            ))}
          </div>
          <div className="orders-demo-footer"><span>Sample data · NGN</span><span>See fulfillment flow <ArrowUpRight size={12} /></span></div>
        </div>
      </div>
    </section>
  );
}
