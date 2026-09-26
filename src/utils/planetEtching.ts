/**
 * Official SVG logo paths for all 16 skills across the 8 planets.
 */
export const TECH_LOGO_PATHS: Record<string, string> = {
  JavaScript: '/logos/javascript.svg',
  React: '/logos/react.svg',
  CSS: '/logos/css.svg',
  Tailwind: '/logos/tailwind.svg',
  'Next.js': '/logos/nextjs.svg',
  'Three.js': '/logos/threejs.svg',
  IoT: '/logos/iot.svg',
  Flutter: '/logos/flutter.svg',
  Python: '/logos/python.svg',
  PyTorch: '/logos/pytorch.svg',
  'C#': '/logos/csharp.svg',
  Unity: '/logos/unity.svg',
  Java: '/logos/java.svg',
  Kotlin: '/logos/kotlin.svg',
  PostgreSQL: '/logos/postgresql.svg',
  SQLite: '/logos/sqlite.svg',
};

/**
 * Lightly engraves the official skill logo images into opposite hemispheres (x = 0.25*W and x = 0.75*W)
 * on both the 2K color texture and the 3D bump map canvas.
 * Uses 'overlay' and 'screen' blending so the logos appear LIGHTER than the planet surface
 * and naturally engraved into the rock/clouds (never dark or inburnt).
 */
export function etchSkillsIntoPlanetCanvases(
  colorCtx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  logoImages: (HTMLImageElement | ImageBitmap | undefined)[],
  haloColor: string,
  width: number,
  height: number,
  planetId?: string
) {
  if (!logoImages || logoImages.length === 0) return;

  // If a planet has a single skill (e.g. Mars -> IoT), engrave it on both opposite hemispheres
  // so it remains visible as the planet rotates; for 2 or 3 skills, space them evenly around the equator.
  const effectiveLogos =
    logoImages.length === 1 ? [logoImages[0], logoImages[0]] : logoImages;
  const count = effectiveLogos.length;
  const size = count >= 3 ? height * 0.31 : height * 0.34;
  const cy = height * 0.5; // Centered on the equator for zero aspect distortion

  const isCloudedOrBright =
    planetId === 'saturn' ||
    planetId === 'uranus' ||
    planetId === 'neptune' ||
    planetId === 'earth' ||
    planetId === 'venus' ||
    planetId === 'jupiter';

  for (let i = 0; i < count; i++) {
    const img = effectiveLogos[i];
    if (!img) continue;

    const cx = width * ((i + 0.5) / count);
    const x = cx - size / 2;
    const y = cy - size / 2;

    // =========================================================================
    // 1. 3D BUMP MAP ENGRAVING (Chiseled Bevel & Surface Relief)
    // =========================================================================
    // Top-left chiseled groove line
    bumpCtx.save();
    bumpCtx.filter = 'invert(100%)';
    bumpCtx.globalCompositeOperation = 'multiply';
    bumpCtx.globalAlpha = 0.78;
    bumpCtx.drawImage(img, x - 3, y - 3, size, size);
    bumpCtx.restore();

    // Bottom-right sunlit bevel rim
    bumpCtx.save();
    bumpCtx.globalCompositeOperation = 'screen';
    bumpCtx.globalAlpha = 0.86;
    bumpCtx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    bumpCtx.shadowBlur = 6;
    bumpCtx.drawImage(img, x + 2.5, y + 2.5, size, size);
    bumpCtx.restore();

    // Interior relief (preserves underlying planet bump grain inside the logo)
    bumpCtx.save();
    bumpCtx.globalCompositeOperation = 'screen';
    bumpCtx.globalAlpha = 0.36;
    bumpCtx.drawImage(img, x, y, size, size);
    bumpCtx.restore();

    // =========================================================================
    // 2. COLOR TEXTURE ENGRAVING (Subtle Chiseled Basin + Sunlit Rim)
    // =========================================================================
    // Pass 0: On clouded/bright gas planets, carve a gentle darkened storm-eye basin
    // behind the logo so bright surfaces (Uranus, Saturn, Earth) have natural contrast
    if (isCloudedOrBright) {
      colorCtx.save();
      colorCtx.globalCompositeOperation = 'multiply';
      const basinRadius = size * 0.64;
      const basinGrad = colorCtx.createRadialGradient(cx, cy, size * 0.08, cx, cy, basinRadius);
      basinGrad.addColorStop(0.0, 'rgba(12, 18, 32, 0.24)');
      basinGrad.addColorStop(0.55, 'rgba(12, 18, 32, 0.15)');
      basinGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      colorCtx.fillStyle = basinGrad;
      colorCtx.beginPath();
      colorCtx.arc(cx, cy, basinRadius, 0, Math.PI * 2);
      colorCtx.fill();
      colorCtx.restore();
    }

    // Pass A: Top-left chiseled bevel shadow trench
    colorCtx.save();
    colorCtx.filter = 'invert(100%)';
    colorCtx.globalCompositeOperation = 'multiply';
    colorCtx.globalAlpha = isCloudedOrBright ? 0.34 : 0.22;
    colorCtx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    colorCtx.shadowBlur = isCloudedOrBright ? 6 : 4;
    colorCtx.drawImage(img, x - 2, y - 2, size, size);
    colorCtx.restore();

    // Pass B: Soft bottom-right sunlit bevel edge catching light
    colorCtx.save();
    colorCtx.globalCompositeOperation = 'screen';
    colorCtx.globalAlpha = isCloudedOrBright ? 0.26 : 0.17;
    colorCtx.shadowColor = haloColor;
    colorCtx.shadowBlur = isCloudedOrBright ? 5 : 4;
    colorCtx.drawImage(img, x + 2, y + 2, size, size);
    colorCtx.restore();

    // Pass C: Soft overlay pass — shifts the planet's own rock/cloud texture
    colorCtx.save();
    colorCtx.globalCompositeOperation = 'overlay';
    colorCtx.globalAlpha = isCloudedOrBright ? 0.32 : 0.24;
    colorCtx.drawImage(img, x, y, size, size);
    colorCtx.restore();

    // Pass D: Gentle screen pass — keeps the engraving legible yet naturally blended
    colorCtx.save();
    colorCtx.globalCompositeOperation = 'screen';
    colorCtx.globalAlpha = isCloudedOrBright ? 0.20 : 0.11;
    colorCtx.drawImage(img, x, y, size, size);
    colorCtx.restore();
  }
}

