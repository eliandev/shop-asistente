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
  themeColor: "#0E0E0F",
  width: "device-width",
  initialScale: 1,
};

/**
 * Metadata base de la PLATAFORMA. Cada ruta define la suya:
 * `/` hereda este default, /crear y /admin la suya vía layout de segmento,
 * /chat genera título dinámico según el asistente (generateMetadata).
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://silvi-assistants.vercel.app"),
  title: {
    default: "Silvi Assistants — Creá el asistente de IA que responde por tu negocio",
    template: "%s · Silvi Assistants",
  },
  description:
    "Creá gratis un asistente de IA para tu tienda: catálogo Shopify en vivo (sin tokens), tu conocimiento y tu marca. Nunca inventa — si no sabe, lo admite y deriva a tu WhatsApp.",
  applicationName: "Silvi Assistants",
  authors: [{ name: "ART-ES", url: "https://art-es.shop" }],
  creator: "Silvi Assistants",
  keywords: [
    "asistente de IA",
    "chatbot para tiendas",
    "Shopify",
    "asistente virtual para negocios",
    "IA para emprendimientos",
    "chat de atención al cliente",
    "El Salvador",
  ],
  category: "technology",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_SV",
    siteName: "Silvi Assistants",
    url: "/",
    title: "Silvi Assistants — Creá el asistente de IA que responde por tu negocio",
    description:
      "Asistentes de IA con catálogo Shopify en vivo, tu marca y cero datos inventados. Gratis, sin código y sin cuentas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silvi Assistants — asistentes de IA para tu negocio",
    description:
      "Creá gratis el asistente que responde por tu tienda: catálogo en vivo, tu marca, cero datos inventados.",
  },
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
