'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Skill } from '../data/skills';
import { useAppStore } from '../store/useAppStore';
import { audioManager } from '../audio/AudioManager';
import {
  etchSkillsIntoPlanetCanvases,
  carveCloudStormEyes,
  carveEquatorialCloudBand,
  TECH_LOGO_PATHS,
} from '../utils/planetEtching';

interface PlanetProps {
  skill: Skill;
  position?: [number, number, number];
  scale?: number;
  focused?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

// Create a ultra-soft Gaussian-style radial glow texture once on the client
let cachedSoftGlowTexture: THREE.CanvasTexture | null = null;
function getSoftGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedSoftGlowTexture) return cachedSoftGlowTexture;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.65)');
    grad.addColorStop(0.38, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.52, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(0.68, 'rgba(255, 255, 255, 0.06)');
    grad.addColorStop(0.84, 'rgba(255, 255, 255, 0.015)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  cachedSoftGlowTexture = new THREE.CanvasTexture(canvas);
  cachedSoftGlowTexture.needsUpdate = true;
  return cachedSoftGlowTexture;
}

// Custom radial-UV ring geometry for Saturn's 2K ring strip texture
function createSaturnRingGeometry(innerRadius = 0.62, outerRadius = 1.15, segments = 128): THREE.RingGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v3 = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const r = v3.length();
    const u = (r - innerRadius) / (outerRadius - innerRadius);
    uv.setXY(i, u, 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * Per-planet visual tuning & real-life inspired relative size multiplier:
 * High roughness (0.94-0.96) and 0 metalness so there is ZERO specular glare or shiny reflection.
 */
export const PLANET_CONFIG: Record<
  string,
  {
    sizeMultiplier: number;
    bumpScale: number;
    roughness: number;
    metalness: number;
    tilt: number;
    filter: string;
    haloColor: string;
    isGasGiant?: boolean;
  }
> = {
  mercury: {
    sizeMultiplier: 0.78,
    bumpScale: 0.22,
    roughness: 0.96,
    metalness: 0.0,
    tilt: 0.03,
    filter: 'contrast(135%) brightness(0.95)',
    haloColor: '#C8D0DC',
  },
  venus: {
    sizeMultiplier: 0.94,
    bumpScale: 0.18,
    roughness: 0.95,
    metalness: 0.0,
    tilt: 0.05,
    filter: 'contrast(135%) saturate(130%) brightness(0.90)',
    haloColor: '#F5A642',
  },
  earth: {
    sizeMultiplier: 0.98,
    bumpScale: 0.18,
    roughness: 0.93,
    metalness: 0.0,
    tilt: 0.22,
    filter: 'contrast(125%) saturate(130%) brightness(0.96)',
    haloColor: '#38B6FF',
  },
  mars: {
    sizeMultiplier: 0.84,
    bumpScale: 0.22,
    roughness: 0.95,
    metalness: 0.0,
    tilt: 0.24,
    filter: 'contrast(135%) saturate(130%) brightness(0.94)',
    haloColor: '#FF5E36',
  },
  jupiter: {
    sizeMultiplier: 1.34,
    bumpScale: 0.15,
    roughness: 0.94,
    metalness: 0.0,
    tilt: 0.05,
    filter: 'contrast(135%) saturate(125%) brightness(0.92)',
    haloColor: '#E6A15C',
    isGasGiant: true,
  },
  saturn: {
    sizeMultiplier: 1.12,
    bumpScale: 0.23,
    roughness: 0.95,
    metalness: 0.0,
    tilt: 0.32,
    filter: 'contrast(155%) saturate(145%) brightness(0.84)',
    haloColor: '#F0D27F',
    isGasGiant: true,
  },
  uranus: {
    sizeMultiplier: 1.06,
    bumpScale: 0.22,
    roughness: 0.94,
    metalness: 0.0,
    tilt: 0.22,
    filter: 'contrast(165%) saturate(165%) brightness(0.78)',
    haloColor: '#5CE1E6',
    isGasGiant: true,
  },
  neptune: {
    sizeMultiplier: 1.04,
    bumpScale: 0.24,
    roughness: 0.94,
    metalness: 0.0,
    tilt: 0.26,
    filter: 'contrast(155%) saturate(170%) brightness(0.90)',
    haloColor: '#3B6EFF',
    isGasGiant: true,
  },
};

const enhancedMapCache: Record<string, { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }> = {};

function getEnhancedPlanetMaps(
  skill: Skill,
  img: HTMLImageElement | ImageBitmap,
  logoImages: (HTMLImageElement | ImageBitmap | undefined)[],
  maxAniso: number
): { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const skillId = `${skill.id}_${skill.techs.join('-')}_v10`;
  if (enhancedMapCache[skillId]) {
    return enhancedMapCache[skillId];
  }

  const cfg = PLANET_CONFIG[skill.id] || PLANET_CONFIG.mercury;
  const w = 1024;
  const h = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const cCtx = colorCanvas.getContext('2d');

  if (cCtx) {
    cCtx.filter = cfg.filter;
    cCtx.drawImage(img, 0, 0, w, h);
    cCtx.filter = 'none';

    if (skill.id === 'uranus' || skill.id === 'saturn' || skill.id === 'neptune') {
      // Subtle polar hood darkening so the sphere has deep 3D atmospheric volume
      cCtx.globalCompositeOperation = 'multiply';
      const poleGrad = cCtx.createLinearGradient(0, 0, 0, h);
      poleGrad.addColorStop(0, 'rgba(35, 50, 78, 0.68)');
      poleGrad.addColorStop(0.18, 'rgba(255, 255, 255, 1)');
      poleGrad.addColorStop(0.82, 'rgba(255, 255, 255, 1)');
      poleGrad.addColorStop(1, 'rgba(35, 50, 78, 0.68)');
      cCtx.fillStyle = poleGrad;
      cCtx.fillRect(0, 0, w, h);
      cCtx.globalCompositeOperation = 'source-over';
    }
  }

  // High-Contrast 3D Bump Map (used ONLY for bumpMap, never roughnessMap, so there is zero glossy glare)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  if (bCtx) {
    bCtx.filter = 'grayscale(100%) contrast(220%)';
    bCtx.drawImage(colorCanvas, 0, 0, w, h);
    bCtx.filter = 'none';

    if (cfg.isGasGiant) {
      // Hardware-accelerated horizontal atmospheric band relief (0.1ms instead of CPU pixel loop)
      bCtx.globalCompositeOperation = 'overlay';
      const bandGrad = bCtx.createLinearGradient(0, 0, 0, h);
      const bands = 28;
      for (let i = 0; i <= bands; i++) {
        const stop = i / bands;
        const tone = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
        bandGrad.addColorStop(stop, tone);
      }
      bCtx.fillStyle = bandGrad;
      bCtx.fillRect(0, 0, w, h);
      bCtx.globalCompositeOperation = 'source-over';
    }
  }

  // Engrave the official skill logo images into BOTH the color texture and 3D bump map
  if (cCtx && bCtx) {
    etchSkillsIntoPlanetCanvases(cCtx, bCtx, logoImages, cfg.haloColor, w, h, skill.id);
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = maxAniso;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAniso;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.needsUpdate = true;

  enhancedMapCache[skillId] = { colorMap, bumpMap };
  return enhancedMapCache[skillId];
}

let cachedEarthLowCloudTex: THREE.CanvasTexture | null = null;
let cachedEarthHighCloudTex: THREE.CanvasTexture | null = null;
const cachedGasLowCloudTex: Record<string, THREE.CanvasTexture> = {};
const cachedGasMidCloudTex: Record<string, THREE.CanvasTexture> = {};
let cachedGasHighCloudTex: THREE.CanvasTexture | null = null;
let cachedSaturnRingTex: THREE.CanvasTexture | null = null;

/**
 * Multi-layered 3D floating clouds above Earth with soft storm-eye clearings & cloud-vapor relief
 * around each skill logo so the engraved logos remain crystal clear.
 */
function EarthCloudLayers({
  dimmed,
  logoImages,
}: {
  dimmed: boolean;
  logoImages: (HTMLImageElement | ImageBitmap | undefined)[];
}) {
  const lowCloudRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const highCloudRef = useRef<THREE.Mesh>(null);
  const rawCloudTex = useTexture('/textures/planets/earth_clouds.jpg');

  const { lowCloudTex, highCloudTex } = useMemo(() => {
    const img = rawCloudTex.image as HTMLImageElement;
    if (!img || typeof document === 'undefined') {
      return { lowCloudTex: rawCloudTex, highCloudTex: rawCloudTex };
    }

    if (!cachedEarthLowCloudTex) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = 'contrast(145%) brightness(1.05)';
        ctx.drawImage(img, 0, 0, 1024, 512);
        ctx.filter = 'none';
        carveCloudStormEyes(ctx, logoImages, 1024, 512, 0.96, 0.26);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      cachedEarthLowCloudTex = tex;
    }

    if (!cachedEarthHighCloudTex) {
      const hCanvas = document.createElement('canvas');
      hCanvas.width = 1024;
      hCanvas.height = 512;
      const hCtx = hCanvas.getContext('2d');
      if (hCtx) {
        hCtx.filter = 'contrast(145%) brightness(1.05)';
        hCtx.drawImage(img, 0, 0, 1024, 512);
        hCtx.filter = 'none';
        carveEquatorialCloudBand(hCtx, 1024, 512);
      }
      const hTex = new THREE.CanvasTexture(hCanvas);
      hTex.colorSpace = THREE.SRGBColorSpace;
      hTex.anisotropy = 8;
      hTex.wrapS = THREE.RepeatWrapping;
      hTex.wrapT = THREE.ClampToEdgeWrapping;
      hTex.needsUpdate = true;
      cachedEarthHighCloudTex = hTex;
    }

    return { lowCloudTex: cachedEarthLowCloudTex, highCloudTex: cachedEarthHighCloudTex };
  }, [rawCloudTex, logoImages]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Gentle atmospheric breathing oscillation keeps the storm-eye clearing locked around each logo
    const sway = Math.sin(t * 0.45) * 0.024;
    if (lowCloudRef.current) {
      lowCloudRef.current.rotation.y = sway;
    }
    if (shadowRef.current) {
      shadowRef.current.rotation.y = sway - 0.018;
    }
    if (highCloudRef.current) {
      highCloudRef.current.rotation.y += 0.12 * delta;
      highCloudRef.current.rotation.x = Math.sin(t * 0.35) * 0.03;
    }
  });

  return (
    <>
      {/* 1. Cloud drop-shadows on the surface below */}
      <mesh ref={shadowRef} scale={[1.003, 1.003, 1.003]} rotation={[0.015, -0.02, 0]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshBasicMaterial
          color="#01040c"
          alphaMap={lowCloudTex}
          transparent
          opacity={dimmed ? 0.14 : 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Main floating cumulus cloud layer (1.032x) with parted storm-eyes around logos */}
      <mesh ref={lowCloudRef} scale={[1.032, 1.032, 1.032]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#e8f0f8"
          map={lowCloudTex}
          alphaMap={lowCloudTex}
          bumpMap={lowCloudTex}
          bumpScale={0.08}
          transparent
          opacity={dimmed ? 0.25 : 0.56}
          depthWrite={false}
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>

      {/* 3. High-altitude upper atmosphere cloud layer (1.058x) */}
      <mesh ref={highCloudRef} scale={[1.058, 1.058, 1.058]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#dde8f4"
          map={highCloudTex}
          alphaMap={highCloudTex}
          bumpMap={highCloudTex}
          bumpScale={0.05}
          transparent
          opacity={dimmed ? 0.15 : 0.34}
          depthWrite={false}
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>
    </>
  );
}

/**
 * Textured 3D Moon orbiting Earth across all views; clicking it opens About Me.
 */
function EarthMoon({ dimmed }: { dimmed: boolean }) {
  const moonOrbitGroup = useRef<THREE.Group>(null);
  const moonMesh = useRef<THREE.Mesh>(null);
  const [moonHovered, setMoonHovered] = useState(false);

  const openAboutMe = useAppStore((s) => s.openAboutMe);
  const view = useAppStore((s) => s.view);
  const exitAboutMe = useAppStore((s) => s.exitAboutMe);
  const moonTex = useTexture('/textures/planets/moon.jpg');

  useMemo(() => {
    moonTex.colorSpace = THREE.SRGBColorSpace;
    moonTex.anisotropy = 16;
    moonTex.needsUpdate = true;
  }, [moonTex]);

  // Delicate orbital ring showing the Moon's path around Earth
  const orbitLine = useMemo(() => {
    const r = 0.88;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: '#B7BEC9',
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geo, mat);
  }, []);

  useEffect(() => {
    if (moonHovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      if (moonHovered) {
        document.body.style.cursor = 'auto';
      }
    };
  }, [moonHovered]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const r = 0.88;
    const angle = t * 0.65;

    if (moonOrbitGroup.current) {
      moonOrbitGroup.current.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      const targetS = moonHovered ? 1.28 : 1.0;
      moonOrbitGroup.current.scale.lerp(new THREE.Vector3(targetS, targetS, targetS), 0.15);
    }

    if (moonMesh.current) {
      moonMesh.current.rotation.y += 0.3 * delta;
    }
  });

  const handleMoonClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    audioManager.play('click');
    if (view === 'about') {
      exitAboutMe();
    } else {
      openAboutMe();
    }
  };

  return (
    <group rotation={[0.22, 0, -0.16]}>
      {/* Subtle lunar orbit path */}
      <primitive object={orbitLine} />

      <group
        ref={moonOrbitGroup}
        onClick={handleMoonClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setMoonHovered(true);
          audioManager.play('hover');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setMoonHovered(false);
        }}
      >
        <mesh ref={moonMesh}>
          <sphereGeometry args={[0.145, 48, 48]} />
          <meshStandardMaterial
            map={moonTex}
            bumpMap={moonTex}
            bumpScale={0.14}
            roughness={0.96}
            metalness={0.0}
            emissive="#d8e0f0"
            emissiveMap={moonTex}
            emissiveIntensity={moonHovered ? 0.18 : 0.06}
            transparent={dimmed}
            opacity={dimmed ? 0.6 : 1.0}
          />
        </mesh>
      </group>
    </group>
  );
}

