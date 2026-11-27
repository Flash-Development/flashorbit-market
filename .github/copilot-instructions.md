# Flash Orbit — Copilot Project Instructions

## Product context
Flash Orbit is a multi-tenant commerce, inventory, and financial-management SaaS.
The initial market is Nigeria, followed by broader African markets. The product
should be globally credible, accessible, secure, and suitable for businesses
from independent sellers to growing retailers.

Core product areas:
- Seller-owned branded storefronts and custom domains.
- Products, categories, variants, pricing, and inventory.
- Orders, fulfillment, customers, and payment status.
- Business finances: sales, expenses, refunds, cost of goods, profit, and reconciliation.
- Reporting, analytics, subscriptions, and workspace settings.

## Operating principles
1. Inspect the repository before proposing or changing architecture.
2. Preserve existing conventions and dependencies unless there is a clear reason to change.
3. Do not assume a framework, database, payment provider, or deployment platform that has not been approved.
4. Build incrementally. Do not implement future phases unless explicitly requested.
5. Prefer simple, maintainable solutions over premature abstraction.
6. Never fabricate customer logos, testimonials, usage metrics, integrations, certifications, or product capabilities.
7. Label demo/sample data clearly. Never present sample financial figures as real Flash Orbit business data.
8. Treat tenant isolation and financial correctness as core product requirements, not later enhancements.

## Multi-tenant and security principles
When backend or data features are introduced:
- Every tenant-owned record must be scoped to an authenticated tenant/workspace.
- Enforce authorization on the server; hiding UI controls is not authorization.
- Deny access by default and validate ownership at every read and write boundary.
- Never trust tenant IDs, prices, totals, roles, or payment status supplied by the client.
- Keep secrets out of source control and client bundles.
- Validate inputs at system boundaries and use safe error messages.
- Add tests for cross-tenant access attempts and role/permission boundaries.
- Do not store raw payment-card data. Use an approved payment provider's hosted/tokenized flow.
- Record financial events in an auditable way; avoid silently overwriting historical transactions.

## Visual, 3D, and motion engineering standards
Flash Orbit should deliver premium, purposeful visual experiences. Use advanced motion and 3D
where they improve product understanding, brand identity, or interaction—not as decoration.

Candidate technology direction, subject to repository inspection and approval:
- Three.js for 3D rendering.
- React Three Fiber and Drei when the application uses React.
- GSAP for coordinated timelines and complex sequences.
- GSAP ScrollTrigger for scroll-driven storytelling.
- Motion for component-level UI transitions when useful.
- Lenis only when smooth scrolling is genuinely needed and can be integrated safely.

Keep responsibilities distinct:
- Three.js / React Three Fiber: 3D scenes, lighting, materials, cameras, and interaction.
- GSAP: complex timelines, coordinated sequences, and ScrollTrigger.
- Motion: localized component transitions and state-driven UI animation.
- CSS: simple hover, focus, and state transitions.

Do not animate the same element with multiple animation systems. Define clear ownership
for each animated element. Prefer CSS for simple effects and avoid adding libraries when
existing capabilities are sufficient.

Performance and accessibility are mandatory:
- Lazy-load 3D scenes and split heavy bundles.
- Provide graceful static fallbacks when WebGL is unavailable.
- Optimize geometry, textures, shaders, and rendering frequency.
- Avoid continuous rendering when a scene is idle.
- Respect prefers-reduced-motion and provide reduced-motion alternatives.
- Ensure keyboard access and do not communicate essential information through motion alone.
- Test mobile performance, low-powered devices, and narrow viewports.
- Clean up GSAP timelines, ScrollTriggers, event listeners, animation frames, and GPU resources.
- Avoid hydration mismatches and layout shifts.
- Never sacrifice core web performance or usability for visual effects.

## Engineering standards
- Use TypeScript where the repository supports it.
- Follow the existing formatting, linting, naming, and folder conventions.
- Keep components focused and reusable; avoid unnecessary abstraction.
- Prefer accessible semantic HTML and keyboard-operable interactions.
- Include loading, empty, error, and success states for interactive product flows.
- Avoid dead buttons, fake links, and controls that imply functionality that does not exist.
- Use responsive layouts and test narrow mobile widths.
- Add or update tests for behavior changes.
- Update documentation when commands, architecture, setup, or behavior changes.

## Required workflow for every task
1. **Inspect:** identify relevant files, current architecture, scripts, and existing patterns.
2. **Plan:** state the intended changes, files likely to change, risks, and validation steps.
3. **Confirm scope:** do not expand the task without asking. If requirements conflict or a key decision is missing, ask one focused question.
4. **Implement:** make the smallest complete change that satisfies the approved scope.
5. **Validate:** run the relevant tests, type checks, lint, and build commands that actually exist in the repository.
6. **Review:** inspect the diff for regressions, security issues, accessibility, responsiveness, and accidental scope expansion.
7. **Report:** summarize changes, commands run, results, known limitations, and follow-up work.

## Definition of done
A task is not complete merely because code was written. It is complete when:
- The requested behavior is implemented within scope.
- Relevant checks have been run, or unavailable checks are explicitly identified.
- No known broken links, dead controls, obvious console errors, or avoidable accessibility issues remain.
- Tests cover meaningful behavior where appropriate.
- The final response lists changed files and validation outcomes.

## Current phase boundary
The initial milestone is the public marketing landing page only.
Do not add authentication, tenant provisioning, database schemas, payment processing,
seller dashboard routes, or backend APIs until those phases are explicitly approved.
