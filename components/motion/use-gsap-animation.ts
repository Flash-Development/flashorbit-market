"use client";

import { useEffect, type RefObject } from "react";
import { createGsapScope } from "@/components/motion/gsap-scope";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

type Gsap = typeof import("gsap").gsap;
type AnimationBuilder = (gsap: Gsap, scope: HTMLElement) => void | (() => void);

export function useGsapAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  build: AnimationBuilder,
  usesScrollTrigger = false,
) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion) return;

    let revert = () => {};
    let cancelled = false;
    let refreshFrame = 0;

    const refresh = () => {
      if (cancelled || !usesScrollTrigger) return;
      void import("gsap/ScrollTrigger")
        .then(({ ScrollTrigger }) => {
          if (!cancelled) ScrollTrigger.refresh();
        })
        .catch((error: unknown) => {
          console.error("Flash Orbit scroll animation refresh failed.", error);
        });
    };

    void createGsapScope(
      scope,
      (gsap) => build(gsap, scope),
      { scrollTrigger: usesScrollTrigger, isActive: () => !cancelled },
    )
      .then((cleanup) => {
        if (cancelled) {
          cleanup();
          return;
        }
        revert = cleanup;
        if (usesScrollTrigger) refreshFrame = window.requestAnimationFrame(refresh);
      })
      .catch((error: unknown) => {
        console.error("Flash Orbit animation failed to initialize.", error);
      });

    if (usesScrollTrigger) {
      window.addEventListener("load", refresh, { once: true });
      void document.fonts?.ready.then(refresh);
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener("load", refresh);
      revert();
    };
  }, [build, prefersReducedMotion, scopeRef, usesScrollTrigger]);
}
