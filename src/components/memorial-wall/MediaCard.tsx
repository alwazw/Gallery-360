"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Image } from "@react-three/drei";
import { FileText, Video } from "lucide-react";

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
      {/* Background card */}
      <mesh ref={meshRef}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Content */}
      {url && type === 'image' ? (
        <Image url={url} transparent opacity={0.9} scale={[4, 3]} />
      ) : (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.9, 2.9]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      )}

      {/* Type Icons for non-images */}
      {type === 'video' && (
        <mesh position={[0, 0, 0.1]}>
           <planeGeometry args={[0.5, 0.5]} />
           <meshBasicMaterial color="white" transparent opacity={0.8} />
        </mesh>
      )}

      {type === 'document' && (
        <mesh position={[0, 0, 0.1]}>
           <planeGeometry args={[0.5, 0.5]} />
           <meshBasicMaterial color="#444" />
        </mesh>
      )}

      {title && (
        <Text
          position={[0, -1.8, 0.15]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
          maxWidth={3.5}
        >
          {title.length > 25 ? title.substring(0, 22) + "..." : title}
        </Text>
      )}
    </group>
  );
}
