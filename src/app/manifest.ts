import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Utsav Nandaniya (Utsaphire) — Portfolio',
    short_name: 'Utsaphire',
    description:
      'Interactive 3D space portfolio of Utsav Nandaniya — Full-Stack Developer & AI Engineer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070D',
    theme_color: '#05070D',
    icons: [
      {
        src: '/icon.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
