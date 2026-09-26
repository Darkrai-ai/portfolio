'use client';

import { useTexture } from '@react-three/drei';
import { skills } from '../data/skills';
import { TECH_LOGO_PATHS } from '../utils/planetEtching';

// Preload all 2K planet textures and 16 official skill logo SVGs at module load
if (typeof window !== 'undefined') {
  skills.forEach((skill) => {
    useTexture.preload(`/textures/planets/${skill.id}.jpg`);
  });
  Object.values(TECH_LOGO_PATHS).forEach((logoPath) => {
    useTexture.preload(logoPath);
  });
  useTexture.preload('/textures/planets/earth_clouds.jpg');
  useTexture.preload('/textures/planets/venus_atmo.jpg');
  useTexture.preload('/textures/planets/saturn_ring.png');
  useTexture.preload('/textures/planets/moon.jpg');
}

export function PlanetPreloader() {
  return null;
}
