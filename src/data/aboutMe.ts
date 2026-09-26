export interface TimelineEntry {
  period: string;
  title: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export const aboutMe = {
  name: 'Utsaphire',
  title: 'Developer & Entrepreneur',
  headshotPath: '/images/headshot.jpg', // placeholder — drop in real image later

  bio: `Self-taught developer — coding since 5th grade, with a game shipped on the Google Play Store at 16 and ERP/inventory systems now running real businesses. Currently studying AI & Business at Scaler School of Technology, while building independently under the SaphireScape label. I like software that disappears into the work it does — less flash, more function.`,

  education: [
    {
      period: '2026 — 2030',
      title: 'B.Sc. Data Science',
      description: 'Focused on AI/ML, computer graphics, and distributed systems.',
    },
  ] as TimelineEntry[],

  experience: [
    {
      period: '2022 — Present',
      title: 'Freelance Developer',
      description: 'Building products, consulting on web experiences, and shipping open-source tools.',
    },
  ] as TimelineEntry[],

  funFacts: [
    'I can hold a conversation in 3 (almost 4) languages.',
    'My first line of code was in Python at age 12.',
    'I\'ve visited 4 countries and counting.',
    'I once built a working robot arm from scrap electronics.',
    'Coffee preference: iced, no milk, no sugar.',
  ],

  contactEmail: 'utsaphire@gmail.com',

  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/Darkrai-ai', icon: '🐙' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/utsav-nandaniya-2090f53445/', icon: '💼' },
    { platform: 'Instagram', url: 'https://www.instagram.com/utsavvv_90/', icon: '📸' },
  ] as SocialLink[],

  resumePath: '/resume.pdf', // placeholder — drop in real PDF later
};
