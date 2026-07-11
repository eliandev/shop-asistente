import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, Oswald } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

// display condensada de la PLATAFORMA (landing negro+lima)
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-condensada",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0047AB",
};

export const metadata: Metadata = {
  title: "Silvi · ART-ES — Artesanía salvadoreña hecha a mano",
  description:
    "Pregúntale a Silvi sobre nuestras piezas artesanales: precios, envíos, pagos y más. Hecho a mano en El Salvador.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${karla.variable} ${oswald.variable}`}>{children}</body>
    </html>
  );
}
