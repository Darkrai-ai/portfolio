import { aboutMe } from '../data/aboutMe';
import { projects } from '../data/projects';
import { skills } from '../data/skills';

/**
 * Generates comprehensive Schema.org JSON-LD structured data graph.
 * Includes Person, WebSite, ProfilePage, and ItemList (CreativeWork/SoftwareApplication).
 * Conforms to Google Search Central and Schema.org rich results guidelines.
 */
export function getStructuredData() {
  const baseUrl = 'https://utsaphire.dev';

  const allTechs = Array.from(new Set(skills.flatMap((s) => s.techs)));

  const personSchema = {
    '@type': 'Person',
    '@id': `${baseUrl}/#person`,
    name: 'Utsav Nandaniya',
    alternateName: ['Utsaphire', 'Darkrai-ai', 'utsavvv_90'],
    givenName: 'Utsav',
    familyName: 'Nandaniya',
    jobTitle: 'Full-Stack Developer & AI Engineer',
    gender: 'https://schema.org/Male',
    url: baseUrl,
    image: `${baseUrl}${aboutMe.headshotPath}`,
    email: `mailto:${aboutMe.contactEmail}`,
    description:
      'Self-taught full-stack developer and AI engineer focused on scalable web applications, deep learning, computer vision, and interactive 3D web experiences.',
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'BITS Pilani',
      url: 'https://www.bits-pilani.ac.in/',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'SaphireScape',
      url: baseUrl,
    },
    sameAs: aboutMe.socialLinks.map((s) => s.url),
    knowsAbout: [
      ...allTechs,
      'Full Stack Web Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Computer Vision',
      '3D Web Development',
      'WebGL',
      'Three.js',
      'Next.js',
      'React',
      'TypeScript',
      'Python',
      'PyTorch',
      'Flutter',
      'Docker',
      'DevOps',
      'Embedded Systems',
      'Distributed Systems',
    ],
    mainEntityOfPage: baseUrl,
  };

  const websiteSchema = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Utsaphire | Utsav Nandaniya Portfolio',
    alternateName: 'SaphireScape',
    description:
      'Interactive 3D space portfolio of Utsav Nandaniya (Utsaphire) — Full-Stack Developer & AI Engineer.',
    inLanguage: 'en-US',
    publisher: { '@id': `${baseUrl}/#person` },
    author: { '@id': `${baseUrl}/#person` },
  };

  const profilePageSchema = {
    '@type': 'ProfilePage',
    '@id': `${baseUrl}/#profile`,
    url: baseUrl,
    name: 'Utsav Nandaniya (Utsaphire) — Professional Portfolio Profile',
    isPartOf: { '@id': `${baseUrl}/#website` },
    mainEntity: { '@id': `${baseUrl}/#person` },
  };

  const projectItemListSchema = {
    '@type': 'ItemList',
    '@id': `${baseUrl}/#projects`,
    name: 'Featured Projects by Utsav Nandaniya',
    description: 'Portfolio of engineering, AI, and software systems built by Utsav Nandaniya.',
    numberOfItems: projects.length,
    itemListElement: projects.map((proj, idx) => {
      const matchedSkills = skills.filter((s) => proj.skillIds.includes(s.id));
      const techs = matchedSkills.flatMap((s) => s.techs);
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: proj.title,
          description: proj.blurb,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Cross-platform',
          author: { '@id': `${baseUrl}/#person` },
          creator: { '@id': `${baseUrl}/#person` },
          keywords: techs.join(', '),
          ...(proj.liveUrl ? { url: proj.liveUrl } : {}),
        },
      };
    }),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema, websiteSchema, profilePageSchema, projectItemListSchema],
  };
}