function VenusAtmosphereLayer({ dimmed }: { dimmed: boolean }) {
  const atmoRef = useRef<THREE.Mesh>(null);
  const atmoTex = useTexture('/textures/planets/venus_atmo.jpg');

  useMemo(() => {
    atmoTex.colorSpace = THREE.SRGBColorSpace;
    atmoTex.anisotropy = 8;
    atmoTex.needsUpdate = true;
  }, [atmoTex]);

  useFrame((_, delta) => {
    if (atmoRef.current) {
      atmoRef.current.rotation.y -= 0.06 * delta;
    }
  });

  return (
    <mesh ref={atmoRef} scale={[1.015, 1.015, 1.015]}>
      <sphereGeometry args={[0.5, 64, 64]} />
      <meshStandardMaterial
        map={atmoTex}
        bumpMap={atmoTex}
        bumpScale={0.05}
        transparent
        opacity={dimmed ? 0.08 : 0.15}
        depthWrite={false}
        roughness={0.96}
        metalness={0.0}
      />
    </mesh>
  );
}

/**
 * Big, dense multi-layered 3D floating clouds & drop-shadows for Saturn, Uranus, and Neptune.
 * Carves terraced "eye-of-the-storm" clearings and 3D cloud-vapor logo relief directly over
 * each skill logo so the big billowing clouds frame the logos instead of burying them.
 */
