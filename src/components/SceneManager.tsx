'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { LightingRig } from './LightingRig';
import { PlanetPreloader } from './PlanetPreloader';
import { AsteroidField } from './AsteroidField';
import CarouselView from './CarouselView';

function SceneContent() {
  return (
    <>
      <LightingRig />
      <PlanetPreloader />
      <Suspense fallback={null}>
        <AsteroidField />
      </Suspense>
      {/* Persistent planetary system that smoothly animates between Carousel, Top-Down Ring, and About Burst */}
      <CarouselView />
    </>
  );
}

export default function SceneManager() {
  return (
    <div className="fixed inset-0 z-10">
      <Canvas
        camera={{ position: [0, 0.25, 7.2], fov: 50, near: 0.01, far: 1000 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
