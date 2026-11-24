# Flash Engineering Workflow

## Purpose
This workflow keeps product scope, implementation quality, and validation consistent while
Flash is built with GitHub Copilot.

## Standard lifecycle

### 1. Inspect
Use **Flash Orchestrator** to inspect the repository, relevant code paths, conventions,
dependencies, and available scripts. No code changes during discovery.

### 2. Define
Use **Flash Product Architect** for product requirements, user journeys, acceptance criteria,
non-goals, data ownership, and unresolved decisions.

### 3. Plan and approve
The Orchestrator presents a small implementation plan:
- Scope and non-goals
- Likely files and components
- Dependencies and assumptions
- Risks
- Validation plan

The developer approves the plan before implementation for substantial work.

### 4. Implement
Use **Flash Frontend Engineer** for interface work. Add other specialists only when their
domain is in scope. Keep changes small and focused.

### 5. Validate
Run the commands discovered in the repository, not guessed commands:
- Formatting, if configured
- Lint
- Type checking
- Unit/integration tests
- Production build
- Relevant manual or browser checks

### 6. Review
Use **Flash QA Reviewer** for an independent review. Use **Flash Security Reviewer** whenever
authentication, tenant boundaries, user data, payments, file uploads, or financial records
are affected. Reviewers report findings; the implementation agent fixes them.

### 7. Report
Summarize:
- What changed
- Files changed
- Commands run and their actual outcomes
- QA/security findings
- Known limitations
- Next step

## Agent responsibilities

| Agent | Primary responsibility | Expected behavior |
|---|---|---|
| Flash Orchestrator | Coordinate work | Inspect, plan, sequence, report |
| Flash Product Architect | Product and domain design | Requirements and acceptance criteria |
| Flash Frontend Engineer | Frontend implementation | Responsive, accessible UI |
| Flash QA Reviewer | Independent quality review | Review only; no edits |
| Flash Security Reviewer | Security and data integrity | Review only; no edits |

## Visual and motion workflow
For each frontend milestone, the plan must include:
1. Motion purpose: what user understanding or interaction does the animation improve?
2. Technology ownership: CSS, Motion, GSAP/ScrollTrigger, or Three.js/R3F.
3. Performance plan: lazy loading, asset budgets, idle rendering, and mobile behavior.
4. Accessibility plan: reduced motion, keyboard access, and non-motion alternatives.
5. Cleanup plan: timelines, listeners, observers, render loops, and GPU resources.

Default responsibilities:
- CSS: simple transitions and hover/focus states.
- Motion: localized component and state transitions.
- GSAP: complex timelines and scroll-driven sequences.
- Three.js: 3D rendering; React Three Fiber and Drei: React scenes and reusable 3D utilities.

Avoid overlapping animation ownership. 3D and animation libraries are candidates, not
mandatory dependencies; inspect the existing stack and get approval before installation.
Lenis is optional and should be considered only when it integrates cleanly with GSAP and
preserves native navigation and accessibility.

### Current landing-page implementation
- `components/motion/` contains the reduced-motion preference, shared GSAP scope,
  hero entrance, scroll reveal, and Motion configuration.
- `components/three/` contains the isolated 3D hero scene and its error fallback.
- The hero scene is dynamically imported only near the viewport and only when WebGL is
  available; low-memory or reduced-motion users keep the static mark.
- The dashboard preview keeps its sample data visible without JavaScript; GSAP animates
  its metrics and chart only when motion is allowed.
- Lenis is not installed. Native scrolling and anchor links remain the default.

## Approval gates
Explicit developer approval is required before:
- Installing or replacing major dependencies.
- Changing the approved architecture or database.
- Implementing payment processing or financial ledger behavior.
- Introducing authentication or tenant provisioning.
- Running destructive migrations or deleting data.
- Deploying, publishing, or changing production resources.

## Current milestone
Phase 1 is the public marketing landing page only. Future backend and seller-workspace
features must remain out of scope until separately approved.
