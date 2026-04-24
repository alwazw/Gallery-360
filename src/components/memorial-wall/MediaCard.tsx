"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Image } from "@react-three/drei";

interface MediaCardProps {
  position: [number, number, number];
  url?: string;
  title?: string;
  index: number;
}

export function MediaCard({ position, url, title, index }: MediaCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Tilting logic based on position relative to camera center
    const camera = state.camera;
    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);

    // Horizontal distance from the center of the camera's view
    const distFromCenter = worldPosition.x - camera.position.x;

    // Tilt effect: items lean towards the center as they pass it
    // We want them to face slightly more towards the camera
    const targetRotationY = -distFromCenter * 0.05;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      0.1
    );

    // Add a slight vertical tilt based on Y position as well
    const targetRotationX = worldPosition.y * 0.02;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      0.1
    );
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {url ? (
        <Image url={url} transparent opacity={0.9} scale={[4, 3]} />
      ) : (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.9, 2.9]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
      {title && (
        <Text
          position={[0, -1.8, 0.1]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {title}
        </Text>
      )}
    </group>
  );
}
