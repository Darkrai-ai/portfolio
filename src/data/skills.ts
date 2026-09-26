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
    groupName: 'Frontend Core',
    techs: ['JavaScript', 'React'],
    blurb: 'The fastest planet for the fastest frameworks — building interactive UIs from the ground up.',
    modelPath: '/models/planets/mercury.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'venus',
    order: 2,
    planetName: 'Venus',
    groupName: 'Styling & Design',
    techs: ['CSS', 'Tailwind'],
    blurb: 'The brightest planet for the most polished surfaces — pixel-perfect design systems and utility-first styling.',
    modelPath: '/models/planets/venus.glb',
    accentColor: '#8B6BF2',
  },
  {
    id: 'earth',
    order: 3,
    planetName: 'Earth',
    groupName: 'Web Experiences',
    techs: ['Next.js', 'Three.js'],
    blurb: 'Home base — immersive web applications and 3D experiences that push the browser to its limits.',
    modelPath: '/models/planets/earth.glb',
    accentColor: '#4FC3F7',
  },
  {
    id: 'mars',
    order: 4,
    planetName: 'Mars',
    groupName: 'IoT & Hardware',
    techs: ['IoT'],
    blurb: 'The frontier planet — connected hardware, embedded sensors, and smart telemetry pushing into new territory.',
    modelPath: '/models/planets/mars.glb',
    accentColor: '#FFC857',
  },
  {
    id: 'jupiter',
    order: 5,
    planetName: 'Jupiter',
    groupName: 'AI & Data Science',
    techs: ['Python', 'PyTorch'],
    blurb: 'The largest planet for the heaviest lifting — machine learning and data-driven systems.',
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
    accentColor: '#8B6BF2',
  },
];
