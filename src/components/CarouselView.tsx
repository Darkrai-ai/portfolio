'use client';

import React, { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAppStore, type ViewState } from '../store/useAppStore';
import { skills, type Skill } from '../data/skills';
import { projects } from '../data/projects';
import { Planet } from './Planet';
import { audioManager } from '../audio/AudioManager';

const sortedSkills = [...skills].sort((a, b) => a.order - b.order);

/**
 * Sweeping diagonal 3D orbital arc for the main Carousel View.
 * Centered symmetrically between the top header and bottom flat project deck.
 */
function getCarouselPosition(t: number, len: number): [number, number, number] {
  const theta = (t / (len / 2)) * Math.PI;
  const x = Math.sin(theta) * 5.2 + (1 - Math.cos(theta)) * 0.45;
  const y = 0.04 + Math.sin(theta) * 0.95 + (1 - Math.cos(theta)) * 0.15;
  const z = 2.25 - (1 - Math.cos(theta)) * 4.0;
  return [x, y, z];
}

function getCarouselScale(t: number): number {
  return 1.76 / (1 + Math.abs(t) * 0.55);
}

/**
 * Subtle glowing 3D orbital trajectory curve connecting the planets on the main Carousel screen.
 */
function CarouselOrbitTrack({ visible }: { visible: boolean }) {
  const { line, mat } = useMemo(() => {
    const segments = 160;
    const len = sortedSkills.length;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = -len / 2 + (i / segments) * len;
      const [x, y, z] = getCarouselPosition(t, len);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({
      color: '#4FC3F7',
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { line: new THREE.Line(geo, material), mat: material };
  }, []);

  useFrame((_, delta) => {
    const targetOpacity = visible ? 0.15 : 0;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, Math.min(1, delta * 4));
  });

  return <primitive object={line} />;
}

/**
 * Computes the active 3D stage position & scale for planets used by the currently focused project
 * in Projects Mode (view === 'ring'), centered cleanly between the top project header and bottom console.
 */
function getProjectStageTarget(
  activeIndex: number,
  activeCount: number,
  elapsedTime: number,
  isMobile: boolean
): { pos: [number, number, number]; scale: number } {
  if (isMobile) {
    if (activeCount <= 1) {
      return {
        pos: [
          Math.sin(elapsedTime * 0.8) * 0.08,
          0.58 + Math.cos(elapsedTime * 1.0) * 0.05,
          2.05,
        ],
        scale: 1.32,
      };
    }

    if (activeCount === 2) {
      const side = activeIndex === 0 ? -1 : 1;
      const phase = activeIndex * Math.PI;
      return {
        pos: [
          side * 0.86 + Math.cos(elapsedTime * 0.75 + phase) * 0.06,
          0.58 + (activeIndex === 0 ? 0.14 : -0.1) + Math.sin(elapsedTime * 0.95 + phase) * 0.05,
          1.95 + Math.sin(elapsedTime * 0.75 + phase) * 0.08,
        ],
        scale: 1.06,
      };
    }

    const norm = (activeIndex / (activeCount - 1)) * 2 - 1; // -1 .. +1
    const phase = activeIndex * ((Math.PI * 2) / activeCount);
    const isCenter = Math.abs(norm) < 0.15;
    return {
      pos: [
        norm * 0.96 + Math.cos(elapsedTime * 0.7 + phase) * 0.05,
        (isCenter ? 1.02 : 0.24) + Math.sin(elapsedTime * 0.9 + phase) * 0.04,
        (isCenter ? 1.95 : 1.78) + Math.sin(elapsedTime * 0.7 + phase) * 0.07,
      ],
      scale: 0.95,
    };
  }

  if (activeCount <= 1) {
    return {
      pos: [
        Math.sin(elapsedTime * 0.8) * 0.1,
        0.12 + Math.cos(elapsedTime * 1.0) * 0.06,
        2.15,
      ],
      scale: 1.56,
    };
  }

  if (activeCount === 2) {
    const side = activeIndex === 0 ? -1 : 1;
    const phase = activeIndex * Math.PI;
    return {
      pos: [
        side * 1.85 + Math.cos(elapsedTime * 0.75 + phase) * 0.1,
        0.12 + Math.sin(elapsedTime * 0.95 + phase) * 0.06,
        1.95 + Math.sin(elapsedTime * 0.75 + phase) * 0.12,
      ],
      scale: 1.4,
    };
  }

  const norm = (activeIndex / (activeCount - 1)) * 2 - 1; // -1 .. +1
  const phase = activeIndex * ((Math.PI * 2) / activeCount);
  const isCenter = Math.abs(norm) < 0.15;
  return {
    pos: [
      norm * 2.65 + Math.cos(elapsedTime * 0.7 + phase) * 0.08,
      (isCenter ? 0.18 : 0.08) + Math.sin(elapsedTime * 0.9 + phase) * 0.05,
      (isCenter ? 1.92 : 1.72) + Math.sin(elapsedTime * 0.7 + phase) * 0.1,
    ],
    scale: 1.26,
  };
}

/**
 * Off-screen deep space trajectory target for planets NOT used by the active project.
 */
function getDeepSpaceExitPosition(order: number): [number, number, number] {
  const angle = ((order - 1) / 8) * Math.PI * 2 + 0.38;
  return [
    Math.cos(angle) * 16.5,
    Math.sin(angle) * 7.5 + 1.8,
    -14.0,
  ];
}

/**
 * NASA JPL J2000.0 Keplerian Ephemeris Elements (Standish / JPL Solar System Dynamics):
 * - L0: Mean longitude at J2000.0 epoch (deg)
 * - Ldot: Mean longitude rate per Julian century (deg / 36525 days)
 * - wBar: Longitude of perihelion (deg)
 * - e: Orbital eccentricity
 * - iDeg: Orbital inclination to the ecliptic (deg)
 * - nodeDeg: Longitude of ascending node (deg)
 * - relAngularSpeed: Relative Keplerian orbital angular rate (Earth = 1.0)
 */
const JPL_PLANET_ELEMENTS: Record<
  number,
  {
    L0: number;
    Ldot: number;
    wBar: number;
    e: number;
    iDeg: number;
    nodeDeg: number;
    relAngularSpeed: number;
  }
> = {
  1: { L0: 252.2509, Ldot: 149472.6746, wBar: 77.4561, e: 0.20563, iDeg: 7.005, nodeDeg: 48.331, relAngularSpeed: 4.152 }, // Mercury
  2: { L0: 181.9798, Ldot: 58517.8157, wBar: 131.5637, e: 0.00677, iDeg: 3.395, nodeDeg: 76.680, relAngularSpeed: 1.625 }, // Venus
  3: { L0: 100.4665, Ldot: 35999.3729, wBar: 102.9373, e: 0.01671, iDeg: 0.000, nodeDeg: 0.000, relAngularSpeed: 1.000 },  // Earth
  4: { L0: 355.4330, Ldot: 19140.2993, wBar: 336.0602, e: 0.09340, iDeg: 1.850, nodeDeg: 49.558, relAngularSpeed: 0.531 }, // Mars
  5: { L0: 34.3515,  Ldot: 3034.9057,  wBar: 14.3312,  e: 0.04849, iDeg: 1.303, nodeDeg: 100.464, relAngularSpeed: 0.084 }, // Jupiter
  6: { L0: 50.0774,  Ldot: 1222.1138,  wBar: 93.0572,  e: 0.05555, iDeg: 2.485, nodeDeg: 113.665, relAngularSpeed: 0.034 }, // Saturn
  7: { L0: 314.0550, Ldot: 428.4677,   wBar: 173.0053, e: 0.04730, iDeg: 0.773, nodeDeg: 74.006, relAngularSpeed: 0.012 },  // Uranus
  8: { L0: 304.3487, Ldot: 218.4862,   wBar: 48.1203,  e: 0.00859, iDeg: 1.770, nodeDeg: 131.784, relAngularSpeed: 0.006 }, // Neptune
};

const DEG_TO_RAD = Math.PI / 180;

/**
 * Computes the real-time heliocentric true longitude (radians) for a planet right now (Date.now())
 * using the Equation of Center on NASA JPL J2000.0 elements (0 network requests, <0.01ms).
 */
function getRealTimeHeliocentricLongitudeRad(order: number, timestampMs = Date.now()): number {
  const el = JPL_PLANET_ELEMENTS[order] || JPL_PLANET_ELEMENTS[3];
  // Julian centuries T since J2000.0 (2000-01-01 12:00 UTC = JD 2451545.0)
  const jd = timestampMs / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;

  const L = el.L0 + el.Ldot * T;
  const M = (L - el.wBar) * DEG_TO_RAD;
  const e = el.e;

  // Equation of Center (up to O(e^3) for high precision even on eccentric Mercury/Mars)
  const eqCenter =
    (2 * e - 0.25 * e * e * e) * Math.sin(M) +
    1.25 * e * e * Math.sin(2 * M) +
    (13 / 12) * e * e * e * Math.sin(3 * M);

  const trueLonRad = L * DEG_TO_RAD + eqCenter;
  return ((trueLonRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

/**
 * Symmetrically centered 3D Celestial Orrery parameters for the About Me view,
 * anchored to each planet's real-time astronomical heliocentric longitude and orbital inclination.
 */
function getOrbitParams(order: number, timestampMs?: number) {
  const el = JPL_PLANET_ELEMENTS[order] || JPL_PLANET_ELEMENTS[3];
  const radius = 2.0 + (order - 1) * 0.78;
  // Subtle time-lapse angular speed proportional to real Keplerian period so live positions stay recognizable
  const speed = 0.038 * Math.pow(el.relAngularSpeed, 0.45);
  const baseAngle = getRealTimeHeliocentricLongitudeRad(order, timestampMs);
  const tiltX = 0.5;
  const incRad = el.iDeg * DEG_TO_RAD;
  const nodeRad = el.nodeDeg * DEG_TO_RAD;
  return { radius, speed, baseAngle, tiltX, incRad, nodeRad };
}

function getAboutOrbitPosition(
  order: number,
  aboutElapsedSec: number,
  timestampMs?: number
): [number, number, number] {
  const { radius, speed, baseAngle, tiltX, incRad, nodeRad } = getOrbitParams(order, timestampMs);
  // Counter-clockwise heliocentric progression when viewed from above North Ecliptic Pole (+Y)
  const angle = baseAngle + aboutElapsedSec * speed;
  const flatX = Math.cos(angle) * radius;
  const flatZ = -Math.sin(angle) * radius;
  // Apply each planet's real orbital plane inclination relative to the ecliptic before camera tilt
  const eclipticY = Math.sin(angle - nodeRad) * Math.sin(incRad) * radius;
  const y = eclipticY * Math.cos(tiltX) - flatZ * Math.sin(tiltX);
  const z = eclipticY * Math.sin(tiltX) + flatZ * Math.cos(tiltX);
  return [flatX, y, z];
}

/**
 * Delicate glowing 3D orbital trajectory rings centered symmetrically in the About Me view,
 * matching each planet's real ecliptic inclination.
 */
function AboutOrbitRings({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const orbitLines = useMemo(() => {
    return sortedSkills.map((skill) => {
      const { radius, tiltX, incRad, nodeRad } = getOrbitParams(skill.order);
      const segments = 128;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const fx = Math.cos(a) * radius;
        const fz = -Math.sin(a) * radius;
        const ecY = Math.sin(a - nodeRad) * Math.sin(incRad) * radius;
        const fy = ecY * Math.cos(tiltX) - fz * Math.sin(tiltX);
        const rz = ecY * Math.sin(tiltX) + fz * Math.cos(tiltX);
        points.push(new THREE.Vector3(fx, fy, rz));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: skill.order % 2 === 0 ? '#4FC3F7' : '#8B6BF2',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      return { id: skill.id, line, mat };
    });
  }, []);

  useFrame((_, delta) => {
    const targetOpacity = visible ? 0.22 : 0;
    orbitLines.forEach(({ mat }) => {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, Math.min(1, delta * 4));
    });
  });

  return (
    <group ref={groupRef}>
      {orbitLines.map(({ id, line }) => (
        <primitive key={id} object={line} />
      ))}
    </group>
  );
}

interface PlanetItemProps {
  skill: Skill;
  index: number;
  focusOffsetRef: React.RefObject<number>;
  len: number;
  view: ViewState;
  focusedProjectId: string | null;
  activeIndex: number;
  activeCount: number;
  isFocused: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isMobile: boolean;
  onSelectPlanet: (skillId: string, index: number) => void;
}

function PlanetItem({
  skill,
  index,
  focusOffsetRef,
  len,
  view,
  focusedProjectId,
  activeIndex,
  activeCount,
  isFocused,
  isHighlighted,
  isDimmed,
  isMobile,
  onSelectPlanet,
}: PlanetItemProps) {
  const ref = useRef<THREE.Group>(null);
  const ringPresenceRef = useRef(isHighlighted ? 1 : 0);
  const stagePosRef = useRef(new THREE.Vector3(0, 0.12, 1.95));
  const stageScaleRef = useRef(1.35);
  const spinImpulseRef = useRef(0);
  const prevProjectRef = useRef<string | null>(null);
  const prevViewLocalRef = useRef<ViewState>(view);
  const aboutEnteredClockRef = useRef(0);
  const aboutTimestampRef = useRef(Date.now());

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (view === 'ring') {
      // Trigger a dynamic rotational spin burst when entering Projects Mode or switching projects
      if (prevViewLocalRef.current !== 'ring' || prevProjectRef.current !== focusedProjectId) {
        prevViewLocalRef.current = 'ring';
        prevProjectRef.current = focusedProjectId;
        if (isHighlighted) {
          spinImpulseRef.current = 8.5;
        }
      }

      // Smoothly update the planet's target slot on stage if it is active
      if (isHighlighted && activeIndex >= 0) {
        const { pos, scale } = getProjectStageTarget(
          activeIndex,
          activeCount,
          state.clock.elapsedTime,
          isMobile
        );
        stagePosRef.current.lerp(new THREE.Vector3(...pos), Math.min(1, delta * 5.5));
        stageScaleRef.current = THREE.MathUtils.lerp(
          stageScaleRef.current,
          scale,
          Math.min(1, delta * 5.5)
        );
      }

      // Advance ringPresence (0 = off-screen in deep space, 1 = on center stage)
      const targetPresence = isHighlighted ? 1 : 0;
      const speed = isHighlighted ? 1.55 : 1.85;
      if (ringPresenceRef.current < targetPresence) {
        ringPresenceRef.current = Math.min(1, ringPresenceRef.current + delta * speed);
      } else if (ringPresenceRef.current > targetPresence) {
        ringPresenceRef.current = Math.max(0, ringPresenceRef.current - delta * speed);
      }

      const p = ringPresenceRef.current;
      const [outX, outY, outZ] = getDeepSpaceExitPosition(skill.order);

      // Curved 3D orbital swoop trajectory between deep space and the active stage
      const easePos = 1 - Math.pow(1 - p, 3);
      const swirl = Math.sin(p * Math.PI);
      const sideSign = outX >= 0 ? 1 : -1;

      const curX =
        THREE.MathUtils.lerp(outX, stagePosRef.current.x, easePos) +
        sideSign * swirl * (isMobile ? 1.05 : 3.2);
      const curY =
        THREE.MathUtils.lerp(outY, stagePosRef.current.y, easePos) +
        swirl * 0.45;
      const curZ =
        THREE.MathUtils.lerp(outZ, stagePosRef.current.z, easePos) +
        swirl * 2.0;

      // Elastic back-out scale when arriving on stage, smooth shrink when flying out
      let curScale: number;
      if (isHighlighted) {
        const c1 = 1.45;
        const c3 = c1 + 1;
        const backOut = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
        curScale = Math.max(0.001, backOut * stageScaleRef.current);
      } else {
        curScale = Math.max(0.001, Math.pow(p, 2) * stageScaleRef.current);
      }

      ref.current.position.set(curX, curY, curZ);
      ref.current.scale.set(curScale, curScale, curScale);
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        0.08,
        Math.min(1, delta * 6.0)
      );
      ref.current.rotation.y = 0;
      return;
    }

    if (view === 'about' && prevViewLocalRef.current !== 'about') {
      aboutEnteredClockRef.current = state.clock.elapsedTime;
      aboutTimestampRef.current = Date.now();
    }
    prevViewLocalRef.current = view;
    ringPresenceRef.current = isHighlighted ? 1 : 0;

    let targetPos: [number, number, number];
    let targetScale: number;
    let targetRotX = 0;

    if (view === 'about') {
      const aboutElapsed = Math.max(0, state.clock.elapsedTime - aboutEnteredClockRef.current);
      targetPos = getAboutOrbitPosition(skill.order, aboutElapsed, aboutTimestampRef.current);
      targetScale = 0.92;
      targetRotX = -0.35;
    } else {
      // 'carousel' or 'intro'
      const offset = focusOffsetRef.current ?? 0;
      let t = index - offset;
      while (t > len / 2) t -= len;
      while (t < -len / 2) t += len;

      targetPos = getCarouselPosition(t, len);
      targetScale = getCarouselScale(t);
      targetRotX = 0;
    }

    const lerpSpeed = Math.min(1, delta * (view === 'about' ? 4.5 : 7.0));
    ref.current.position.lerp(new THREE.Vector3(...targetPos), lerpSpeed);
    ref.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      lerpSpeed
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRotX, lerpSpeed);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, lerpSpeed);
  });

  return (
    <group ref={ref}>
      <Suspense fallback={null}>
        <Planet
          skill={skill}
          position={[0, 0, 0]}
          scale={1}
          focused={(view === 'carousel' && isFocused) || view === 'about' || (view === 'ring' && isHighlighted)}
          highlighted={view === 'ring' && isHighlighted}
          dimmed={view === 'ring' && isDimmed}
          onClick={() => onSelectPlanet(skill.id, index)}
          onPointerOver={() => audioManager.play('hover')}
        />
      </Suspense>
    </group>
  );
}

