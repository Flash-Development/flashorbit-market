type Gsap = typeof import("gsap").gsap;

type GsapScopeOptions = {
  scrollTrigger?: boolean;
  isActive?: () => boolean;
};

export async function createGsapScope(
  scope: Element,
  animate: (gsap: Gsap) => void | (() => void),
  options: GsapScopeOptions = {},
) {
  const { gsap } = await import("gsap");
  if (options.scrollTrigger) {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
  }
  if (options.isActive && !options.isActive()) return () => {};

  let cleanup: (() => void) | undefined;
  const context = gsap.context(() => {
    cleanup = animate(gsap) ?? undefined;
  }, scope);
  return () => {
    cleanup?.();
    context.revert();
  };
}
