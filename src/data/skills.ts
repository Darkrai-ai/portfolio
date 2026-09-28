export interface Skill {
  id: string;
  order: number;
  planetName: string;
  groupName: string;
  techs: string[];
  blurb: string;
  modelPath: string;
  accentColor: string;
}

export const skills: Skill[] = [
  {
    id: 'mercury',
    order: 1,
    planetName: 'Mercury',
    groupName: '3D Modeling',
    techs: ['Blender'],
    blurb: 'The innermost world — sculpting 3D assets, hard-surface models, and spatial geometry.',
    modelPath: '/models/planets/mercury.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'venus',
    order: 2,
    planetName: 'Venus',
    groupName: 'DevOps & Infrastructure',
    techs: ['Docker', 'Ubuntu Server', 'Git', 'GitHub'],
    blurb: 'The atmospheric forge — containerized deployments, Linux server administration, and version-controlled pipelines.',
    modelPath: '/models/planets/venus.glb',
    accentColor: '#8B6BF2',
  },
  {
    id: 'earth',
    order: 3,
    planetName: 'Earth',
    groupName: 'AI & Data Science',
    techs: ['Python', 'PyTorch'],
    blurb: 'Home base — deep learning architectures, computer vision, and intelligent data-driven systems.',
    modelPath: '/models/planets/earth.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'mars',
    order: 4,
    planetName: 'Mars',
    groupName: 'IoT & Hardware CAD',
    techs: ['IoT', 'Fusion 360'],
    blurb: 'The frontier planet — connected microcontrollers, embedded telemetry, and parametric 3D-printed hardware.',
    modelPath: '/models/planets/mars.glb',
    accentColor: '#FFC857',
  },
  {
    id: 'jupiter',
    order: 5,
    planetName: 'Jupiter',
    groupName: 'Full-Stack Web & 3D',
    techs: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Three.js', 'Tailwind', 'CSS'],
    blurb: 'The largest planet for the broadest ecosystem — modern full-stack web applications, interactive 3D scenes, and design systems.',
    modelPath: '/models/planets/jupiter.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'saturn',
    order: 6,
    planetName: 'Saturn',
    groupName: 'Game Development',
    techs: ['C#', 'Unity'],
    blurb: 'Ringed with possibilities — real-time game engines and interactive simulations.',
    modelPath: '/models/planets/saturn.glb',
    accentColor: '#8B6BF2',
  },
  {
    id: 'uranus',
    order: 7,
    planetName: 'Uranus',
    groupName: 'Mobile & JVM',
    techs: ['Flutter', 'Kotlin', 'Java'],
    blurb: 'The tilted giant — cross-platform Flutter apps, native Android experiences, and robust JVM backend services.',
    modelPath: '/models/planets/uranus.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'neptune',
    order: 8,
    planetName: 'Neptune',
    groupName: 'Databases',
    techs: ['PostgreSQL', 'SQLite'],
    blurb: 'The deep blue — structured data, relational models, and the persistence layer beneath it all.',
    modelPath: '/models/planets/neptune.glb',
    accentColor: '#8B6EFF',
  },
];
