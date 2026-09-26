'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Environment } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';

// Simple box to verify R3F works at all
function TestBox() {
  return (
    <mesh position={[3, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function TestPlanet({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  const { camera } = useThree();

  useEffect(() => {
    // Log the bounding box to understand scale
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log(`[${path}] Bounding box size:`, size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
    console.log(`[${path}] Center:`, center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));

    // Auto-fit camera to model
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const dist = maxDim * 2.5;
      camera.position.set(center.x, center.y + dist * 0.3, center.z + dist);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }
  }, [scene, camera, path]);

  return <primitive object={scene} />;
}

function FallbackText() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="yellow" wireframe />
    </mesh>
  );
}

export default function TestPage() {
  const [selectedModel, setSelectedModel] = useState('/models/planets/venus.glb');
  const models = [
    '/models/planets/mercury.glb',
    '/models/planets/venus.glb',
    '/models/planets/earth.glb',
    '/models/planets/mars.glb',
    '/models/planets/jupiter.glb',
    '/models/planets/saturn.glb',
    '/models/planets/uranus.glb',
    '/models/planets/neptune.glb',
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 100, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {models.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedModel(m)}
            style={{
              padding: '4px 12px',
              background: selectedModel === m ? '#4FC3F7' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {m.split('/').pop()?.replace('.glb', '')}
          </button>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 100, color: '#4FC3F7', fontSize: 14, fontFamily: 'monospace' }}>
        Check browser Console (F12) for bounding box sizes
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 50, near: 0.001, far: 10000 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, -5, -10]} intensity={0.5} />

        {/* Reference box — if you can see this pink box, R3F works */}
        <TestBox />

        <Suspense fallback={<FallbackText />}>
          <Center>
            <TestPlanet key={selectedModel} path={selectedModel} />
          </Center>
        </Suspense>

        <OrbitControls makeDefault />
        <gridHelper args={[20, 20, '#444', '#222']} />
      </Canvas>
    </div>
  );
}