function GasGiantCloudLayers({
  planetId,
  dimmed,
  logoImages,
}: {
  planetId: string;
  dimmed: boolean;
  logoImages: (HTMLImageElement | ImageBitmap | undefined)[];
}) {
  const shadowRef = useRef<THREE.Mesh>(null);
  const lowCloudRef = useRef<THREE.Mesh>(null);
  const midCloudRef = useRef<THREE.Mesh>(null);
  const highCloudRef = useRef<THREE.Mesh>(null);
  const rawCloudTex = useTexture('/textures/planets/earth_clouds.jpg');

  const { lowCloudTex, midCloudTex, highCloudTex } = useMemo(() => {
    const img = rawCloudTex.image as HTMLImageElement;
    if (!img || typeof document === 'undefined') {
      return { lowCloudTex: rawCloudTex, midCloudTex: rawCloudTex, highCloudTex: rawCloudTex };
    }

    const w = 1024;
    const h = 512;
    const iw = img.width || 2048;
    const ih = img.height || 1024;

    const paintBaseDenseClouds = (ctx: CanvasRenderingContext2D, shiftX = 0) => {
      ctx.filter = 'brightness(1.85) contrast(130%)';
      ctx.drawImage(img, shiftX, ih * 0.12, iw * 0.48, ih * 0.65, 0, 0, w / 2, h);
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, shiftX, ih * 0.12, iw * 0.48, ih * 0.65, 0, 0, w / 2, h);
      ctx.restore();

      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'brightness(1.65) contrast(135%)';
      ctx.drawImage(img, (iw * 0.35 + shiftX) % (iw * 0.5), ih * 0.2, iw * 0.5, ih * 0.58, 0, 0, w / 2, h);
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, (iw * 0.35 + shiftX) % (iw * 0.5), ih * 0.2, iw * 0.5, ih * 0.58, 0, 0, w / 2, h);
      ctx.restore();

      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
    };

    const cacheKey = `${planetId}_${logoImages.length}_v9`;

    if (!cachedGasLowCloudTex[cacheKey]) {
      const lCanvas = document.createElement('canvas');
      lCanvas.width = w;
      lCanvas.height = h;
      const lCtx = lCanvas.getContext('2d');
      if (lCtx) {
        paintBaseDenseClouds(lCtx, 0);
        carveCloudStormEyes(lCtx, logoImages, w, h, 0.96, 0.34);
      }
      const lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace;
      lTex.anisotropy = 8;
      lTex.wrapS = THREE.RepeatWrapping;
      lTex.wrapT = THREE.ClampToEdgeWrapping;
      lTex.needsUpdate = true;
      cachedGasLowCloudTex[cacheKey] = lTex;
    }

    if (!cachedGasMidCloudTex[cacheKey]) {
      const mCanvas = document.createElement('canvas');
      mCanvas.width = w;
      mCanvas.height = h;
      const mCtx = mCanvas.getContext('2d');
      if (mCtx) {
        paintBaseDenseClouds(mCtx, iw * 0.22);
        carveCloudStormEyes(mCtx, logoImages, w, h, 1.08, 0.20);
      }
      const mTex = new THREE.CanvasTexture(mCanvas);
      mTex.colorSpace = THREE.SRGBColorSpace;
      mTex.anisotropy = 8;
      mTex.wrapS = THREE.RepeatWrapping;
      mTex.wrapT = THREE.ClampToEdgeWrapping;
      mTex.needsUpdate = true;
      cachedGasMidCloudTex[cacheKey] = mTex;
    }

    if (!cachedGasHighCloudTex) {
      const hCanvas = document.createElement('canvas');
      hCanvas.width = w;
      hCanvas.height = h;
      const hCtx = hCanvas.getContext('2d');
      if (hCtx) {
        paintBaseDenseClouds(hCtx, iw * 0.12);
        carveEquatorialCloudBand(hCtx, w, h);
      }
      const hTex = new THREE.CanvasTexture(hCanvas);
      hTex.colorSpace = THREE.SRGBColorSpace;
      hTex.anisotropy = 8;
      hTex.wrapS = THREE.RepeatWrapping;
      hTex.wrapT = THREE.ClampToEdgeWrapping;
      hTex.needsUpdate = true;
      cachedGasHighCloudTex = hTex;
    }

    return {
      lowCloudTex: cachedGasLowCloudTex[cacheKey],
      midCloudTex: cachedGasMidCloudTex[cacheKey],
      highCloudTex: cachedGasHighCloudTex,
    };
  }, [rawCloudTex, planetId, logoImages]);

  const cloudTint =
    planetId === 'uranus'
      ? '#d6fcff'
      : planetId === 'neptune'
      ? '#c8e6ff'
      : '#fff0cc';

  const highCloudTint =
    planetId === 'uranus'
      ? '#f0ffff'
      : planetId === 'neptune'
      ? '#e6f4ff'
      : '#fff8e6';

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Subtle multi-altitude breathing keeps the storm-eye cloud walls alive while staying aligned over each logo
    const lowSway = Math.sin(t * 0.42) * 0.022;
    const midSway = Math.cos(t * 0.36) * 0.028;

    if (shadowRef.current) {
      shadowRef.current.rotation.y = lowSway - 0.018;
    }
    if (lowCloudRef.current) {
      lowCloudRef.current.rotation.y = lowSway;
    }
    if (midCloudRef.current) {
      midCloudRef.current.rotation.y = midSway;
    }
    if (highCloudRef.current) {
      highCloudRef.current.rotation.y += 0.14 * delta;
      highCloudRef.current.rotation.x = Math.sin(t * 0.35) * 0.03;
    }
  });

  return (
    <>
      {/* 1. Deep dark cloud drop-shadows cast onto the gas surface below */}
      <mesh ref={shadowRef} scale={[1.005, 1.005, 1.005]} rotation={[0.015, -0.02, 0]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshBasicMaterial
          color="#01040d"
          alphaMap={lowCloudTex}
          transparent
          opacity={dimmed ? 0.22 : 0.46}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Dense lower floating gas cloud deck (1.022x) with storm-eye clearing & 3D cloud-vapor logo relief */}
      <mesh ref={lowCloudRef} scale={[1.022, 1.022, 1.022]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color={cloudTint}
          map={lowCloudTex}
          alphaMap={lowCloudTex}
          bumpMap={lowCloudTex}
          bumpScale={0.14}
          transparent
          opacity={dimmed ? 0.35 : 0.76}
          depthWrite={false}
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* 3. Big billowing mid-troposphere storm cloud layer (1.040x) terraced around each logo */}
      <mesh ref={midCloudRef} scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color={cloudTint}
          map={midCloudTex}
          alphaMap={midCloudTex}
          bumpMap={midCloudTex}
          bumpScale={0.14}
          transparent
          opacity={dimmed ? 0.3 : 0.66}
          depthWrite={false}
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* 4. High-altitude dense canopy clouds (1.060x) sweeping mid-latitudes & poles */}
      <mesh ref={highCloudRef} scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color={highCloudTint}
          map={highCloudTex}
          alphaMap={highCloudTex}
          bumpMap={highCloudTex}
          bumpScale={0.1}
          transparent
          opacity={dimmed ? 0.22 : 0.5}
          depthWrite={false}
          roughness={0.97}
          metalness={0.0}
        />
      </mesh>
    </>
  );
}

