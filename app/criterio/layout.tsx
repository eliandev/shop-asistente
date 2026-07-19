import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { absolute: "Criterio · Aurora Store — asistente de e-commerce" },
  description:
    "Criterio decide cuándo responder solo y cuándo pasarle el caso a una persona. Demo en vivo de un asistente creado con Silvi Assistants.",
  alternates: { canonical: "/criterio" },
  openGraph: {
    title: "Criterio — el agente que sabe cuándo escalar",
    description:
      "Soporte de e-commerce con criterio: responde solo, deja borrador o escala a un humano. Demo de Silvi Assistants.",
    url: "/criterio",
  },
};

export default function CriterioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
