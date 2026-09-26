export interface Project {
  id: string;
  title: string;
  blurb: string;
  liveUrl: string | null;
  skillIds: string[];
}

export const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Utsaphire Portfolio',
    blurb: 'This cinematic 3D space portfolio — built with Next.js, Three.js, and GSAP to showcase skills through an interactive solar system.',
    liveUrl: null,
    skillIds: ['earth', 'mercury', 'venus'],
  },
  {
    id: 'face-recognition-sorter',
    title: 'Face Recognition Sorter',
    blurb: 'A GPU-accelerated tool for sorting large photo libraries by face, using InsightFace and ArcFace R100 for fast, accurate recognition.',
    liveUrl: null,
    skillIds: ['jupiter'],
  },
  {
    id: 'iot-gate-remote',
    title: 'IoT Gate Remote',
    blurb: 'A smart gate access system on Arduino UNO R4 WiFi, combining Blynk remote control with NFC/RFID tag authentication.',
    liveUrl: null,
    skillIds: ['mars'],
  },
  {
    id: 'perfume-processors-website',
    title: 'Perfume Processors Website',
    blurb: 'A company website and profile for a textile business, built on Next.js.',
    liveUrl: 'https://Perfumeprocessors.com',
    skillIds: ['mercury', 'venus', 'earth'],
  },
  {
    id: 'supermarket-inventory',
    title: 'Supermarket Inventory System',
    blurb: 'A Flutter inventory app for retail, with barcode scanning, cloud sync, and pricing tuned for the Indian SaaS market as well as AI offer suggestions.',
    liveUrl: null,
    skillIds: ['jupiter', 'uranus', 'neptune'],
  },
  {
    id: 'threadflo',
    title: 'ThreadFlo',
    blurb: 'A WPF desktop inventory system for a textile business, backed by EF Core and SQLite, with self-updating releases shipped.',
    liveUrl: null,
    skillIds: ['uranus', 'neptune'], // TODO: tech stack pending
  },
  {
    id: 'sky-surge',
    title: 'Sky Surge',
    blurb: 'A souped-up spin on the tap-to-fly arcade classic, built from scratch with a full power-up system layered in for extra depth and replay value.',
    liveUrl: null,
    skillIds: ['saturn'],
  },
  {
    id: 'dye-formulation-maker',
    title: 'Dye Formulation Maker',
    blurb: 'A formulation aid for textile business, working out pigment ratios and helping find perfect dye recipes.',
    liveUrl: null,
    skillIds: ['jupiter', 'uranus'], // TODO: tech stack pending
  },
];
