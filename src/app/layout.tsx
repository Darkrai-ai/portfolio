import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Audiowide, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { getStructuredData } from "../utils/seoData";

const audiowide = Audiowide({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-hud",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#05070D",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://utsaphire.dev"),
  title: {
    default: "Utsav Nandaniya (Utsaphire) | Full-Stack Developer & AI Engineer",
    template: "%s | Utsav Nandaniya (Utsaphire)",
  },
  description:
    "Explore the interactive 3D solar system portfolio of Utsav Nandaniya (Utsaphire) — Full-Stack Developer & AI Engineer specializing in Next.js, Three.js, Python, PyTorch, Flutter, and IoT solutions under the SaphireScape label.",
  applicationName: "Utsaphire Portfolio",
  authors: [
    { name: "Utsav Nandaniya", url: "https://utsaphire.dev" },
    { name: "Utsaphire", url: "https://github.com/Darkrai-ai" },
  ],
  generator: "Next.js",
  keywords: [
    "Utsav Nandaniya",
    "Utsaphire",
    "SaphireScape",
    "Darkrai-ai",
    "Full Stack Developer",
    "AI Engineer",
    "AI & Data Science",
    "3D Web Developer",
    "Creative Developer",
    "Three.js Portfolio",
    "Next.js 15",
    "React 19",
    "TypeScript",
    "PyTorch",
    "Python Developer",
    "Flutter Developer",
    "Docker",
    "DevOps",
    "WebGL",
    "BITS Pilani",
    "Computer Vision",
    "InsightFace",
    "ThreadFlo",
    "IoT",
    "Blender 3D",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Utsav Nandaniya (Utsaphire)",
  publisher: "SaphireScape",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://utsaphire.dev",
    types: {
      "text/plain": "https://utsaphire.dev/llms.txt",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "profile",
    firstName: "Utsav",
    lastName: "Nandaniya",
    username: "utsaphire",
    gender: "male",
    locale: "en_US",
    url: "https://utsaphire.dev",
    siteName: "Utsaphire | SaphireScape",
    title: "Utsav Nandaniya (Utsaphire) | Full-Stack Developer & AI Engineer",
    description:
      "Interactive 3D space portfolio of Utsav Nandaniya (Utsaphire) — Full-Stack Developer & AI Engineer specializing in Next.js, Three.js, PyTorch, Flutter, and IoT solutions under the SaphireScape label.",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1376,
        height: 768,
        alt: "Utsav Nandaniya (Utsaphire) - 3D Solar System Portfolio",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Utsav Nandaniya (Utsaphire) | Full-Stack Developer & AI Engineer",
    description:
      "Explore the interactive 3D solar system portfolio of Utsav Nandaniya (Utsaphire) — Full-Stack Developer & AI Engineer under the SaphireScape label.",
    creator: "@utsaphire",
    images: [
      {
        url: "/og-banner.jpg",
        alt: "Utsav Nandaniya (Utsaphire) - 3D Solar System Portfolio",
      },
    ],
  },
  category: "technology",
  classification: "Portfolio & Software Engineering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = getStructuredData();

  return (
    <html
      lang="en"
      className={`${audiowide.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VVESPT1Y9B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VVESPT1Y9B');
          `}
        </Script>
        {/* Linked Schema.org JSON-LD structured data for Google Knowledge Graph & Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Discovery link for AI agents (llms.txt) */}
        <link rel="describedby" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="AI Documentation" />
      </head>
      <body className="min-h-full bg-void text-metal-100 font-body overflow-hidden">
        {children}
      </body>
    </html>
  );
}