function SaturnRings({ dimmed, highlighted }: { dimmed: boolean; highlighted: boolean }) {
  const rawRingTex = useTexture('/textures/planets/saturn_ring.png');
  const ringGeo = useMemo(() => createSaturnRingGeometry(0.62, 1.15, 128), []);

  // Enhance Saturn's ring strip into a warm, luminous golden-champagne color palette
  const ringTex = useMemo(() => {
    if (cachedSaturnRingTex) return cachedSaturnRingTex;
    const img = rawRingTex.image as HTMLImageElement;
    if (!img || typeof document === 'undefined') return rawRingTex;

    const w = 1024;
    const h = 32;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        // Boost brightness and shift neutral grey/taupe pixels to warm golden-cream Saturn ring tones
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        const boosted = Math.pow(lum, 0.72);
        d[i] = Math.min(255, Math.round(boosted * 250 + 18));     // Warm Gold R
        d[i + 1] = Math.min(255, Math.round(boosted * 224 + 12)); // Champagne G
        d[i + 2] = Math.min(255, Math.round(boosted * 170 + 6));  // Cream B
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    cachedSaturnRingTex = tex;
    return tex;
  }, [rawRingTex]);

  return (
    /* Rotate by -Math.PI / 2 + 0.36 so the RingGeometry +Z normal points UPWARD toward the scene lights! */
    <mesh geometry={ringGeo} rotation={[-Math.PI / 2 + 0.36, 0, 0]}>
      <meshStandardMaterial
        map={ringTex}
        color="#fff4d4"
        bumpMap={ringTex}
        bumpScale={0.04}
        transparent
        opacity={dimmed ? 0.72 : 0.96}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.88}
        metalness={0.0}
        emissive={highlighted ? '#ffe299' : '#e6c580'}
        emissiveMap={ringTex}
        emissiveIntensity={highlighted ? 0.55 : 0.42}
      />
    </mesh>
  );
}

