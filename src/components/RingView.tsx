'use client';

import React, { useEffect, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { skills } from '../data/skills';
import { projects } from '../data/projects';
import { Planet } from './Planet';

function getRingPosition(order: number): [number, number, number] {
  const angle = ((order - 1) / 8) * Math.PI * 2 - Math.PI / 2;
  const radius = 5;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

export function RingView() {
  const { camera } = useThree();
  const focusedProjectId = useAppStore((state) => state.focusedProjectId);
  const focusPlanet = useAppStore((state) => state.focusPlanet);
  const closeProject = useAppStore((state) => state.closeProject);

  const activeProject = projects.find((p) => p.id === focusedProjectId);
  const activeSkillIds = activeProject?.skillIds || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(camera.position, {
        x: 0,
        y: 8,
        z: 6,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    });

    return () => ctx.revert();
  }, [camera]);

  const handlePlanetClick = (skillId: string) => {
    focusPlanet(skillId);
    closeProject();
  };

  return (
    <group>
      {skills.map((skill) => {
        const isHighlighted = activeSkillIds.includes(skill.id);
        const position = getRingPosition(skill.order);
        const scale = isHighlighted ? 1.4 : 1;

        return (
          <Suspense key={skill.id} fallback={null}>
            <Planet
              skill={skill}
              position={position}
              scale={scale}
              highlighted={isHighlighted}
              dimmed={!isHighlighted}
              onClick={() => handlePlanetClick(skill.id)}
            />
          </Suspense>
        );
      })}
    </group>
  );
}

export default RingView;
