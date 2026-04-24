"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MediaCard } from "./MediaCard";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";

interface MediaItem {
  id: string;
  url?: string;
  title?: string;
  name?: string;
  type?: 'image' | 'video' | 'document';
}

function Wall() {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const [localMedia, setLocalMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Fetch local development media
    fetch('/api/local-media')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setLocalMedia(data.files);
        }
      })
      .catch(err => console.error("Failed to load local media:", err));
  }, []);

  // Generate a grid of items
  const items = useMemo(() => {
    const grid = [];
    const rows = 3;
    const cols = 30;
    const spacingX = 5;
    const spacingY = 4;
    const curveIntensity = 0.02;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacingX;
        const y = (j - Math.floor(rows / 2)) * spacingY;
        const z = -Math.pow(x * curveIntensity, 2) * 10;

        // Match with local media if available, otherwise use placeholder
        const mediaIndex = i * rows + j;
        const media = localMedia[mediaIndex % Math.max(1, localMedia.length)];

        grid.push({
          id: media?.id || `item-${i}-${j}`,
          position: [x, y, z] as [number, number, number],
          index: i,
          url: media?.url,
          title: media?.name || media?.title || media?.id || `item-${i}-${j}`,
          type: media?.type || 'image'
        });
      }
    }
    return grid;
  }, [localMedia]);

  useFrame(() => {
    if (!groupRef.current) return;
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
          title={item.title}
          url={item.url}
          type={item.type as any}
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
        <fog attach="fog" args={["#050505", 10, 45]} />
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