export function Planet({
  skill,
  position = [0, 0, 0],
  scale = 1,
  focused = false,
  highlighted = false,
  dimmed = false,
  onClick,
  onPointerOver,
  onPointerOut,
}: PlanetProps) {
  const outerGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const spinBurstRef = useRef(0);
  const prevProjectIdRef = useRef<string | null>(null);
  const focusedProjectId = useAppStore((s) => s.focusedProjectId);

  const { gl } = useThree();
  const texturePath = `/textures/planets/${skill.id}.jpg`;
  const rawSurfaceTex = useTexture(texturePath);
  const logoPaths = useMemo(
    () => skill.techs.map((t) => TECH_LOGO_PATHS[t] || '/logos/javascript.svg'),
    [skill.techs]
  );
  const logoTextures = useTexture(logoPaths);

  const config = PLANET_CONFIG[skill.id] || PLANET_CONFIG.mercury;

  const logoImgs = useMemo(
    () =>
      (Array.isArray(logoTextures) ? logoTextures : [logoTextures]).map(
        (tex) => tex?.image as HTMLImageElement | undefined
      ),
    [logoTextures]
  );

  const { colorMap, bumpMap } = useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy() || 16;
    const img = rawSurfaceTex.image as HTMLImageElement;
    if (img && typeof document !== 'undefined') {
      return getEnhancedPlanetMaps(skill, img, logoImgs, maxAniso);
    }
    return { colorMap: rawSurfaceTex, bumpMap: rawSurfaceTex };
  }, [rawSurfaceTex, logoImgs, skill, gl]);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      if (hovered) {
        document.body.style.cursor = 'auto';
      }
    };
  }, [hovered]);

  const effectiveScale = scale * config.sizeMultiplier;

  useFrame((_, delta) => {
    if (highlighted && prevProjectIdRef.current !== focusedProjectId) {
      prevProjectIdRef.current = focusedProjectId;
      spinBurstRef.current = 6.5;
    } else if (!highlighted) {
      prevProjectIdRef.current = null;
    }

    if (spinGroup.current) {
      // Steady axial rotation + smooth spin burst when flying into Projects Mode stage
      const baseSpin = highlighted ? 0.68 : focused ? 0.45 : 0.36;
      spinGroup.current.rotation.y += (baseSpin + spinBurstRef.current) * delta;
      if (spinBurstRef.current > 0.01) {
        spinBurstRef.current *= Math.pow(0.91, delta * 60);
      } else {
        spinBurstRef.current = 0;
      }
    }

    if (outerGroup.current) {
      const hoverBoost = hovered ? 1.08 : 1.0;
      const targetS = effectiveScale * hoverBoost;
      outerGroup.current.scale.lerp(new THREE.Vector3(targetS, targetS, targetS), 0.12);
    }

    // Keep surface emissive subtle while ensuring dimmed planets remain clearly visible
    if (matRef.current) {
      const targetEmissive = highlighted ? 0.08 : focused ? 0.05 : dimmed ? 0.03 : hovered ? 0.06 : 0.04;
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        targetEmissive,
        0.1
      );
      matRef.current.opacity = THREE.MathUtils.lerp(
        matRef.current.opacity,
        dimmed ? 0.82 : 1.0,
        0.1
      );
    }
  });

  return (
    <group
      ref={outerGroup}
      position={position}
      scale={[effectiveScale, effectiveScale, effectiveScale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onPointerOver?.();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onPointerOut?.();
      }}
    >
      {/* Tilted & Spinning Matte High-Relief 3D Planet Sphere */}
      <group rotation={[0, 0, config.tilt]}>
        <group ref={spinGroup}>
          <mesh>
            <sphereGeometry args={[0.5, 64, 64]} />
            <meshStandardMaterial
              ref={matRef}
              map={colorMap}
              bumpMap={bumpMap}
              bumpScale={config.bumpScale}
              roughness={config.roughness}
              metalness={config.metalness}
              emissive={config.haloColor}
              emissiveMap={colorMap}
              emissiveIntensity={0.04}
              transparent={dimmed}
              opacity={dimmed ? 0.82 : 1.0}
            />
          </mesh>

          {/* Multi-layer floating 3D clouds above Earth, Venus, Saturn, Uranus, and Neptune */}
          {skill.id === 'earth' && <EarthCloudLayers dimmed={dimmed} logoImages={logoImgs} />}
          {skill.id === 'venus' && <VenusAtmosphereLayer dimmed={dimmed} />}
          {(skill.id === 'saturn' || skill.id === 'uranus' || skill.id === 'neptune') && (
            <GasGiantCloudLayers planetId={skill.id} dimmed={dimmed} logoImages={logoImgs} />
          )}
        </group>

        {skill.id === 'saturn' && <SaturnRings dimmed={dimmed} highlighted={highlighted} />}
      </group>

      {/* Textured Moon orbiting Earth across all views (clicking it goes to About Me) */}
      {skill.id === 'earth' && <EarthMoon dimmed={dimmed} />}
    </group>
  );
}
