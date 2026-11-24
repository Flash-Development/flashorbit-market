# Flash — 3D and Motion Architecture Review

Act as Flash's frontend motion and 3D engineering specialist.

This is a planning-only task. Do not install dependencies or edit application code.

## Goal
Propose a premium, accessible, performant 3D and animation architecture for Flash.

## Inspect
- Current framework and rendering model.
- Existing animation, graphics, and styling dependencies.
- Current route/layout structure and component conventions.
- Build setup, SSR/hydration behavior, and current performance tooling.

## Technology responsibilities
Evaluate these candidates based on actual repository compatibility:
- Three.js for 3D rendering.
- React Three Fiber and Drei for React-based 3D scenes.
- GSAP for coordinated timelines.
- GSAP ScrollTrigger for scroll-driven sequences.
- Motion for component/state transitions.
- Lenis only if smooth scrolling is justified and can be synchronized without conflicts.

Do not assume every library is required. Recommend the smallest effective set.

## Required architecture proposal
1. Library responsibility matrix.
2. Suggested reusable animation utilities/components.
3. 3D scene loading strategy and static fallback.
4. GSAP context, timeline, and ScrollTrigger lifecycle/cleanup strategy.
5. Reduced-motion and keyboard-accessibility approach.
6. Mobile and low-powered-device performance strategy.
7. Bundle splitting and asset optimization.
8. SSR/hydration and WebGL failure handling.
9. Testing and validation plan.
10. Dependencies to install, with reasons and compatibility notes.

## Design principles
Use 3D for memorable product identity or meaningful demonstrations.
Use GSAP for deliberate storytelling and coordinated sequences.
Use Motion for local UI transitions.
Use CSS for simple states.
Do not animate the same element/property through competing libraries.
Avoid gratuitous parallax, particles, perpetual spinning, and effects that impair readability.

## Output
Present findings, proposed architecture, dependency recommendations, risks, and a staged
implementation plan. Wait for explicit approval before making changes.
