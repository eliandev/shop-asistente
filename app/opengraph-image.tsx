import { ImageResponse } from "next/og";

/**
 * Imagen Open Graph de la plataforma (negro + lima), generada en el edge.
 * Se usa automáticamente como og:image / twitter:image de todo el sitio.
 */
export const runtime = "edge";
export const alt =
  "Silvi Assistants — Creá el asistente de IA que responde por tu negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagenOg() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E0E0F",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path
              fill="#C9F73A"
              d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2 .9 3.9 2.4 5.3-.2 1.1-.8 2.6-2 3.7 0 0 2.9-.1 5.1-1.6 1.1.4 2.4.6 3.7.6 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z"
            />
          </svg>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#F7F6F0",
              letterSpacing: 4,
            }}
          >
            SILVI°
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: "#F7F6F0",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            El asistente de IA que
          </div>
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: "#C9F73A",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            responde por tu negocio
          </div>
          <div style={{ fontSize: 30, color: "#A8A79D", marginTop: 10 }}>
            Catálogo Shopify en vivo · Tu marca · Cero datos inventados
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#8F8F86",
          }}
        >
          <div>silvi-assistants.vercel.app</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "#C9F73A",
                color: "#0E0E0F",
                fontWeight: 800,
                fontSize: 24,
                padding: "10px 22px",
                borderRadius: 12,
              }}
            >
              Creá el tuyo gratis →
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
