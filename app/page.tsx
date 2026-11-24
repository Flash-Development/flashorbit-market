import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { FinancialManagement } from "@/components/landing/financial-management";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AnalyticsReporting } from "@/components/landing/analytics-reporting";
import { OrderManagement } from "@/components/landing/order-management";
import { Pricing } from "@/components/landing/pricing";
import { ProductInventoryManagement } from "@/components/landing/product-inventory-management";
import { SocialProof } from "@/components/landing/social-proof";
import { StorefrontManagement } from "@/components/landing/storefront-management";
import { StorefrontShowcase } from "@/components/landing/storefront-showcase";
import { ValueProposition } from "@/components/landing/value-proposition";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { MotionProvider } from "@/components/motion/motion-provider";

export default function Home() {
  return (
    <MotionProvider>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <ValueProposition />
        <StorefrontManagement />
        <ProductInventoryManagement />
        <OrderManagement />
        <FinancialManagement />
        <AnalyticsReporting />
        <DashboardPreview />
        <HowItWorks />
        <StorefrontShowcase />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </MotionProvider>
  );
}
