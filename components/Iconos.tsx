/**
 * Set de iconos outlined de la plataforma (trazo, sin relleno).
 * Reemplazan a los emojis en la landing y en /crear para una estética
 * consistente. Heredan el color vía `currentColor`.
 */

interface IconoProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function base({ size = 20, strokeWidth = 1.8, className }: IconoProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function IconoCheck(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function IconoFlechaAbajo(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4v14" />
      <path d="M6 12l6 6 6-6" />
    </svg>
  );
}

export function IconoEscudo(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    </svg>
  );
}

export function IconoChispas(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M11 4l1.7 4.8L17.5 10l-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.2L11 4z" />
      <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    </svg>
  );
}

export function IconoBurbuja(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 11.5c0 4.1-4 7.5-9 7.5-1.2 0-2.4-.2-3.5-.6L3 20l1.4-4.1C3.5 14.6 3 13.1 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z" />
    </svg>
  );
}

export function IconoBolsa(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 8h12l-1.2 12H7.2L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

export function IconoCaja(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M3.5 8L12 4l8.5 4v8L12 20l-8.5-4V8z" />
      <path d="M3.5 8L12 12l8.5-4" />
      <path d="M12 12v8" />
    </svg>
  );
}

export function IconoHoja(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 15" />
      <path d="M5 19c3-5 7-8 11-10" />
    </svg>
  );
}

export function IconoCorazon(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 20s-7-4.5-9-9c-1.2-2.8.6-6 3.7-6 1.9 0 3.3 1 4.3 2.6C12 6 13.4 5 15.3 5c3.1 0 4.9 3.2 3.7 6-2 4.5-7 9-7 9z" />
    </svg>
  );
}

export function IconoTaza(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
      <path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2" />
    </svg>
  );
}

export function IconoEtiqueta(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 4h7l9 9-7 7-9-9V4z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </svg>
  );
}

export function IconoGota(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  );
}

export function IconoEstrella(p: IconoProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z" />
    </svg>
  );
}
