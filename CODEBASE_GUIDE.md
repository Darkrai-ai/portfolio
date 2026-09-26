# 🪐 Utsaphire Portfolio — Complete Codebase Guide

> A deep-dive teaching document that explains **every file, framework, pattern, and design decision** in this project. Written so that anyone — including future-you — can understand how the whole thing works.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Tech Stack & Why Each Library Was Chosen](#2-tech-stack--why-each-library-was-chosen)
3. [Project Structure](#3-project-structure)
4. [How the App Boots](#4-how-the-app-boots)
5. [State Management (Zustand Store)](#5-state-management-zustand-store)
6. [The Intro Sequence](#6-the-intro-sequence)
7. [The 3D Rendering Pipeline](#7-the-3d-rendering-pipeline)
8. [The Planet System (Planet.tsx)](#8-the-planet-system-planettsx)
9. [Planet Texture Etching (planetEtching.ts)](#9-planet-texture-etching-planetetching-ts)
10. [The Carousel View (CarouselView.tsx)](#10-the-carousel-view-carouselviewtsx)
11. [The Ring / Projects View](#11-the-ring--projects-view)
12. [The About Me View](#12-the-about-me-view)
13. [The Audio System](#13-the-audio-system)
14. [HUD & UI Overlays](#14-hud--ui-overlays)
15. [Animation Systems](#15-animation-systems)
16. [The Scramble Text System](#16-the-scramble-text-system)
17. [Data Architecture](#17-data-architecture)
18. [Styling Approach](#18-styling-approach)
19. [Utility Modules](#19-utility-modules)
20. [Supporting Components](#20-supporting-components)
21. [Performance Techniques](#21-performance-techniques)
22. [Flow Diagram: User Journey](#22-flow-diagram-user-journey)

---

## 1. The Big Picture

This is a **space-themed developer portfolio** where your skills are represented as **planets in a solar system**. Each planet maps to a skill group (Frontend Core, Styling, Web Experiences, IoT, AI, Game Dev, Mobile/JVM, Databases), and clicking a planet reveals the projects associated with those skills.

The entire experience runs as a **client-side Single Page Application** — there is no server rendering, no API calls, no database. Everything is baked into the JavaScript bundle and rendered in the browser using a combination of:

- **2D DOM overlays** (HUD text, navigation rails, project panels) styled with Tailwind CSS
- **3D WebGL scene** (planets, asteroid field, lighting) rendered via Three.js inside a single `<Canvas>`
- **Canvas 2D** effects (shooting star intro, planet texture manipulation)
- **Web Audio API** sound effects and background music

The "views" or "modes" of the app are:

| View | What You See |
|---|---|
| `intro` | Full-screen "Utsaphire." text scramble + shooting star animation |
| `carousel` | Planets arranged in a spiral arc — scroll/click to browse skills |
| `ring` | Top-down ring of all 8 planets with a centered "stage" planet for the selected project |
| `about` | A scrolling dossier overlaid on top of an orbital orrery of all planets |

---

## 2. Tech Stack & Why Each Library Was Chosen

### Core Framework

| Library | Version | Why |
|---|---|---|
| **Next.js** | 15.5 | Gives us file-based routing, optimized builds, and image optimization. Even though the app is fully client-rendered (`ssr: false`), Next.js provides the dev server, bundler (Turbopack), and production build pipeline. |
| **React** | 19.3 | The UI library. Every component is a React component. The `'use client'` directive appears at the top of every file because Next.js 15 defaults to Server Components. |
| **TypeScript** | 5 | Type safety across the entire codebase. All data models, props, and store actions are typed. |

### 3D Rendering

| Library | Why |
|---|---|
| **Three.js** (0.186) | The industry-standard WebGL library. Provides `Mesh`, `Material`, `Geometry`, `Texture`, `Camera`, and all the low-level 3D primitives. |
| **React Three Fiber (R3F)** (9.8) | A React renderer for Three.js. Instead of imperative `scene.add(mesh)` calls, you write declarative JSX: `<mesh><sphereGeometry /><meshStandardMaterial /></mesh>`. R3F also gives you `useFrame()` — a hook that runs every animation frame inside the WebGL render loop. |
| **@react-three/drei** (10.7) | A utility library on top of R3F. This project uses `useTexture()` (loads image files as Three.js textures with caching), `useGLTF()` (loads `.glb` 3D models), and their preloading variants. |
| **@react-three/postprocessing** (3.1) | Listed in dependencies but not currently used in the codebase — available for future bloom/glow effects. |

### Animation

| Library | Why |
|---|---|
| **GSAP** (3.15) | GreenSock Animation Platform. Used for timeline-based animations that need precise sequencing: the intro's dock-to-corner transform, camera transitions between views, and the shooting star's dot reveal. GSAP excels at animating CSS transforms, Three.js camera positions, and arbitrary numeric properties. |
| **Framer Motion** (13.4) | React-native animation library. Used for DOM element enter/exit transitions (`AnimatePresence`), layout animations (`layoutId` for sliding active-tab indicators), and spring physics on UI components. Framer Motion is ideal when you want animations tied to React component lifecycle (mount/unmount). |

### State

| Library | Why |
|---|---|
| **Zustand** (5.0) | A tiny (1KB) state management library. One single store holds the entire app state — current view, focused planet, focused project, muted status, etc. No providers, no context wrappers, no boilerplate. Components subscribe to individual slices via selectors: `useAppStore((s) => s.view)`. |

### Audio

| Library | Why |
|---|---|
| **Howler** (2.2) | Listed as a dependency but the actual implementation uses a **custom `AudioManager` class** built on the raw Web Audio API + HTMLAudioElement. This was done for finer control over crossfading, buffer pooling, and the dual-deck background music loop. |

### Styling

| Library | Why |
|---|---|
| **Tailwind CSS** (3.4) | Utility-first CSS framework. Every element is styled with atomic classes like `text-metal-100`, `bg-void`, `backdrop-blur-[5px]`. The project defines a custom design system in `tailwind.config.ts` with space-themed color tokens. |

---

## 3. Project Structure

```
utsaphire-portfolio/
├── public/
│   ├── audio/              # Background music + SFX (.mp3)
│   ├── backgrounds/        # dark.png & bright.png for flashlight effect
│   ├── logos/              # Tech skill SVG icons (react.svg, typescript.svg, etc.)
│   ├── models/             # 3D .glb files (asteroids.glb)
│   └── textures/planets/   # 2K planet surface textures (.jpg), cloud maps, ring strip
│
├── src/
│   ├── app/
│   │   ├── globals.css     # Tailwind directives + custom glass-panel/glow utilities
│   │   ├── layout.tsx      # Root HTML layout: loads Google Fonts, sets metadata
│   │   └── page.tsx        # Single route — dynamically imports AppShell
│   │
│   ├── audio/
│   │   └── AudioManager.ts # Singleton audio engine (crossfade, SFX, Web Audio)
│   │
│   ├── components/
│   │   ├── AppShell.tsx         # Root orchestrator — assembles all components
│   │   ├── IntroSequence.tsx    # 3-phase intro animation
│   │   ├── SceneManager.tsx     # R3F Canvas + 3D scene composition
│   │   ├── CarouselView.tsx     # Main 3D layout engine (carousel, ring, about)
│   │   ├── Planet.tsx           # Individual planet rendering (textures, clouds, moon, rings)
│   │   ├── AboutMeView.tsx      # Full-screen dossier overlay
│   │   ├── ProjectPanel.tsx     # Project detail HUD (ring view)
│   │   ├── ProjectList.tsx      # Project cards + planet nav rail (carousel view)
│   │   ├── SkillPanel.tsx       # Planet name/skills header (carousel view)
│   │   ├── ScrambleText.tsx     # Reusable scramble-reveal text component
│   │   ├── AsteroidField.tsx    # Instanced asteroid belt (60 rocks)
│   │   ├── BackgroundFlashlight.tsx  # Mouse-following space background reveal
│   │   ├── GlassPanel.tsx       # Reusable frosted-glass container
│   │   ├── HudReadout.tsx       # Bottom-right location/coordinate readout
│   │   ├── LightingRig.tsx      # Scene lights + fog
│   │   ├── MobileInterstitial.tsx   # "Bigger screen recommended" modal
│   │   ├── MuteControl.tsx      # Audio mute toggle (top-right)
│   │   ├── PlanetPreloader.tsx  # Eagerly preloads all planet textures
│   │   ├── RingView.tsx         # Top-down ring layout for projects mode
│   │   └── Wordmark.tsx         # "Utsaphire." logo button (top-left)
│   │
│   ├── data/
│   │   ├── aboutMe.ts      # Bio, education, experience, social links
│   │   ├── places.ts       # Fictional coordinates for HUD readout
│   │   ├── projects.ts     # Portfolio projects with skill linkage
│   │   └── skills.ts       # 8 skill groups = 8 planets
│   │
│   ├── store/
│   │   └── useAppStore.ts  # Zustand global state store
│   │
│   └── utils/
│       ├── detectMobile.ts     # Mobile + reduced-motion detection
│       ├── planetEtching.ts    # Canvas 2D logo engraving into planet textures
│       ├── scramble.ts         # Core scramble algorithm (used by ScrambleText)
│       └── spring.ts           # Math utilities (lerp, clamp, dampedSpring)
│
├── next.config.mjs         # Webpack .glb loader, transpile three
├── tailwind.config.ts      # Custom space theme (void, metal, accent colors)
├── tsconfig.json           # TypeScript config with @/* path alias
└── package.json            # All dependencies and scripts
```

---

## 4. How the App Boots

The boot sequence is a chain of three files:

### Step 1: `layout.tsx` — The HTML Shell

```
layout.tsx
  └─ Loads 3 Google Fonts via next/font/google:
     • Audiowide → --font-display (planet titles, headings)
     • Space Grotesk → --font-body (paragraph text)
     • Space Mono → --font-hud (HUD readouts, telemetry labels)
  └─ Sets CSS variables on <body> so Tailwind's fontFamily tokens reference them
  └─ Sets page metadata (title, description)
```

### Step 2: `page.tsx` — The Only Route

```tsx
const AppShell = dynamic(() => import('../components/AppShell'), { ssr: false });

export default function Home() {
  return <AppShell />;
}
```

**Key insight:** `dynamic()` with `{ ssr: false }` means the entire `AppShell` component tree is **never rendered on the server**. The server sends a minimal HTML shell, and React hydrates everything client-side. This is necessary because the app uses browser-only APIs (Canvas, WebGL, Web Audio, `window`).

### Step 3: `AppShell.tsx` — The Root Orchestrator

AppShell is the central hub. It:

1. **Dynamically imports** every component with `{ ssr: false }` — each import is code-split into its own chunk
2. **Detects mobile** (viewport width < 768px OR `pointer: coarse` media query)
3. **Detects reduced motion** preference and listens for changes
4. **Renders all layers** in a specific z-order:

```
z=0   BackgroundFlashlight (dark/bright space background)
z=10  SceneManager (3D Canvas with all planets)
z=30  SkillPanel + ProjectList (carousel view overlays)
z=40  ProjectPanel (ring view overlay)
z=60  AboutMeView (full-screen dossier)
z=70  Wordmark + HudReadout + MuteControl (always-on-top)
z=90  MobileInterstitial (dismissible warning)
z=100 IntroSequence (full-screen intro animation)
```

---

## 5. State Management (Zustand Store)

The entire app state lives in a single Zustand store at `src/store/useAppStore.ts`.

### State Shape

```typescript
{
  // Navigation
  view: 'intro' | 'carousel' | 'ring' | 'about',
  focusedPlanetId: string,     // e.g. 'earth', 'jupiter'
  focusedProjectId: string | null,
  previousView: 'carousel' | 'ring' | null,  // for About Me back-navigation

  // Intro
  introCompleted: boolean,

  // UI preferences
  muted: boolean,
  volume: number,
  reducedMotion: boolean,
  isMobile: boolean,
  isSpinning: boolean,  // true while carousel is animating between planets
}
```

### Key Actions & Their Transitions

| Action | What Happens |
|---|---|
| `completeIntro()` | `intro` → `carousel`, sets `introCompleted = true` |
| `focusPlanet(id)` | Updates `focusedPlanetId`, sets `isSpinning = true` (briefly) |
| `openProject(id)` | `carousel` → `ring`, sets `focusedProjectId` |
| `closeProject()` | `ring` → `carousel`, clears `focusedProjectId` |
| `openAboutMe()` | Saves current view to `previousView`, switches to `about` |
| `exitAboutMe()` | Restores `previousView` (defaults to `carousel`) |
| `toggleMute()` | Toggles `muted` |

### How Components Use It

```tsx
// Subscribe to a single slice (only re-renders when THIS value changes)
const view = useAppStore((s) => s.view);

// Subscribe to an action (stable reference, never causes re-render)
const focusPlanet = useAppStore((s) => s.focusPlanet);
```

Zustand's selector pattern means a component like `SkillPanel` (which only reads `view`, `focusedPlanetId`, and `isSpinning`) won't re-render when unrelated state like `muted` or `volume` changes.

---

## 6. The Intro Sequence

**File:** `IntroSequence.tsx` (421 lines)

This is the full-screen animation that plays when you first load the site. It runs as a **single `requestAnimationFrame` loop** with zero React state re-renders during animation — all DOM mutations happen via direct ref manipulation.

### Three Phases

#### Phase 1: Text Scramble (0–1650ms)

The word "Utsaphire" appears character by character, with random glyphs flickering before each character "locks in" to its final value.

- Uses `createScrambleState('Utsaphire')` to generate an array of character positions with random lock-order
- On each frame, calls `updateScramble(state, progress)` where `progress` goes from 0→1
- Updates `wordSpanRef.current.textContent` directly (no `setState`, no re-render)

#### Phase 2: Shooting Star (1650–2230ms)

A meteor streaks in from the upper-left and crashes into the exact pixel position of the "." character, **becoming** the dot itself.

- A `<canvas>` overlays the screen at `z=102`
- The star follows a **quadratic Bézier curve** from the upper-left sky to the dot's position
- Two layered strokes simulate the meteor trail: an outer cyan-violet aura + an inner white-cyan core
- On arrival, the shooting star spawns **16 impact sparks** (tiny particles with gravity + decay) and a shockwave ring
- The "." `<span>` receives a GSAP flash animation (`scale: 1.55 → 1`, `color: white → metal`)

```
Star geometry:
  startX = targetX - max(width * 0.54, 560)    ← far upper-left
  startY = targetY - max(height * 0.38, 270)
  ctrlX  = targetX - spanX * 0.28              ← smooth arc control point
  ctrlY  = targetY - spanY * 0.64
  targetX, targetY = exact center of the "." glyph's bounding box
```

#### Phase 3: Dock to Corner (2650ms+)

The entire "Utsaphire." text GPU-transforms from center-screen to the top-left corner, shrinking from ~80px to 20px font size.

- Computes exact `dx`, `dy`, and `scale` values using `getBoundingClientRect()` and computed font size
- Uses GSAP `force3D: true` for hardware-accelerated CSS transforms (no layout reflow!)
- Simultaneously fades the intro container's background from opaque to transparent
- On completion, calls `completeIntro()` which transitions the store to `carousel` view
- A "SKIP" button appears after 550ms for impatient users

---

## 7. The 3D Rendering Pipeline

### SceneManager.tsx — The Canvas

```tsx
<Canvas
  camera={{ position: [0, 0.25, 7.2], fov: 50, near: 0.01, far: 1000 }}
  dpr={[1, 2]}           // Responsive pixel ratio
  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  style={{ background: 'transparent' }}
>
  <LightingRig />          // Lights + fog
  <PlanetPreloader />      // Preloads all textures at module level
  <Suspense><AsteroidField /></Suspense>
  <CarouselView />         // The main planetary system
</Canvas>
```

The `<Canvas>` is a `div.fixed.inset-0.z-10` — it fills the entire viewport and sits above the background but below all DOM overlays.

### LightingRig.tsx — Scene Illumination

Four lights create the space atmosphere:

| Light | Purpose |
|---|---|
| `ambientLight` (intensity 0.32, cool blue-grey) | Fills dark sides so planets are visible |
| `directionalLight` from `[-7, 4.5, 6]` (intensity 1.65) | Main key light — highlights 3D bump relief |
| `directionalLight` from `[-5, 14, -4]` (intensity 1.15) | Top-down fill for the ring view |
| `directionalLight` from `[6, -2, -5]` (intensity 0.45, cyan) | Cool rim light from back-right |

Plus `<fog args={['#05070D', 35, 100]} />` — deep-space fog that fades distant asteroids into darkness.

### AsteroidField.tsx — Background Rocks

60 instanced copies of a single `.glb` asteroid model scattered in a toroidal band (radius 15–30, y ±5). Uses `InstancedMesh` for performance — one draw call renders all 60 asteroids. Each asteroid slowly rotates and oscillates on `useFrame`.

### PlanetPreloader.tsx — Eager Texture Loading

At **module load time** (before any component renders), this file calls `useTexture.preload()` for:
- All 8 planet surface textures (`/textures/planets/{id}.jpg`)
- All tech logo SVGs (`/logos/react.svg`, etc.)
- Special textures: Earth clouds, Venus atmosphere, Saturn ring, Moon

This ensures textures are cached by the time planets appear.

---

## 8. The Planet System (Planet.tsx)

**File:** `Planet.tsx` (~986 lines) — The most complex component in the project.

### Architecture

The `Planet` component takes a `Skill` object and renders a complete planet with:

1. **Surface sphere** — 2K texture with bump mapping
2. **Cloud layers** — planet-specific atmospheric effects
3. **Saturn rings** — custom radial-UV ring geometry
4. **Earth's Moon** — orbiting clickable sub-object
5. **Hover/focus effects** — scale boost, emissive glow, spin burst

### Per-Planet Configuration (`PLANET_CONFIG`)

Each planet has a tuning object:

```typescript
{
  sizeMultiplier: 0.78,   // Relative size (Mercury is small, Jupiter is big)
  bumpScale: 0.22,        // Height of 3D surface relief
  roughness: 0.96,        // High = matte surface (no specular glare)
  metalness: 0.0,         // Zero = no metallic reflection
  tilt: 0.03,             // Axial tilt in radians
  filter: 'contrast(135%) brightness(0.95)',  // CSS filter for texture enhancement
  haloColor: '#C8D0DC',   // Emissive glow color
  isGasGiant: false,      // Gas giants get extra cloud layers
}
```

### Texture Enhancement Pipeline

When a planet loads, its raw 2K JPEG texture goes through a multi-step enhancement:

```
Raw .jpg → Canvas 2D
  └─ Apply CSS filter (contrast, saturation, brightness)
  └─ For gas giants: add polar hood darkening via gradient multiply
  └─ Create bump map: grayscale + 220% contrast
  └─ For gas giants: add horizontal atmospheric band relief
  └─ Etch skill logos into BOTH color and bump canvases
  └─ Return as THREE.CanvasTexture
```

All results are **cached** in `enhancedMapCache` keyed by skill ID — so each planet's texture pipeline runs exactly once.

### Cloud Systems

#### Earth (3 layers)
1. **Drop shadows** (1.003x scale) — dark `meshBasicMaterial` using cloud alpha map
2. **Main cumulus clouds** (1.032x scale) — white with bump mapping, storm-eye clearings carved around each logo
3. **High-altitude cirrus** (1.058x scale) — cleared equatorial band so logos peek through

Each layer has a subtle `useFrame` breathing oscillation to keep clouds alive while staying aligned over logos.

#### Venus (1 layer)
- Semi-transparent atmosphere layer at 1.015x scale, slowly counter-rotating

#### Gas Giants: Saturn, Uranus, Neptune (4 layers)
1. Deep dark cloud drop-shadows
2. Dense lower cloud deck with storm-eye clearings
3. Mid-troposphere storm clouds, terraced around logos
4. High-altitude canopy clouds with cleared equatorial band

Each gas giant uses planet-specific cloud tints (Saturn: warm cream, Uranus: icy blue, Neptune: deep blue).

### Saturn's Rings

Custom `RingGeometry` with radial UV mapping:

```typescript
function createSaturnRingGeometry(inner = 0.62, outer = 1.15, segments = 128) {
  // Creates a ring, then remaps UVs so texture U = (distance - inner) / (outer - inner)
  // This makes the 2K ring strip stretch radially from inner to outer edge
}
```

The ring texture gets pixel-level color correction: neutral greys are shifted to warm golden-champagne tones.

### Earth's Moon

A 3D textured sphere orbiting Earth at radius 0.88, with:
- Visible orbital path (thin line ring)
- Hover scale boost (1.0 → 1.28)
- **Clickable** — opens/exits About Me view
- Audio feedback on hover and click

### Per-Frame Animation (`useFrame`)

Every frame, each planet:
1. Rotates on its axis (base spin speed depends on `focused`/`highlighted` state)
2. Applies **spin burst** — a fast decaying rotation when entering project mode (exponential decay: `*= 0.91^(delta*60)`)
3. Lerps scale toward hover-boosted target
4. Lerps emissive intensity and opacity for smooth dimming transitions

---

## 9. Planet Texture Etching (planetEtching.ts)

This utility file contains the logic for **engraving tech logos into planet surfaces** using Canvas 2D compositing.

### `TECH_LOGO_PATHS`

A lookup table mapping tech names to SVG file paths:

```typescript
'React': '/logos/react.svg',
'TypeScript': '/logos/typescript.svg',
// ... 16+ entries
```

### `etchSkillsIntoPlanetCanvases(colorCtx, bumpCtx, logoImages, haloColor, w, h, planetId)`

For each logo image:

1. **Calculates position** — logos are evenly distributed along the equator (y = h/2 ± small offset)
2. **Color map engraving:**
   - `globalCompositeOperation = 'overlay'` → blends logo with surface color
   - Applies halo glow behind each logo using `screen` blending
   - Creates a chiseled bevel effect with a multiply shadow
3. **Bump map engraving:**
   - Draws logo into the grayscale bump map so it creates a **recessed** appearance in 3D
   - The logo appears as if physically carved into the planet's surface

### `carveCloudStormEyes(ctx, logoImages, w, h, sizeMultiplier, feather)`

Cuts transparent clearings in cloud alpha maps centered on each logo position. Uses radial gradients with feathered edges to create natural "eye of the storm" effects, so logos remain visible through multiple cloud layers.

### `carveEquatorialCloudBand(ctx, w, h)`

Clears a horizontal band across the equator on high-altitude cloud layers. This ensures the equatorial region (where logos sit) isn't completely obscured by upper clouds.

---

## 10. The Carousel View (CarouselView.tsx)

**File:** `CarouselView.tsx` (622 lines) — The main 3D scene orchestrator.

### Three Layout Modes

This single component manages how all 8 planets are positioned and animated across all three non-intro views:

#### 1. Carousel Mode (`view === 'carousel'`)

Planets are arranged on a **spiral arc** — a curved path where the focused planet sits at center-screen and adjacent planets trail off to the sides.

```
Position calculation:
  angle = (index - focusedIndex) * arcStep     // angular offset
  x = sin(angle) * arcRadius
  z = cos(angle) * arcRadius - arcRadius       // push forward from camera
  y = (index - focusedIndex) * yStep           // subtle vertical stagger
  scale = 1.0 at center, dims toward edges
```

**Scroll physics:** Mouse wheel events feed into a velocity-based inertia system. `useFrame` applies friction (`velocity *= 0.92`) and snaps to the nearest planet when velocity drops below threshold.

**Keyboard:** Left/Right arrows navigate between planets.

#### 2. Ring Mode (`view === 'ring'`)

The focused project's associated planets fly to the **center stage**, while other planets exit to deep-space positions far from camera. The camera GSAP-animates from the carousel angle to a top-down view `[0, 8, 6]`.

```
If planet is associated with project → position at center with scaling boost
If not → exit to deep-space position far away
```

#### 3. About Mode (`view === 'about'`)

All 8 planets arrange into a **celestial orrery** — concentric orbits slowly rotating. This is visible behind the semi-transparent About Me dossier.

```
Each planet gets:
  orbit radius = based on order (inner to outer)
  orbital speed = varies per planet
  position updates every frame via useFrame
```

### Sub-Components

- **`CarouselOrbitTrack`** — Renders a thin line-circle showing the active planet's carousel arc position
- **`AboutOrbitRings`** — Renders 8 concentric orbit rings visible during the About Me view

### Camera Transitions

All camera movements use GSAP:

```tsx
gsap.to(camera.position, {
  x: 0, y: 8, z: 6,
  duration: 1.5,
  ease: 'power2.inOut',
  onUpdate: () => camera.lookAt(0, 0, 0),
});
```

---

## 11. The Ring / Projects View

When a user clicks a project in the carousel view, the app transitions to the **ring view** using two components:

### RingView.tsx (3D)

Arranges all 8 planets in a circle (radius 5). Planets associated with the active project are `highlighted` and scaled up (1.4x), others are `dimmed`. Camera moves to a top-down position.

```typescript
function getRingPosition(order: number): [number, number, number] {
  const angle = ((order - 1) / 8) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * 5, 0, Math.sin(angle) * 5];
}
```

### ProjectPanel.tsx (DOM Overlay)

Displays the focused project's details:

- **Top header:** Scrambled project title + tech stack tags
- **Bottom panel:** Project blurb, associated planet buttons, live URL link, ESC close
- **Navigation rail:** Numbered step buttons (01–10) for all projects + prev/next arrows

Navigation supports:
- Arrow keys (left/right)
- Mouse wheel (with 480ms debounce)
- Click on step rail buttons

All transitions use Framer Motion's `AnimatePresence` with slide-up/slide-down animations.

---

## 12. The About Me View

**File:** `AboutMeView.tsx` (504 lines)

A full-screen **auto-scrolling dossier** that overlays the 3D orrery. Styled like a military/space command dossier with section codes and architectural corner ticks.

### Five Sections

| Code | Section | Content |
|---|---|---|
| 01 | OVERVIEW | Bio, monogram emblem, role/track/origin metadata |
| 02 | EXPERIENCE | Work history in a ledger format |
| 03 | EDUCATION | Academic records |
| 04 | BEYOND | Fun facts in a 2-column grid |
| 05 | TRANSMISSION | Email link, social media plates, resume download |

### Auto-Scroll Behavior

A `requestAnimationFrame` loop continuously scrolls the content at ~0.75px per frame (~45px/sec). When the user interacts (wheel, touch, arrow keys), scrolling pauses for 3.2 seconds then resumes. When the scroll reaches the bottom, it automatically calls `exitAboutMe()`.

### Active Section Tracking

Each frame, the loop checks which section's `offsetTop` is nearest the viewport center (42% from top) and updates `activeSection`. This drives the bottom navigation rail's active indicator — a Framer Motion `layoutId` spring-animated underline.

### Design System

The social links and resume button use a **flat perspective** design — CSS `transform: rotateX(22deg)` that flattens on hover (`rotateX(0deg)`), creating a 3D "plate lying on a surface" effect consistent with the ProjectList design.

---

## 13. The Audio System

**File:** `AudioManager.ts` — A singleton class with three subsystems:

### 1. Background Music — Dual-Deck Crossfade Loop

Two `HTMLAudioElement` instances ("Deck A" and "Deck B") take turns playing the same background track. When one deck approaches the end, the other starts playing with a crossfade overlap:

```
Time: ─────────────────────────────────────────────────────
Deck A: ████████████████████▓▓▓░░░░░░░░░░░░░░░░████████████
Deck B: ░░░░░░░░░░░░░░░░░░░▓▓▓████████████████▓▓▓░░░░░░░░
                            ↑ crossfade zone ↑
```

The crossfade uses an **equal-power cosine curve** so total loudness stays constant:

```typescript
deckA.volume = Math.cos(crossfadeT * Math.PI / 2) * masterVolume;
deckB.volume = Math.sin(crossfadeT * Math.PI / 2) * masterVolume;
```

### 2. Sound Effects — Web Audio API Buffer Pool

SFX (`hover`, `click`, `scroll`, `tab`, `energy`, `whoosh`) use the Web Audio API for **zero-latency playback**:

```
User action → audioManager.play('click')
  └─ Creates AudioBufferSourceNode from pre-decoded buffer
  └─ Connects to GainNode → AudioContext.destination
  └─ Starts immediately (no network delay, no HTMLAudioElement startup lag)
```

If Web Audio isn't available, falls back to `HTMLAudioElement` pool (3 elements per SFX type, round-robin).

### 3. Auto-Unlock

Mobile browsers block audio until user interaction. The AudioManager listens for `pointerdown`, `pointermove`, `wheel`, `keydown`, and `touchstart` events and calls `audioContext.resume()` + starts background music on the first interaction.

---

## 14. HUD & UI Overlays

### Wordmark.tsx (Top-Left)

The "Utsaphire." logo button. Hidden during intro. Clicking it toggles between About Me and the current view. Shows contextual label: "DOSSIER // ABOUT" or "RETURN // ORBIT".

### HudReadout.tsx (Bottom-Right)

Displays a rotating set of fictional place names and coordinates using ScrambleText with `perpetual={true}`. Switches between `corePlaces` (carousel/ring views) and `aboutPlaces` (about view). Changes every 3.4 seconds with a random non-repeat selection.

### MuteControl.tsx (Top-Right)

Audio toggle with animated equalizer bars. Hidden during intro. Shows "AUDIO // LIVE" or "AUDIO // OFF" label. The three bars animate with `animate-pulse` when audio is active.

### SkillPanel.tsx (Top-Center, Carousel Only)

Displays the current planet's name, skill group, and tech list. All text uses ScrambleText that scrambles during carousel spin animation (`scrambling={isSpinning}`).

### ProjectList.tsx (Bottom-Center, Carousel Only)

Shows projects associated with the focused planet as **flat perspective plates** (CSS `rotateX(24deg)` that flatten on hover). Below is an 8-planet navigation rail with 3-letter abbreviations (MER, VEN, EAR...) and a Framer Motion `layoutId` active indicator.

### GlassPanel.tsx

A reusable wrapper that applies the `.glass-panel` CSS class (backdrop blur + semi-transparent background + border) with optional Framer Motion enter/exit animations.

### MobileInterstitial.tsx

A dismissible modal shown on mobile viewports suggesting a bigger screen. Uses `isMobile` from the store.

---

## 15. Animation Systems

The project uses **four different animation approaches**, each chosen for its strengths:

### 1. `requestAnimationFrame` Loops (Custom)

Used when you need frame-by-frame control with zero React overhead:

| Where | What |
|---|---|
| `IntroSequence` | Shooting star trail, sparks, text scramble |
| `AboutMeView` | Auto-scroll + section tracking |
| `BackgroundFlashlight` | Mouse position lerp for flashlight mask |
| `ScrambleText` | Character-by-character text updates |

### 2. GSAP (Timeline Animations)

Used for precise, sequenced property animations:

| Where | What |
|---|---|
| `IntroSequence` | Dot flash reveal, dock-to-corner transform |
| `CarouselView` | Camera position transitions between views |
| `RingView` | Camera move to top-down position |

### 3. Framer Motion (React Lifecycle Animations)

Used for mount/unmount transitions and layout animations:

| Where | What |
|---|---|
| `AboutMeView` | Fade in/out container |
| `ProjectPanel` | Slide-up/slide-down project blurb |
| `ProjectList` | Staggered spring entrance of project plates |
| All navigation rails | `layoutId` active indicator sliding |

### 4. R3F `useFrame` (Per-Frame 3D Updates)

Used inside the WebGL render loop:

| Where | What |
|---|---|
| `Planet` | Axial rotation, hover scale lerp, emissive lerp |
| Cloud layers | Breathing oscillation, high-cloud drift |
| `EarthMoon` | Orbital motion, hover scale |
| `AsteroidField` | Per-instance rotation + oscillation |
| `CarouselView` | Scroll inertia physics, planet position lerp |

---

## 16. The Scramble Text System

### Core Algorithm: `scramble.ts`

```typescript
createScrambleState(text: string) → ScrambleState
```

Creates an object with:
- `chars[]` — the target characters
- `locked[]` — boolean array (which characters have been "decoded")
- `order[]` — random permutation of indices (determines reveal order)

```typescript
updateScramble(state: ScrambleState, progress: number, charSet?) → string
```

Given progress (0→1):
1. Calculate how many characters should be locked: `count = floor(progress * length)`
2. Lock the first `count` characters in the random `order`
3. Locked characters show their real value; unlocked show a random glyph from `charSet`

### React Component: `ScrambleText.tsx`

Wraps the algorithm in a React component with multiple modes:

| Mode | Trigger | Behavior |
|---|---|---|
| **One-shot** | Text changes | Scrambles from random glyphs to final text over `duration` ms |
| **Perpetual** | `perpetual={true}` | After resolving, keeps a subtle single-char flicker (28% chance every 140ms) |
| **Scrambling** | `scrambling={true}` | Continuously shows random glyphs (used during carousel spin) |
| **Cycle** | `cycleTexts={[...]}` | Cycles through multiple texts, scramble-transitioning between them |
| **External** | `progress={0.0-1.0}` | Caller controls progress directly (used by IntroSequence) |

All updates happen via `ref.current.textContent = ...` — no React re-renders.

---

## 17. Data Architecture

### The Planet–Skill–Project Triangle

```
skills.ts (8 entries)
  ├─ id: 'mercury' | 'venus' | 'earth' | ... | 'neptune'
  ├─ planetName: 'Mercury', 'Venus', ...
  ├─ groupName: 'Frontend Core', 'Styling & Design', ...
  ├─ order: 1-8
  ├─ techs: ['React', 'TypeScript', ...]
  ├─ accentColor: '#4FC3F7'
  └─ modelPath: '/models/mercury.glb'  (not currently used — planets use sphere + texture)

projects.ts (8 entries)
  ├─ id: 'project-1'
  ├─ title: 'Portfolio Website'
  ├─ blurb: 'Description...'
  ├─ skillIds: ['earth', 'mercury']  ← links to skills/planets
  └─ liveUrl: 'https://...'

aboutMe.ts
  ├─ name, title, bio
  ├─ education: [{ title, period, description }]
  ├─ experience: [{ title, period, description }]
  ├─ funFacts: string[]
  ├─ contactEmail, resumePath
  └─ socialLinks: [{ platform, url }]

places.ts
  ├─ corePlaces: [{ place, coordinates }]  ← HUD readout for carousel/ring
  └─ aboutPlaces: [{ place, coordinates }] ← HUD readout for about view
```

### How They Connect

1. In **carousel view**, scrolling between planets shows that planet's skill group + associated projects (filtered by `project.skillIds.includes(focusedPlanetId)`)
2. Clicking a project transitions to **ring view**, where planets matching `project.skillIds` are highlighted
3. Clicking Earth's Moon or the Wordmark opens **about view**, which reads everything from `aboutMe.ts`

---

## 18. Styling Approach

### Tailwind CSS Custom Theme

Defined in `tailwind.config.ts`:

```typescript
colors: {
  void: { DEFAULT: '#05070D', dark: '#05070D', mid: '#0B0F1A' },
  metal: { 100: '#E8ECF4', 400: '#8B96A9', 800: '#2C3547' },
  accent: {
    blue: '#4FC3F7',    // Primary interactive color
    violet: '#8B6BF2',  // Secondary accent
    gold: '#FFC857',    // Project/experience highlights
  },
  'text-dim': '#5A657A',
},
fontFamily: {
  display: ['var(--font-display)'],  // Audiowide
  body: ['var(--font-body)'],        // Space Grotesk
  hud: ['var(--font-hud)'],          // Space Mono
}
```

### Glass Panel Effect

Defined in `globals.css`:

```css
.glass-panel {
  background: linear-gradient(135deg, rgba(11,15,26,0.7), rgba(11,15,26,0.5));
  border: 1px solid rgba(232,236,244,0.1);
  backdrop-filter: blur(12px);
  border-radius: 16px;
}
```

### Design Patterns Used Throughout

| Pattern | How It's Applied |
|---|---|
| **Architectural corner ticks** | Small L-shaped borders at panel corners (accent-blue or accent-gold) |
| **Gradient hairline dividers** | `bg-gradient-to-r from-transparent via-accent-blue/45 to-transparent` |
| **Flat perspective plates** | `[transform:rotateX(22deg)]` on hover changes to `rotateX(0deg)` |
| **HUD telemetry labels** | `font-hud text-[10px] tracking-[0.34em] uppercase` |
| **Drop shadows for depth** | `drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]` on floating text |
| **Glow effects** | `shadow-[0_0_10px_#4FC3F7]` for active indicators |

---

## 19. Utility Modules

### `spring.ts` — Math Utilities

```typescript
lerp(a, b, t)           // Linear interpolation
clamp(value, min, max)   // Constrain to range
dampedSpring(current, target, velocity, stiffness, damping, dt)
                         // Returns { value, velocity } — used for smooth following
dampedSpring2D(...)      // 2D variant
mapRange(value, inMin, inMax, outMin, outMax)
                         // Remap from one range to another
```

### `detectMobile.ts`

```typescript
detectIsMobile()       // window.innerWidth < 768 OR pointer:coarse
detectReducedMotion()  // prefers-reduced-motion: reduce
```

---

## 20. Supporting Components

### BackgroundFlashlight.tsx

Two stacked full-screen images (`dark.png` and `bright.png`). The bright layer has a CSS `mask-image: radial-gradient(circle 300px at X Y, ...)` that follows the mouse cursor, creating a "flashlight revealing stars" effect.

- Mouse position is **lerped** toward the cursor (`factor = 0.08`) for smooth following
- On touch devices, a brief flash appears at the touch point then fades
- Respects `reducedMotion` (snaps directly to cursor instead of lerping)

---

## 21. Performance Techniques

| Technique | Where |
|---|---|
| **Zero-rerender animations** | IntroSequence, ScrambleText, BackgroundFlashlight — all use refs + rAF |
| **Texture caching** | Planet textures, cloud textures, ring texture, glow texture — all cached in module-level variables |
| **Instanced rendering** | AsteroidField uses `InstancedMesh` — 1 draw call for 60 asteroids |
| **Code splitting** | Every component in AppShell uses `dynamic(() => import(...), { ssr: false })` |
| **Eager texture preloading** | PlanetPreloader triggers `useTexture.preload()` at module load time |
| **Zustand selectors** | Components subscribe to minimal state slices, avoiding unnecessary re-renders |
| **GSAP force3D** | Intro dock animation uses GPU-composited transforms instead of layout-triggering properties |
| **Canvas 2D over Canvas shadows** | Planet etching uses compositing modes (overlay, screen, multiply) instead of expensive `shadowBlur` |
| **DPR capping** | Canvas `dpr={[1, 2]}` prevents excessive resolution on high-DPI displays |
| **Anisotropic filtering** | Planet textures use max anisotropy for crisp viewing at oblique angles |

---

## 22. Flow Diagram: User Journey

```
┌──────────────────────────────────────────────────────────────────┐
│                          PAGE LOAD                               │
│  layout.tsx → page.tsx → AppShell.tsx                            │
│  • Fonts load (Audiowide, Space Grotesk, Space Mono)            │
│  • All components code-split and lazy-loaded                     │
│  • PlanetPreloader eagerly fetches all textures                  │
│  • AudioManager singleton initializes (waiting for interaction)  │
└─────────────────────────┬────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     INTRO SEQUENCE                               │
│  Phase 1: "Utsaphire" text scramble (1.65s)                     │
│  Phase 2: Shooting star → becomes "." (0.58s + 0.42s sparks)    │
│  Phase 3: Dock to top-left corner (1.05s)                       │
│  → completeIntro() → view = 'carousel'                          │
└─────────────────────────┬────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CAROUSEL VIEW                                 │
│  • 8 planets on spiral arc, scroll to navigate                  │
│  • SkillPanel: planet name + techs (top-center)                 │
│  • ProjectList: associated projects (bottom-center)             │
│  • Wordmark (top-left), HudReadout (bottom-right)               │
│  • MuteControl (top-right)                                      │
│                                                                  │
│  User actions:                                                   │
│  ├─ Scroll / Arrow keys → navigate planets                      │
│  ├─ Click project plate → openProject() ──────────────┐         │
│  ├─ Click Earth's Moon → openAboutMe() ───────────┐   │         │
│  └─ Click Wordmark → openAboutMe() ──────────────┤   │         │
└──────────────────────────────────────────────────┤───┤──────────┘
                                                   │   │
                          ┌────────────────────────┘   │
                          ▼                            ▼
┌─────────────────────────────────┐  ┌────────────────────────────┐
│         ABOUT ME VIEW           │  │       RING / PROJECTS VIEW  │
│  • Semi-transparent dossier     │  │  • Top-down ring of planets │
│  • Auto-scrolling sections      │  │  • Highlighted project      │
│  • Orrery behind (all planets   │  │    planets at center        │
│    in concentric orbits)        │  │  • ProjectPanel: title,     │
│  • Bottom nav rail              │  │    blurb, nav rail          │
│                                 │  │  • Arrow/scroll/click nav   │
│  ESC / Wordmark → exitAboutMe() │  │                             │
│  → returns to previousView     │  │  ESC → closeProject()       │
└─────────────────────────────────┘  │  → returns to carousel      │
                                     └────────────────────────────┘
```

---

## Summary

This portfolio is essentially a **mini game engine** running in the browser:

- **Three.js** handles the 3D solar system with 8 procedurally-enhanced planets
- **React** manages the component tree and UI state
- **Zustand** acts as the game state machine with clean view transitions
- **GSAP** powers cinematic camera moves and the intro sequence
- **Framer Motion** handles DOM transitions and layout animations
- **Canvas 2D** creates custom planet textures with engraved logos
- **Web Audio API** provides responsive sound design
- **Tailwind CSS** delivers a cohesive dark-space design system

Every major decision optimizes for either **visual polish** (multi-layer clouds, shooting star particles, scramble text) or **performance** (zero-rerender animations, texture caching, instanced rendering, code splitting).
