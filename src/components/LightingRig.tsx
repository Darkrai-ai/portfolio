'use client';

export function LightingRig() {
  return (
    <>
      {/* Soft, balanced ambient fill so dark sides are visible without washing out */}
      <ambientLight intensity={0.32} color="#8c9fc2" />

      {/* Matte side-angled key light for Carousel View — highlights 3D etched canyon relief with zero glare */}
      <directionalLight
        position={[-7, 4.5, 6]}
        intensity={1.65}
        color="#f8f6f0"
      />

      {/* Soft overhead light for Top-Down Project Ring View */}
      <directionalLight
        position={[-5, 14, -4]}
        intensity={1.15}
        color="#eef4ff"
      />

      {/* Subtle cool rim light from back-right */}
      <directionalLight
        position={[6, -2, -5]}
        intensity={0.45}
        color="#4FC3F7"
      />

      {/* Deep-space fog */}
      <fog attach="fog" args={['#05070D', 35, 100]} />
    </>
  );
}
