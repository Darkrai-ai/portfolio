import React from 'react';
import { aboutMe } from '../data/aboutMe';
import { projects } from '../data/projects';
import { skills } from '../data/skills';

/**
 * Server-rendered semantic HTML accessible layer.
 *
 * Provides complete structured headings, paragraphs, lists, and links
 * that are fully rendered into the initial static HTML response for:
 * 1. Search engine crawlers (Googlebot, Bingbot, Yahoo, DuckDuckGo, Baidu)
 * 2. AI scrapers & LLM agents (ChatGPT, Perplexity, Claude, Gemini)
 * 3. Screen readers & assistive technologies (WCAG 2.1 compliance)
 *
 * Visually positioned with Tailwind's `sr-only` class so it does not interfere
 * with the 3D WebGL solar system experience, but remains 100% crawlable and indexable.
 */
export function SemanticSEOContent() {
  return (
    <>
      {/* Keyboard-accessible skip link */}
      <a
        href="#seo-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#05070D] focus:text-[#4FC3F7] focus:border focus:border-[#4FC3F7] focus:rounded-md focus:shadow-lg font-hud text-xs"
      >
        Skip to main content
      </a>

      {/* Semantic Server-Rendered Content Layer */}
      <div id="seo-main-content" className="sr-only" aria-label="Portfolio Content">
        <header>
          <h1>Utsav Nandaniya (Utsaphire) — Full-Stack Developer &amp; AI Engineer</h1>
          <p>
            Portfolio of Utsav Nandaniya, also known online as Utsaphire and Darkrai-ai.
            Engineering high-performance web systems, deep learning pipelines, and interactive
            3D graphics under the SaphireScape label.
          </p>
        </header>

        <section aria-labelledby="seo-about-heading">
          <h2 id="seo-about-heading">About Utsav Nandaniya</h2>
          <p>{aboutMe.bio}</p>
          <p>
            Primary contact email:{' '}
            <a href={`mailto:${aboutMe.contactEmail}`}>{aboutMe.contactEmail}</a>
          </p>

          <h3>Education</h3>
          <ul>
            {aboutMe.education.map((edu, idx) => (
              <li key={idx}>
                <strong>{edu.title}</strong> ({edu.period}): {edu.description}
              </li>
            ))}
          </ul>

          <h3>Experience</h3>
          <ul>
            {aboutMe.experience.map((exp, idx) => (
              <li key={idx}>
                <strong>{exp.title}</strong> ({exp.period}): {exp.description}
              </li>
            ))}
          </ul>

          <h3>Background &amp; Highlights</h3>
          <ul>
            {aboutMe.funFacts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="seo-skills-heading">
          <h2 id="seo-skills-heading">Technical Skills &amp; Planetary Orbits</h2>
          <p>
            Skills are organized as celestial bodies in the interactive 3D solar system:
          </p>
          <ul>
            {skills.map((skill) => (
              <li key={skill.id}>
                <strong>
                  {skill.planetName} — {skill.groupName}:
                </strong>{' '}
                {skill.blurb}{' '}
                <span>Technologies: {skill.techs.join(', ')}.</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="seo-projects-heading">
          <h2 id="seo-projects-heading">Featured Projects &amp; Software Systems</h2>
          <div>
            {projects.map((proj) => {
              const matchedSkills = skills.filter((s) => proj.skillIds.includes(s.id));
              const techs = matchedSkills.flatMap((s) => s.techs).join(', ');
              return (
                <article key={proj.id}>
                  <h3>{proj.title}</h3>
                  <p>{proj.blurb}</p>
                  {techs && <p>Tech Stack: {techs}</p>}
                  {proj.liveUrl && (
                    <p>
                      Live Deployment:{' '}
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                        {proj.liveUrl}
                      </a>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <nav aria-label="Social and Developer Profiles">
          <h2>Connect &amp; Developer Profiles</h2>
          <ul>
            {aboutMe.socialLinks.map((link) => (
              <li key={link.platform}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.platform}: {link.url}
                </a>
              </li>
            ))}
            {aboutMe.resumePath && (
              <li>
                <a href={aboutMe.resumePath} download="Utsav_Nandaniya_Resume.pdf">
                  Resume (ATS-Optimized PDF): {aboutMe.resumePath}
                </a>
              </li>
            )}
          </ul>
        </nav>

        <noscript>
          <aside aria-label="JavaScript Notice">
            <h2>Interactive 3D Notice</h2>
            <p>
              This portfolio features an interactive 3D solar system built with Next.js, Three.js,
              and WebGL. JavaScript is required to render the 3D space scene. All developer details,
              projects, and contact information are fully readable above.
            </p>
          </aside>
        </noscript>
      </div>
    </>
  );
}
