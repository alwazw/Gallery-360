"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Image, RoundedBox, useCursor } from "@react-three/drei";
import { useMemorialStore } from "@/hooks/useMemorialStore";

interface MediaCardProps {
  position: [number, number, number];
  url?: string;
  title?: string;
  id: string;
  index: number;
  type?: 'image' | 'video' | 'document';
}

// Document icon geometry
function DocumentIcon({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {/* Lines on document */}
      {[0.2, 0, -0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]}>
          <boxGeometry args={[0.4, 0.05, 0.01]} />
          <meshStandardMaterial color="#718096" />
        </mesh>
      ))}
    </group>
  );
}

// Video play icon
function VideoIcon({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.05, 0, 0.01]}>
        <coneGeometry args={[0.2, 0.3, 3]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

export function MediaCard({ position, url, title, id, index, type = 'image' }: MediaCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { setActiveId, setHoveredId, hoveredId } = useMemorialStore();
  const isHovered = hoveredId === id || hovered;
  
  useCursor(isHovered);

  // Create gradient texture for card background
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const camera = state.camera;
    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);

    const distFromCenter = worldPosition.x - camera.position.x;
    const distY = worldPosition.y;

    // Enhanced tilt effect - cards lean toward camera center
    const targetRotationY = -distFromCenter * 0.04;
    const targetRotationX = distY * 0.015;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      0.08
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      0.08
    );

    // Hover scale animation
    const targetScale = isHovered ? 1.08 : 1;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
    );

    // Hover Z-offset (pop forward)
    const targetZ = isHovered ? 0.5 : 0;
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      position[2] + targetZ,
      0.1
    );

    // Glow intensity
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isHovered ? 0.4 : 0;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
    }
  });

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    setActiveId(id);
  };

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredId(id);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredId(null);
  };

  const showImage = url && type === 'image' && !imageError;

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1], position[2]]}
    >
      {/* Glow effect behind card */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0} />
      </mesh>

      {/* Card background with rounded corners effect */}
      <RoundedBox
        args={[4, 3, 0.08]}
        radius={0.1}
        smoothness={4}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial 
          map={gradientTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </RoundedBox>

      {/* Inner content area */}
      <mesh position={[0, 0.15, 0.05]}>
        <planeGeometry args={[3.8, 2.5]} />
        <meshStandardMaterial color="#0f0f1a" />
      </mesh>

      {/* Media content */}
      {showImage ? (
        <Image 
          url={url} 
          scale={[3.8, 2.5]} 
          position={[0, 0.15, 0.06]}
          transparent
          onError={() => setImageError(true)}
        />
      ) : type === 'video' ? (
        <group position={[0, 0.15, 0.06]}>
          <mesh>
            <planeGeometry args={[3.8, 2.5]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <VideoIcon scale={1.5} />
        </group>
      ) : type === 'document' ? (
        <group position={[0, 0.15, 0.06]}>
          <mesh>
            <planeGeometry args={[3.8, 2.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <DocumentIcon scale={1.8} />
        </group>
      ) : (
        <mesh position={[0, 0.15, 0.06]}>
          <planeGeometry args={[3.8, 2.5]} />
          <meshStandardMaterial color="#1f1f3a" />
        </mesh>
      )}

      {/* Title bar at bottom */}
      <mesh position={[0, -1.2, 0.05]}>
        <planeGeometry args={[3.8, 0.5]} />
        <meshStandardMaterial color="#0a0a14" transparent opacity={0.9} />
      </mesh>

      {/* Title text */}
      {title && (
        <Text
          position={[0, -1.2, 0.1]}
          fontSize={0.18}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.ttf"
          maxWidth={3.5}
        >
          {title.length > 28 ? title.substring(0, 25) + "..." : title}
        </Text>
      )}

      {/* Type indicator badge */}
      <group position={[1.6, 1.1, 0.1]}>
        <mesh>
          <planeGeometry args={[0.6, 0.25]} />
          <meshBasicMaterial 
            color={type === 'video' ? '#ef4444' : type === 'document' ? '#3b82f6' : '#22c55e'} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.ttf"
        >
          {type.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}
