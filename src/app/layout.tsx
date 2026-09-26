import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Utsaphire",
  description:
    "A cinematic 3D portfolio exploring technical skills through an interactive solar system.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      <body className="min-h-full bg-void text-metal-100 font-body overflow-hidden">
        {children}
      </body>
    </html>
  );
}