export default function CarouselView() {
  const view = useAppStore((s) => s.view);
  const focusedPlanetId = useAppStore((s) => s.focusedPlanetId);
  const focusedProjectId = useAppStore((s) => s.focusedProjectId);
  const focusPlanet = useAppStore((s) => s.focusPlanet);
  const setIsSpinning = useAppStore((s) => s.setIsSpinning);
  const closeProject = useAppStore((s) => s.closeProject);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const isMobile = useAppStore((s) => s.isMobile);

  const { gl, camera } = useThree();
  const len = sortedSkills.length;

  const focusOffset = useRef(0);
  const targetOffset = useRef(0);
  const scrollVelocity = useRef(0);
  const lastInteraction = useRef(Date.now());
  const lastWheelTime = useRef(0);
  const lastFocusedIndex = useRef(0);
  const lastSpinningRef = useRef(false);
  const prevViewRef = useRef<ViewState>(view);
  const [mountedCount, setMountedCount] = useState(1);

  // Stagger mounting the 8 3D planets 1 by 1 across separate frames so WebGL texture uploads
  // and shader compilation never bunch up on a single frame during the IntroSequence
  useEffect(() => {
    if (mountedCount >= sortedSkills.length) return;
    const timer = setTimeout(() => {
      setMountedCount((prev) => Math.min(sortedSkills.length, prev + 1));
    }, 120);
    return () => clearTimeout(timer);
  }, [mountedCount]);

  const activeProject = projects.find((p) => p.id === focusedProjectId);
  const activeSkillIds = sortedSkills
    .filter((s) => activeProject?.skillIds.includes(s.id))
    .map((s) => s.id);

  // Animate camera and play transition/whoosh audio when switching between views
  useEffect(() => {
    gsap.killTweensOf(camera.position);

    if (prevViewRef.current !== view) {
      if (view === 'about' || prevViewRef.current === 'about') {
        audioManager.play('transition');
      } else if (view === 'ring' || prevViewRef.current === 'ring') {
        audioManager.play('whoosh');
      }
      prevViewRef.current = view;
    }

    if (view === 'ring') {
      // Eye-level frontal stage view so the active project's planets swoop in & rotate prominently above the project card
      gsap.to(camera.position, {
        x: 0,
        y: isMobile ? 0.35 : 0.28,
        z: isMobile ? 11.2 : 7.6,
        duration: reducedMotion ? 0.2 : 1.15,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    } else if (view === 'about') {
      // Symmetrically centered 3D Celestial Orrery vantage point
      gsap.to(camera.position, {
        x: 0,
        y: isMobile ? 11.5 : 9.5,
        z: isMobile ? 16.5 : 13.0,
        duration: reducedMotion ? 0.2 : 1.5,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    } else if (view === 'carousel' || view === 'intro') {
      // Eye-level front view facing the carousel spiral
      gsap.to(camera.position, {
        x: 0,
        y: isMobile ? 0.18 : 0.25,
        z: isMobile ? 9.2 : 7.2,
        duration: reducedMotion ? 0.2 : 1.25,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    }
  }, [view, camera, reducedMotion, isMobile]);

  // Free-spinning inertia scroll wheel + touch swipe + keyboard arrow navigation in Carousel View
  useEffect(() => {
    if (view !== 'carousel') return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      lastInteraction.current = now;
      lastWheelTime.current = now;

      // Free momentum impulse — less sensitive per event, builds up smoothly if user scrolls hard
      const clampedDelta = THREE.MathUtils.clamp(e.deltaY, -140, 140);
      scrollVelocity.current += clampedDelta * 0.00028;
      scrollVelocity.current = THREE.MathUtils.clamp(scrollVelocity.current, -0.14, 0.14);

      if (Math.abs(e.deltaY) > 18) {
        audioManager.play('scroll');
      }
    };

    let touchLastX = 0;
    let touchLastY = 0;
    let touchDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
      touchDragging = true;
      lastInteraction.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - touchLastX;
      const dy = y - touchLastY;
      touchLastX = x;
      touchLastY = y;

      // Support both horizontal swipe (natural left/right) and vertical swipe
      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? -dx : -dy;
      if (Math.abs(primaryDelta) < 0.5) return;

      const now = Date.now();
      lastInteraction.current = now;
      lastWheelTime.current = now;

      const clamped = THREE.MathUtils.clamp(primaryDelta, -80, 80);
      focusOffset.current += clamped * 0.0042;
      targetOffset.current = focusOffset.current;
      scrollVelocity.current = THREE.MathUtils.clamp(
        scrollVelocity.current * 0.5 + clamped * 0.0011,
        -0.12,
        0.12
      );

      if (Math.abs(primaryDelta) > 10) {
        audioManager.play('scroll');
      }
    };

    const handleTouchEnd = () => {
      if (!touchDragging) return;
      touchDragging = false;
      lastInteraction.current = Date.now();
      if (Math.abs(scrollVelocity.current) < 0.004) {
        scrollVelocity.current = 0;
        targetOffset.current = Math.round(focusOffset.current);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        scrollVelocity.current = 0;
        targetOffset.current = Math.round(focusOffset.current) + 1;
        lastInteraction.current = Date.now();
        audioManager.play('scroll');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        scrollVelocity.current = 0;
        targetOffset.current = Math.round(focusOffset.current) - 1;
        lastInteraction.current = Date.now();
        audioManager.play('scroll');
      }
    };

    const domElement = gl.domElement;
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      domElement.removeEventListener('touchmove', handleTouchMove);
      domElement.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl, view]);

  // Sync targetOffset when focusedPlanetId is changed externally (e.g. from Main Menu HUD navigation)
  useEffect(() => {
    const targetIdx = sortedSkills.findIndex((s) => s.id === focusedPlanetId);
    if (targetIdx === -1) return;

    if (targetIdx !== lastFocusedIndex.current) {
      lastInteraction.current = Date.now();
      scrollVelocity.current = 0;

      const currentMod = ((focusOffset.current % len) + len) % len;
      let diff = targetIdx - currentMod;
      if (diff > len / 2) diff -= len;
      if (diff < -len / 2) diff += len;

      targetOffset.current = focusOffset.current + diff;
      lastFocusedIndex.current = targetIdx;
    }
  }, [focusedPlanetId, len]);

  // Handle clicking any planet in either Ring View or Carousel View
  const handleSelectPlanet = (skillId: string, index: number) => {
    lastInteraction.current = Date.now();
    scrollVelocity.current = 0;
    audioManager.play('click');

    const currentMod = ((focusOffset.current % len) + len) % len;
    let diff = index - currentMod;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    targetOffset.current = focusOffset.current + diff;
    lastFocusedIndex.current = index;
    focusPlanet(skillId);

    if (view === 'ring') {
      closeProject();
    }
  };

  useFrame((_, delta) => {
    camera.lookAt(0, 0, 0);

    if (view !== 'carousel') {
      if (lastSpinningRef.current) {
        lastSpinningRef.current = false;
        setIsSpinning(false);
      }
      return;
    }

    const now = Date.now();
    const isIdle = now - lastInteraction.current > 6000;
    const isSpinningFromWheel = Math.abs(scrollVelocity.current) > 0.0004;

    if (isSpinningFromWheel) {
      focusOffset.current += scrollVelocity.current * (delta * 60);
      scrollVelocity.current *= Math.pow(0.962, delta * 60);

      if (Math.abs(scrollVelocity.current) < 0.002 && now - lastWheelTime.current > 180) {
        targetOffset.current = Math.round(focusOffset.current);
      } else {
        targetOffset.current = focusOffset.current;
      }
    } else {
      scrollVelocity.current = 0;

      if (isIdle && !reducedMotion) {
        targetOffset.current += 0.045 * delta;
      }

      focusOffset.current = THREE.MathUtils.lerp(
        focusOffset.current,
        targetOffset.current,
        Math.min(1, delta * 4.2)
      );
    }

    // Determine whether the carousel is actively spinning/gliding before landing on a planet
    const spinningNow =
      !isIdle &&
      (Math.abs(scrollVelocity.current) > 0.0018 ||
        (now - lastWheelTime.current <= 180 && Math.abs(scrollVelocity.current) > 0.0003) ||
        Math.abs(focusOffset.current - targetOffset.current) > 0.16);

    if (spinningNow !== lastSpinningRef.current) {
      lastSpinningRef.current = spinningNow;
      setIsSpinning(spinningNow);
    }

    // Update focused planet index during free wheel spin, idle drift, or when settled on target
    const isTargetedGlide = !isSpinningFromWheel && !isIdle && Math.abs(focusOffset.current - targetOffset.current) > 0.35;
    if (!isTargetedGlide) {
      const refOffset = isSpinningFromWheel || isIdle ? focusOffset.current : targetOffset.current;
      let nearestIndex = Math.round(refOffset) % len;
      if (nearestIndex < 0) nearestIndex += len;

      if (nearestIndex !== lastFocusedIndex.current) {
        lastFocusedIndex.current = nearestIndex;
        const currentSkill = sortedSkills[nearestIndex];
        if (currentSkill) {
          focusPlanet(currentSkill.id);
          if (!isIdle) {
            audioManager.play('scroll');
          }
        }
      }
    }
  });

  return (
    <group>
      {/* Subtle 3D orbital track on the main Carousel screen */}
      <CarouselOrbitTrack visible={view === 'carousel'} />

      {/* Glowing 3D orbital tracks in About Me view */}
      <AboutOrbitRings visible={view === 'about'} />

      {sortedSkills.slice(0, mountedCount).map((skill, index) => {
        const isFocused = skill.id === focusedPlanetId;
        const activeIndex = activeSkillIds.indexOf(skill.id);
        const isHighlighted = activeIndex !== -1;
        const isDimmed = !isHighlighted;

        return (
          <PlanetItem
            key={skill.id}
            skill={skill}
            index={index}
            focusOffsetRef={focusOffset}
            len={len}
            view={view}
            focusedProjectId={focusedProjectId}
            activeIndex={activeIndex}
            activeCount={activeSkillIds.length}
            isFocused={isFocused}
            isHighlighted={isHighlighted}
            isDimmed={isDimmed}
            isMobile={isMobile}
            onSelectPlanet={handleSelectPlanet}
          />
        );
      })}
    </group>
  );
}
