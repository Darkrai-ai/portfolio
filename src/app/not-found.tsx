import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coordinates Not Found (404)',
  description: 'The requested sector or coordinates could not be located in this orbit.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#05070D] text-[#EDEFF2] px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,195,247,0.08)_0,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="font-hud text-xs tracking-[0.3em] uppercase text-[#4FC3F7]">
          [ERROR 404 // ORBIT ANOMALY]
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-metal-100 tracking-wider">
          Coordinates Lost
        </h1>

        <p className="font-body text-sm text-[#8A93A3] leading-relaxed">
          The orbital trajectory you followed points to deep void space. No planetary bodies or
          signals detected at this address.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-hud text-xs tracking-[0.2em] uppercase px-5 py-2.5 rounded-lg border border-[#4FC3F7]/40 bg-[#4FC3F7]/10 text-[#4FC3F7] hover:bg-[#4FC3F7]/20 hover:border-[#4FC3F7] hover:shadow-[0_0_15px_rgba(79,195,247,0.3)] transition-all duration-300"
          >
            &larr; Return to Orbit
          </Link>
        </div>
      </div>
    </main>
  );
}
