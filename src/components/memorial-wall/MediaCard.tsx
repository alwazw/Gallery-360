"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Image, Html } from "@react-three/drei";
import { FileText, Video as VideoIcon } from "lucide-react";

interface MediaCardProps {
  position: [number, number, number];
  url?: string;
  title?: string;
  index: number;
  type?: 'image' | 'video' | 'document';
}

export function MediaCard({ position, url, title, index, type = 'image' }: MediaCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const camera = state.camera;
    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);

    const distFromCenter = worldPosition.x - camera.position.x;

    // Tilt effect
    const targetRotationY = -distFromCenter * 0.05;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      0.1
    );

    const targetRotationX = worldPosition.y * 0.02;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      0.1
    );
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Background card with slight depth */}
      <mesh ref={meshRef}>
        <boxGeometry args={[4, 3, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Content Rendering */}
      {url && type === 'image' ? (
        <Image url={url} transparent opacity={0.95} scale={[4, 3]} position={[0, 0, 0.03]} />
      ) : (
        <group position={[0, 0, 0.03]}>
          <mesh>
            <planeGeometry args={[3.8, 2.8]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>

          {/* Use Html from drei to render Lucide icons in 3D space */}
          <Html
            position={[0, 0, 0.01]}
            center
            transform
            distanceFactor={10}
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex flex-col items-center justify-center text-white/40">
              {type === 'video' ? (
                <VideoIcon size={48} strokeWidth={1.5} />
              ) : (
                <FileText size={48} strokeWidth={1.5} />
              )}
            </div>
          </Html>
        </group>
      )}

      {/* Premium Border Highlight */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.05, 3.05]} />
        <meshBasicMaterial color="#333" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {title && (
        <Text
          position={[0, -1.8, 0.1]}
          fontSize={0.22}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
          maxWidth={3.5}
          letterSpacing={0.02}
        >
          {title.length > 25 ? title.substring(0, 22) + "..." : title}
        </Text>
      )}
    </group>
  );
}
