"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SceneErrorBoundary } from "@/components/three/scene-error-boundary";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

const HeroScene = dynamic(
  () => import("@/components/three/hero-scene").then((module) => module.HeroScene),
  { ssr: false },
);

function StaticHeroMark() {
  return (
    <div className="hero-scene-fallback" aria-hidden="true">
      <div className="fallback-orbit fallback-orbit--one" />
      <div className="fallback-orbit fallback-orbit--two" />
      <div className="fallback-mark">F</div>
      <span className="fallback-node fallback-node--one" />
      <span className="fallback-node fallback-node--two" />
    </div>
  );
}

function canUseWebGL() {
  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
    canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });

  if (!context) return false;
  context.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

export function HeroExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoadScene, setShouldLoadScene] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const sceneEnabled = !prefersReducedMotion && shouldLoadScene && webglAvailable;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion) return;
    if (!("IntersectionObserver" in window)) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const lowMemoryDevice =
          navigator.hardwareConcurrency <= 2 ||
          ("deviceMemory" in navigator &&
          typeof navigator.deviceMemory === "number" &&
          navigator.deviceMemory <= 2);
        if (lowMemoryDevice) return;

        const available = canUseWebGL();
        if (cancelled) return;
        setWebglAvailable(available);
        setShouldLoadScene(available);
      },
      { rootMargin: "120px" },
    );

    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={`hero-scene${canvasReady && !prefersReducedMotion ? " hero-scene--ready" : ""}`}
      ref={rootRef}
      role="group"
      aria-label="Flash brand illustration"
      data-hero-scene
    >
      <StaticHeroMark />
      {sceneEnabled ? (
        <SceneErrorBoundary
          fallback={<StaticHeroMark />}
          onError={() => setCanvasReady(false)}
        >
          <HeroScene onCanvasReady={() => setCanvasReady(true)} />
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
}
