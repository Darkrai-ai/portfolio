import ClientAppShell from '../components/ClientAppShell';
import { SemanticSEOContent } from '../components/SemanticSEOContent';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 
        Semantic SEO & Accessibility Layer:
        Server-rendered HTML with complete headings, bio, projects, skills, and links.
        Rendered directly into static HTML for search engine crawlers (Googlebot, Bingbot, LLMs)
        and screen readers (WCAG sr-only) while the 3D WebGL scene mounts on the client.
      */}
      <SemanticSEOContent />

      {/* Interactive 3D WebGL Solar System Experience */}
      <ClientAppShell />
    </main>
  );
}
