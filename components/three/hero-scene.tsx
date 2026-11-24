"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { ExtrudeGeometry, Group, Shape } from "three";
import { gsap } from "gsap";

type HeroSceneProps = {
  onCanvasReady: () => void;
};

type SceneContentProps = {
  onReady: (rotate: (alternate: boolean) => void) => void;
};

function FlashMark({ onReady }: SceneContentProps) {
  const markRef = useRef<Group>(null);
  const { gl, invalidate, size } = useThree();
  const flashGeometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-0.48, -0.72);
    shape.lineTo(-0.16, -0.72);
    shape.lineTo(-0.16, -0.14);
    shape.lineTo(0.42, -0.14);
    shape.lineTo(0.42, 0.14);
    shape.lineTo(-0.16, 0.14);
    shape.lineTo(-0.16, 0.44);
    shape.lineTo(0.5, 0.44);
    shape.lineTo(0.5, 0.72);
    shape.lineTo(-0.48, 0.72);
    shape.closePath();

    return new ExtrudeGeometry(shape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 8,
      steps: 1,
    });
  }, []);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;

    const canvas = gl.domElement;
    const rotateXTo = gsap.quickTo(mark.rotation, "x", {
      duration: 0.85,
      ease: "power3.out",
      onUpdate: invalidate,
    });
    const rotateYTo = gsap.quickTo(mark.rotation, "y", {
      duration: 0.85,
      ease: "power3.out",
      onUpdate: invalidate,
    });
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      rotateXTo(0.12 - y * 0.16);
      rotateYTo(-0.12 + x * 0.24);
    };
    const handlePointerLeave = () => {
      rotateXTo(0.12);
      rotateYTo(-0.12);
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entrance.play();
          drift?.play();
          idleRotation?.play();
        } else {
          entrance.pause();
          drift?.pause();
          idleRotation?.pause();
        }
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(canvas);

    const entrance = gsap.timeline({
      paused: true,
      onUpdate: invalidate,
      onComplete: () => {
        drift = gsap.to(mark.position, {
          y: 0.055,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: invalidate,
        });
        idleRotation = gsap.to(mark.rotation, {
          z: 0.035,
          duration: 4.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: invalidate,
        });
      },
    });
    let drift: gsap.core.Tween | undefined;
    let idleRotation: gsap.core.Tween | undefined;
    entrance
      .fromTo(
        mark.scale,
        { x: 0.72, y: 0.72, z: 0.72 },
        { x: 1, y: 1, z: 1, duration: 1.05, ease: "back.out(1.35)" },
      )
      .fromTo(
        mark.position,
        { y: -0.24 },
        { y: 0, duration: 0.9, ease: "power3.out" },
        0,
      )
      .fromTo(
        mark.rotation,
        { x: -0.2, y: 0.38, z: 0.05 },
        { x: 0.12, y: -0.12, z: 0, duration: 1.1, ease: "power3.out" },
        0,
      );

    onReady((alternate) => {
      gsap.to(mark.rotation, {
        x: alternate ? -0.28 : 0.12,
        y: alternate ? -0.72 : -0.12,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: invalidate,
      });
    });

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      visibilityObserver.disconnect();
      entrance.kill();
      drift?.kill();
      idleRotation?.kill();
      gsap.killTweensOf(mark.rotation);
      gsap.killTweensOf(mark.position);
      gsap.killTweensOf(mark.scale);
    };
  }, [gl, invalidate, onReady]);

  return (
    <group
      ref={markRef}
      position={size.width < 600 ? [-0.08, 0.42, 0] : [-0.62, 0.04, 0]}
      rotation={[0.12, -0.12, 0]}
    >
      <mesh rotation={[0.28, 0.08, -0.24]}>
        <torusGeometry args={[1.58, 0.014, 8, 112]} />
        <meshStandardMaterial
          color="#aaa4ff"
          metalness={0.68}
          roughness={0.26}
          emissive="#5249d7"
          emissiveIntensity={0.22}
        />
      </mesh>
      <mesh rotation={[0.98, 0.12, 0.48]}>
        <torusGeometry args={[1.34, 0.019, 8, 112]} />
        <meshStandardMaterial
          color="#70d9ee"
          metalness={0.62}
          roughness={0.28}
          emissive="#126f91"
          emissiveIntensity={0.2}
        />
      </mesh>
      <group position={[-0.14, 0.02, 0]}>
        <RoundedBox args={[1.88, 1.92, 0.42]} radius={0.3} smoothness={3} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#4f49e4"
            metalness={0.38}
            roughness={0.2}
            clearcoat={0.95}
            clearcoatRoughness={0.18}
            emissive="#231b91"
            emissiveIntensity={0.18}
          />
        </RoundedBox>
        <mesh geometry={flashGeometry} position={[0, 0, 0.245]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#f4f3ff"
            metalness={0.16}
            roughness={0.22}
            clearcoat={0.72}
            clearcoatRoughness={0.2}
          />
        </mesh>
        <mesh position={[-0.02, -0.03, -0.222]}>
          <circleGeometry args={[0.68, 40]} />
          <meshBasicMaterial color="#24206f" transparent opacity={0.42} />
        </mesh>
      </group>
      <RoundedBox
        args={[0.35, 0.35, 0.35]}
        radius={0.085}
        smoothness={3}
        position={[1.24, -0.86, 0.1]}
        rotation={[0.2, 0.35, 0.4]}
        castShadow
      >
        <meshPhysicalMaterial color="#afa5ff" metalness={0.5} roughness={0.24} clearcoat={0.8} />
      </RoundedBox>
      <RoundedBox
        args={[0.26, 0.26, 0.26]}
        radius={0.065}
        smoothness={3}
        position={[-1.28, 0.9, -0.12]}
        rotation={[0.45, 0.2, -0.35]}
        castShadow
      >
        <meshPhysicalMaterial color="#70d9ee" metalness={0.48} roughness={0.25} clearcoat={0.75} />
      </RoundedBox>
      <mesh position={[-1.2, -0.98, 0.18]} castShadow>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshStandardMaterial color="#f1c99b" metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SceneContent({ onReady }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#d8dcff", "#141a35", 1.1]} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={2.2} color="#fff4e8" />
      <pointLight position={[-3, 0.2, 2.4]} intensity={11} color="#746dff" distance={7} />
      <pointLight position={[2.5, 2.5, -1.5]} intensity={8} color="#42d4ef" distance={7} />
      <FlashMark onReady={onReady} />
    </>
  );
}

export function HeroScene({ onCanvasReady }: HeroSceneProps) {
  const rotateSceneRef = useRef<((alternate: boolean) => void) | null>(null);
  const [alternate, setAlternate] = useState(false);
  const onReady = useCallback((rotate: (alternate: boolean) => void) => {
    rotateSceneRef.current = rotate;
  }, []);

  const toggleView = () => {
    const next = !alternate;
    setAlternate(next);
    rotateSceneRef.current?.(next);
  };

  return (
    <div className="hero-canvas-wrap">
      <Canvas
        aria-hidden="true"
        camera={{ position: [0.05, 0, 5.35], fov: 36, near: 0.1, far: 30 }}
        dpr={typeof window !== "undefined" && window.innerWidth < 680 ? [0.8, 1] : [1, 1.2]}
        frameloop="demand"
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        onCreated={onCanvasReady}
      >
        <SceneContent onReady={onReady} />
      </Canvas>
      <motion.button
        type="button"
        className="hero-scene-control"
        aria-label={alternate ? "Show Flash mark front view" : "Explore Flash mark 3D angle"}
        aria-pressed={alternate}
        onClick={toggleView}
        whileTap={{ scale: 0.96 }}
      >
        <ArrowLeftRight size={14} aria-hidden="true" />
        <span>{alternate ? "Front view" : "Explore 3D mark"}</span>
      </motion.button>
    </div>
  );
}
