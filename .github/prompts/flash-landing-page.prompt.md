# Flash — Phase 1: Marketing Landing Page

Use the Flash Orchestrator first. This task is limited to the public marketing website.

## Product
Flash is a multi-tenant commerce, inventory, and financial-management platform.
Target market: Nigeria first, Africa next.
Brand direction: premium minimal SaaS, globally credible, mobile-first.

Working message:
"Run your store. Know your numbers. Grow with confidence."

## Step 1 — Inspect and plan
- Inspect the existing repository and identify the current stack and design conventions.
- Use the Product Architect to define page sections, messaging, user journey, and acceptance criteria.
- Use the Frontend Engineer to propose implementation details.
- Present the plan and wait for approval before changing application code.

## Step 2 — Implement only after approval
Create a polished responsive landing page with:
1. Navigation and mobile menu.
2. Hero with clear value proposition and primary/secondary CTAs.
3. Product dashboard preview using clearly labeled sample data.
4. Storefront, product/inventory, order, finance, and analytics feature sections.
5. How it works.
6. Storefront examples for relevant merchant categories.
7. Pricing section with clearly identified illustrative prices or placeholders.
8. FAQ with functional accordion.
9. Final CTA and footer.

Do not fabricate customer logos, testimonials, adoption numbers, partnerships, or live capabilities.
Do not create authentication, database schemas, seller dashboard routes, payment processing,
tenant provisioning, or backend APIs in this phase.

## Visual and motion direction
Create a premium but performant motion experience:
- Use Three.js for 3D; when using React, use React Three Fiber and Drei where they add value.
- Use one distinctive, purposeful 3D hero element if it improves the brand story.
- Use GSAP timelines and ScrollTrigger for selected coordinated or scroll-led storytelling.
- Use Motion for small component/state transitions where it is a better fit.
- Use CSS for basic hover, focus, and state transitions.
- Do not animate the same element with multiple libraries.
- Keep most content readable and stable; avoid excessive parallax, spinning objects, and decorative particles.
- Lazy-load 3D, provide a static fallback for unsupported WebGL, and respect reduced-motion preferences.
- Ensure keyboard accessibility and mobile usability.
- Clean up all animation resources and avoid hydration mismatches.
- Treat Lenis as optional; use it only if smooth scrolling is needed and integration with GSAP and native navigation is verified.

The implementation plan must explain which effects use which technology and why.
Do not install animation or 3D dependencies until the user approves the proposed stack.

## Step 3 — Validate and review
- Run available lint, type-check, test, and production-build commands.
- Check responsive behavior at mobile, tablet, and desktop sizes.
- Check keyboard navigation, focus visibility, semantic structure, and contrast.
- Verify every button, link, menu, and accordion works or is clearly marked as a placeholder.
- Ask the QA Reviewer for an independent review.
- Fix issues, rerun relevant checks, and report actual results.

## Completion report
List changed files, design decisions, commands run, validation results, review findings,
known limitations, and the next recommended task.
