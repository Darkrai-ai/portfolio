import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Audiowide, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

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

const CRYPTIC_DESCRIPTION =
  "Software that disappears into the work it does — less flash, more function. Eight worlds in quiet orbit under the SaphireScape signal. If you decoded the coordinates, you already know where to look.";

export const viewport: Viewport = {
  themeColor: "#05070D",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://utsaphire.dev"),
  title: "Utsaphire",
  description: CRYPTIC_DESCRIPTION,
  applicationName: "Utsaphire",
  authors: [{ name: "Utsaphire", url: "https://utsaphire.dev" }],
  creator: "Utsaphire",
  keywords: [
    "Utsaphire",
    "SaphireScape",
    "Utsav Nandaniya",
    "Full Stack Developer",
    "AI & Data Science",
    "3D Web Portfolio",
    "Three.js",
    "Next.js",
  ],
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://utsaphire.dev",
    siteName: "Utsaphire",
    title: "Utsaphire",
    description: CRYPTIC_DESCRIPTION,
    images: [
      {
        url: "/og-banner.jpg",
        width: 1376,
        height: 768,
        alt: "Utsaphire",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Utsaphire",
    description: CRYPTIC_DESCRIPTION,
    images: ["/og-banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </head>
      <body className="min-h-full bg-void text-metal-100 font-body overflow-hidden">
        {children}
      </body>
    </html>
  );
}
