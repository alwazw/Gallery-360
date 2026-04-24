"use client";

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MediaCard } from "./MediaCard";
import { 
  ScrollControls, 
  Scroll, 
  useScroll, 
  Environment,
  Float,
  Text,
  Stars
} from "@react-three/drei";
import { useMemorialStore } from "@/hooks/useMemorialStore";
import type { MediaItem } from "@/types/media";

// Floating particles for ambiance
function Particles({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30 - 10
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime * particle.speed;
      dummy.position.set(
        particle.position[0] + Math.sin(t + i) * 0.5,
        particle.position[1] + Math.cos(t + i * 0.5) * 0.3,
        particle.position[2]
      );
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
    </instancedMesh>
  );
}

// Animated background grid
function BackgroundGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.x = -state.clock.elapsedTime * 0.5 % 5;
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[200, 100, '#1e1e3f', '#1e1e3f']} 
      position={[0, -8, -10]} 
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

function Wall() {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { setMedia, filteredMedia, setLoading, isLoading } = useMemorialStore();

  useEffect(() => {
    setLoading(true);
    fetch('/api/local-media')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          const mediaItems: MediaItem[] = data.files.map((file: any) => ({
            ...file,
            visibility: 'public' as const,
            faces: [],
            tags: [],
          }));
          setMedia(mediaItems);
        }
      })
      .catch(err => console.error("Failed to load local media:", err))
      .finally(() => setLoading(false));
  }, [setMedia, setLoading]);

  // Generate a grid of items on curved plane
  const items = useMemo(() => {
    const grid: Array<{
      id: string;
      position: [number, number, number];
      index: number;
      url?: string;
      title: string;
      type: 'image' | 'video' | 'document';
    }> = [];
    
    const rows = 3;
    const cols = 30;
    const spacingX = 5;
    const spacingY = 4.5;
    const curveIntensity = 0.015;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacingX;
        const y = (j - Math.floor(rows / 2)) * spacingY;
        // Curved plane - items curve away from camera
        const z = -Math.pow(x * curveIntensity, 2) * 12;

        // Match with local media if available
        const mediaIndex = i * rows + j;
        const media = filteredMedia[mediaIndex % Math.max(1, filteredMedia.length)];

        grid.push({
          id: media?.id || `item-${i}-${j}`,
          position: [x, y, z] as [number, number, number],
          index: i,
          url: media?.url,
          title: media?.name || media?.title || `Memory ${mediaIndex + 1}`,
          type: (media?.type as 'image' | 'video' | 'document') || 'image'
        });
      }
    }
    return grid;
  }, [filteredMedia]);

  useFrame(() => {
    if (!groupRef.current) return;
    const totalWidth = 30 * 5;
    groupRef.current.position.x = -scroll.offset * (totalWidth - 15);
  });

  return (
    <group ref={groupRef}>
      {items.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          position={item.position}
          index={item.index}
          title={item.title}
          url={item.url}
          type={item.type}
        />
      ))}
    </group>
  );
}

// Memorial title overlay
function MemorialTitle() {
  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
      <Text
        position={[-5, 6, 0]}
        fontSize={1}
        color="#e2e8f0"
        anchorX="left"
        anchorY="middle"
      >
        In Loving Memory
      </Text>
      <Text
        position={[-5, 4.8, 0]}
        fontSize={0.4}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        A celebration of life through shared memories
      </Text>
    </Float>
  );
}

// Loading state
function LoadingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[0, 0, 5]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.1, 16, 32]} />
        <meshBasicMaterial color="#6366f1" />
      </mesh>
      <Text
        position={[0, -2, 0]}
        fontSize={0.5}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Loading memories...
      </Text>
    </group>
  );
}

// Empty state when no media is available
function EmptyState() {
  return (
    <group position={[0, 0, 5]}>
      <Text
        position={[0, 1, 0]}
        fontSize={0.8}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        No Memories Yet
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.35}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
        textAlign="center"
      >
        {"Add photos, videos, and documents to ~/temp/media\nto see them displayed in this gallery"}
      </Text>
    </group>
  );
}

function Scene() {
  const { isLoading, filteredMedia } = useMemorialStore();
  const hasMedia = filteredMedia.length > 0;
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Key light - warm tone */}
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={0.8} 
        color="#fff5eb"
        castShadow
      />
      
      {/* Fill light - cool tone */}
      <directionalLight 
        position={[-10, 5, -10]} 
        intensity={0.4} 
        color="#e0e7ff"
      />
      
      {/* Rim light for depth */}
      <pointLight position={[0, 10, -20]} intensity={0.5} color="#818cf8" />
      <pointLight position={[50, 0, 10]} intensity={0.3} color="#6366f1" />

      {/* Atmosphere */}
      <fog attach="fog" args={["#0a0a1a", 15, 60]} />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
      <Particles count={80} />
      <BackgroundGrid />

      {isLoading ? (
        <LoadingIndicator />
      ) : !hasMedia ? (
        <>
          <MemorialTitle />
          <EmptyState />
        </>
      ) : (
        <ScrollControls horizontal pages={4} damping={0.15}>
          <Scroll>
            <MemorialTitle />
            <Wall />
          </Scroll>
        </ScrollControls>
      )}
    </>
  );
}

export default function MemorialWall3D() {
  return (
    <div className="w-full h-screen bg-[#0a0a1a]">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0a1a"]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
