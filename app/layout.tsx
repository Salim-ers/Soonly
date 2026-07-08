import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Quicksand } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", axes: ["opsz"] });
const brand = Quicksand({ subsets: ["latin"], variable: "--font-brand", weight: ["600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Soonly — Never miss what matters.", template: "%s · Soonly" },
  description:
    "Vos dates importantes sont partout. Soonly les garde au même endroit — rendez-vous, papiers, abonnements, garanties, documents — et vous prévient avant qu'il ne soit trop tard.",
  applicationName: "Soonly",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Soonly", statusBarStyle: "default" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Soonly — Never miss what matters.",
    description: "Rassemblez vos échéances importantes et soyez prévenu avant qu'il ne soit trop tard.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D3B46",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const THEME_INIT = `(function(){try{var t=localStorage.getItem('soonly-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${brand.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
