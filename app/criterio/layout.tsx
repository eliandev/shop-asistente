import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0E0E0F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { absolute: "Soporte · Silvi Assistants" },
  description:
    "Centro de soporte de Silvi Assistants. Resolvé dudas sobre tu asistente de IA —crearlo, instalar el widget, plan Pro, catálogo, técnico— con Criterio, que responde o te deriva al equipo.",
  alternates: { canonical: "/criterio" },
  openGraph: {
    title: "Soporte · Silvi Assistants",
    description:
      "¿Cómo podemos ayudarte? Dudas sobre tu asistente, del '¿por dónde empiezo?' a lo técnico.",
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