/**
 * Carves soft, feathered "eye-of-the-storm" clearings into a 3D cloud canvas directly over
 * each skill logo position so billowing clouds frame the logos instead of obscuring them,
 * and sculpts a subtle cloud-vapor relief of the logo inside the clearing.
 * Note: Three.js alphaMap reads the GREEN channel (.g) of the texture (black = transparent, white = opaque).
 */
export function carveCloudStormEyes(
  cloudCtx: CanvasRenderingContext2D,
  logoImages: (HTMLImageElement | ImageBitmap | undefined)[],
  width: number,
  height: number,
  clearingScale = 1.0,
  vaporEmbossAlpha = 0.30
) {
  if (!logoImages || logoImages.length === 0) return;

  const effectiveLogos =
    logoImages.length === 1 ? [logoImages[0], logoImages[0]] : logoImages;
  const count = effectiveLogos.length;
  const size = count >= 3 ? height * 0.31 : height * 0.34;
  const cy = height * 0.5;

  for (let i = 0; i < count; i++) {
    const img = effectiveLogos[i];
    const cx = width * ((i + 0.5) / count);
    const x = cx - size / 2;
    const y = cy - size / 2;

    const rInner = size * 0.44 * clearingScale;
    const rOuter = size * 0.76 * clearingScale;

    // 1. Paint a soft black radial gradient over the cloud map so Three.js alphaMap (.g channel)
    // opens a feathered storm-eye window directly over each skill logo while leaving a subtle atmospheric veil
    cloudCtx.save();
    cloudCtx.globalCompositeOperation = 'source-over';
    const clearGrad = cloudCtx.createRadialGradient(cx, cy, rInner * 0.25, cx, cy, rOuter);
    clearGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.86)');
    clearGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.78)');
    clearGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.38)');
    clearGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    cloudCtx.fillStyle = clearGrad;
    cloudCtx.beginPath();
    cloudCtx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    cloudCtx.fill();
    cloudCtx.restore();

    // 2. Sculpt a subtle 3D cloud-vapor trace of the logo inside the storm-eye clearing
    if (img && vaporEmbossAlpha > 0) {
      cloudCtx.save();
      cloudCtx.globalCompositeOperation = 'source-over';
      cloudCtx.globalAlpha = vaporEmbossAlpha;
      cloudCtx.shadowColor = 'rgba(255, 255, 255, 0.75)';
      cloudCtx.shadowBlur = 4;
      cloudCtx.drawImage(img, x, y, size, size);
      cloudCtx.restore();
    }
  }
}

/**
 * Gently parts a high-altitude drifting cloud canvas along the equatorial belt (painting black for Three.js alphaMap)
 * so fast-drifting upper clouds sweep across the mid-latitudes and poles without fogging over the logos.
 */
export function carveEquatorialCloudBand(
  cloudCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const cy = height * 0.5;
  const bandHalfHeight = height * 0.24;

  cloudCtx.save();
  cloudCtx.globalCompositeOperation = 'source-over';
  const bandGrad = cloudCtx.createLinearGradient(0, cy - bandHalfHeight, 0, cy + bandHalfHeight);
  bandGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
  bandGrad.addColorStop(0.24, 'rgba(0, 0, 0, 0.78)');
  bandGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.92)');
  bandGrad.addColorStop(0.76, 'rgba(0, 0, 0, 0.78)');
  bandGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  cloudCtx.fillStyle = bandGrad;
  cloudCtx.fillRect(0, cy - bandHalfHeight, width, bandHalfHeight * 2);
  cloudCtx.restore();
}

