'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const ASTEROID_COUNT = 60

export function AsteroidField() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { scene } = useGLTF('/models/asteroids.glb')
  
  const meshData = useMemo((): { geometry: THREE.BufferGeometry | null; material: THREE.Material | null } => {
    let geometry: THREE.BufferGeometry | null = null
    let material: THREE.Material | null = null
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !geometry) {
        geometry = (child as THREE.Mesh).geometry
        material = (child as THREE.Mesh).material as THREE.Material
      }
    })
    
    return { geometry, material }
  }, [scene])

  const dimMaterial = useMemo(() => {
    if (!meshData.material) return new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 })
    const mat = meshData.material.clone() as THREE.MeshStandardMaterial
    mat.emissive = new THREE.Color('#000000')
    mat.color = new THREE.Color('#111111')
    mat.roughness = 0.9
    return mat
  }, [meshData.material])

  // Setup instances
  const { positions, rotations, scales } = useMemo(() => {
    const positions = new Float32Array(ASTEROID_COUNT * 3)
    const rotations = new Float32Array(ASTEROID_COUNT * 3)
    const scales = new Float32Array(ASTEROID_COUNT)

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      // Scatter in a loose toroidal/band shape (radius 15-30, y spread ±5)
      const radius = 15 + Math.random() * 15
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * 10 // ±5

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      rotations[i * 3] = Math.random() * Math.PI
      rotations[i * 3 + 1] = Math.random() * Math.PI
      rotations[i * 3 + 2] = Math.random() * Math.PI

      scales[i] = 0.02 + Math.random() * 0.06 // 0.02 - 0.08
    }

    return { positions, rotations, scales }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Apply initial transforms
  useEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      dummy.rotation.set(rotations[i * 3], rotations[i * 3 + 1], rotations[i * 3 + 2])
      dummy.scale.set(scales[i], scales[i], scales[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy, positions, rotations, scales])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Very subtle rotation and drift
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      meshRef.current.getMatrixAt(i, dummy.matrix)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      
      const euler = new THREE.Euler().setFromQuaternion(dummy.quaternion)
      euler.x += 0.1 * delta * (i % 2 === 0 ? 1 : -1)
      euler.y += 0.15 * delta * (i % 3 === 0 ? 1 : -1)
      dummy.quaternion.setFromEuler(euler)
      
      // Slight oscillation
      const time = state.clock.getElapsedTime()
      dummy.position.y += Math.sin(time * 0.5 + i) * 0.01

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!meshData.geometry) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[meshData.geometry, dimMaterial, ASTEROID_COUNT]}
    />
  )
}

useGLTF.preload('/models/asteroids.glb')
