import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de personalización (demo)",
  description:
    "Vista previa del panel de gestión de Silvi Assistants: colores, avatar, personalidad y catálogo por tienda.",
  // demo sin persistencia: fuera del índice de buscadores
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
