import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const questions = [
  {
    question: "Can I customize my storefront?",
    answer: "A dedicated, brandable storefront is part of Flash Orbit’s product direction. Custom domain support is planned, but it is not available in this preview.",
  },
  {
    question: "What inventory tools are planned?",
    answer: "The product direction includes stock visibility, product variants, stock movement, low-stock alerts, and inventory valuation. Availability and timing will be confirmed before launch.",
  },
  {
    question: "Can Flash Orbit help me understand profit?",
    answer: "The planned financial view is designed to bring revenue, expenses, cost of goods sold, profit, outstanding payments, and product margins into one picture.",
  },
  {
    question: "Can I manage orders from the storefront?",
    answer: "Order visibility and fulfillment stages are part of the intended commerce workflow. This marketing preview does not process orders or connect to a live store.",
  },
  {
    question: "Which payment providers are supported?",
    answer: "No payment provider integrations have been announced. Flash Orbit does not accept or process payments in this preview.",
  },
  {
    question: "Are the plans and prices final?",
    answer: "No. Plan names and inclusions are illustrative, and pricing has not been set. Availability will be communicated when the product is ready.",
  },
];

export function Faq() {
  return (
    <section className="faq-section section-space" id="faq">
      <div className="container faq-container">
        <div className="faq-intro">
          <SectionHeading
            align="left"
            eyebrow="A few things to know"
            title="Clear answers, while Flash Orbit takes shape."
            description="An honest look at what’s being designed, what’s planned, and what isn’t live yet."
          />
          <a className="faq-contact" href="#dashboard">See the product direction <span>↗</span></a>
        </div>
        <div className="faq-list">
          {questions.map(({ question, answer }, index) => (
            <details className="faq-item" key={question} open={index === 0}>
              <summary><span>{question}</span><i><Plus size={16} /></i></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
