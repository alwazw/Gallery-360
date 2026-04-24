"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MediaCard } from "./MediaCard";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";

interface WallProps {
  media?: Array<{ id: string; url?: string; title?: string }>;
}

function Wall({ media = [] }: WallProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Generate a grid of items
  const items = useMemo(() => {
    const grid = [];
    const rows = 3;
    const cols = 30; // Increased columns for a more infinite feel
    const spacingX = 5;
    const spacingY = 4;
    const curveIntensity = 0.02;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacingX;
        const y = (j - Math.floor(rows / 2)) * spacingY;
        // The curve intensity makes it feel like an infinite cylinder
        const z = -Math.pow(x * curveIntensity, 2) * 10;

        grid.push({
          id: `item-${i}-${j}`,
          position: [x, y, z] as [number, number, number],
          index: i,
        });
      }
    }
    return grid;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth scrolling using drei's useScroll
    // Offset the entire wall based on scroll progress
    // scroll.offset ranges from 0 to 1
    const totalWidth = 30 * 5;
    groupRef.current.position.x = -scroll.offset * (totalWidth - 10);
  });

  return (
    <group ref={groupRef}>
      {items.map((item) => (
        <MediaCard
          key={item.id}
          position={item.position}
          index={item.index}
          title={item.id}
        />
      ))}
    </group>
  );
}

export default function MemorialWall3D() {
  return (
    <div className="w-full h-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 10, 35]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 10, 10]} intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />

        <ScrollControls horizontal pages={4} damping={0.1}>
          <Scroll>
            <Wall />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
