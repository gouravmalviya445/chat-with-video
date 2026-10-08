import type { Metadata } from "next";
import { Architects_Daughter, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const architectsDaughter = Architects_Daughter({
  weight: "400",
  variable: "--font-handwritten",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat With Video — Playful Sketchbook RAG",
  description: "Upload or paste any video, ask questions, and chat with your video using AI RAG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${architectsDaughter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-ink selection:bg-marker-yellow">
        {/* Hidden SVG Filter for authentic hand-drawn paper roughness */}
        <svg className="hidden">
          <defs>
            <filter id="sketchy-edge">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.8"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {children}
      </body>
    </html>
  );
}
