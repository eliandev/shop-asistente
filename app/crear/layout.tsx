import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creá tu asistente gratis",
  description:
    "Armá en 2 minutos el asistente de IA de tu marca: nombre, personalidad, colores, tu catálogo Shopify en vivo y tus datos. Sin código, sin cuentas — el link es tu asistente.",
  alternates: { canonical: "/crear" },
  openGraph: {
    title: "Creá tu asistente gratis · Silvi Assistants",
    description:
      "Nombre, colores, catálogo Shopify en vivo y tus reglas. En 2 minutos, gratis y sin código.",
    url: "/crear",
  },
};

export default function CrearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
