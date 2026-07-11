/**
 * ============================================================================
 *  BASE DE CONOCIMIENTO — ART-ES (art-es.shop)
 * ============================================================================
 *
 *  👉 ESTE ES EL ÚNICO ARCHIVO QUE NECESITÁS EDITAR para cambiar datos del negocio.
 *
 *  Todo lo que Silvi (el asistente) sabe sale de aquí. Si un dato NO está en
 *  este archivo (ni en el catálogo en vivo de Shopify), Silvi tiene
 *  instrucciones de admitir que no lo sabe y pasar el contacto de WhatsApp —
 *  nunca de inventar.
 *
 *  ✅ Datos reales cargados el 2026-07-10 (provistos por el dueño del negocio
 *     + catálogo en vivo de art-es.shop).
 *
 *  ⚠️ PENDIENTES DE CONFIRMAR (no incluidos o marcados abajo):
 *     - Método de envío en $0.00 detectado en la config: revisar si es promo
 *       real antes de anunciarlo aquí.
 *     - Sellos exactos de tarjetas aceptadas (verificar Admin → Pagos).
 *     - Dirección física: NO se publica en el asistente por privacidad (parece
 *       dirección residencial); si querés que Silvi la comparta, descomentá
 *       el campo `direccion` en `contacto`.
 * ============================================================================
 */

export interface Producto {
  nombre: string;
  descripcion: string;
  precio: string;
  materiales: string;
}

/**
 * Artesanos del taller. El chat "lo atiende" uno según la página desde la que
 * se abre (o el default). El asistente habla como LA VOZ DEL TALLER de ese
 * artesano — cuenta su historia y técnica — sin hacerse pasar por la persona
 * física (autenticidad ante todo).
 */
export interface Artesano {
  id: string;
  nombre: string; // cómo se muestra en el chat (encabezado y burbujas)
  taller: string;
  especialidad: string;
  bio: string;
  avatar: string; // ruta en /public
  saludo: string;
  /** alias para mapear vendor/tags de Shopify → artesano (en minúsculas) */
  alias: string[];
}

export interface KnowledgeBase {
  artesanos: Artesano[];
  artesanoPorDefecto: string;
  negocio: {
    nombre: string;
    queEs: string;
    propuestaUnica: string;
    origen: string;
  };
  productos: Producto[];
  precios: {
    rangoGeneral: string;
    envioIncluido: boolean;
  };
  horarios: {
    atencion: string;
    sucursal: string;
    zonaHoraria: string;
  };
  envios: {
    cobertura: string;
    costo: string;
    procesamiento: string;
  };
  pagos: {
    moneda: string;
    metodos: string[];
    ayudaWhatsapp: string;
  };
  politicas: {
    cambiosDevoluciones: string;
    reembolsos: string;
    excepciones: string;
    garantia: string;
    productoHechoAMano: string;
  };
  comoComprar: string;
  contacto: {
    whatsapp: string;
    whatsappLink: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    web: string;
    correo: string;
    direccion?: string;
  };
  preguntasFrecuentes: { pregunta: string; respuesta: string }[];
}

export const knowledgeBase: KnowledgeBase = {
  // Artesanos del taller — quién "atiende" el chat según la pieza que veas
  artesanos: [
    {
      id: "silvi",
      nombre: "Silvi",
      taller: "Eseoese by Silvi",
      especialidad:
        "Bolsos tejidos a mano y de crochet, y carteras artesanales (San Salvador).",
      bio:
        "Silvi es la artesana detrás de Eseoese by Silvi, en San Salvador. Teje a mano cada bolso y cartera en algodón, trapillo y cordón, con diseños propios de inspiración femenina.",
      avatar: "/avatar-silvi.png",
      saludo:
        "¡Hola! Te atiende el taller de Silvi 🧶 Acá tejemos a mano cada bolso y cartera de ART-ES. Preguntame por precios, envíos, pagos o lo que necesités.",
      alias: ["silvi", "eseoese", "eseoese-by-silvi", "eseoese by silvi"],
    },
    {
      id: "jose",
      nombre: "Don José",
      taller: "Artesanías en Nahuizalco",
      especialidad:
        "Bolsos de mecate, cojines bordados y arte en madera (Nahuizalco, Sonsonate).",
      bio:
        "Don José es artesano de Nahuizalco, cuna de la artesanía en fibras naturales de El Salvador. Trabaja el mecate y la fibra natural para bolsos, borda cojines y talla arte en madera con técnicas tradicionales.",
      avatar: "/avatar-jose.png",
      saludo:
        "¡Hola! Te atiende el taller de don José, en Nahuizalco 🧺 Acá hacemos los bolsos de mecate, cojines bordados y arte en madera de ART-ES. ¿Qué buscás?",
      alias: [
        "jose",
        "don-jose",
        "don jose",
        "nahuizalco",
        "artesanias-en-nahuizalco",
        "artesanías en nahuizalco",
        "artesanias en nahuizalco",
      ],
    },
  ],
  artesanoPorDefecto: "silvi",

  // Identidad del negocio
  negocio: {
    nombre: "ART-ES",
    queEs:
      "Tienda en línea de artesanía salvadoreña hecha a mano: bolsos tejidos y de crochet, carteras y cojines bordados, elaborados por manos artesanas de El Salvador.",
    propuestaUnica:
      "Cada pieza es hecha a mano por artesanos salvadoreños, como el taller Eseoese by Silvi en San Salvador y Artesanías en Nahuizalco. No vendemos producción industrial: cada pieza es única, con detalle y esencia artesanal.",
    origen:
      "ART-ES nace en El Salvador para dar visibilidad y un canal de venta digital al trabajo artesanal salvadoreño.",
  },

  // Productos de RESPALDO (solo se usan si el catálogo en vivo de Shopify no
  // está disponible). Tomados del catálogo real de art-es.shop el 2026-07-10.
  productos: [
    {
      nombre: "Bolso de mano estilo Elena",
      descripcion:
        "Bolso tejido a mano en algodón, de diseño delicado y formato compacto; para el día a día u ocasiones especiales.",
      precio: "$35.00 USD",
      materiales: "Tejido artesanal en algodón.",
    },
    {
      nombre: "Bolso de mano estilo Aracely",
      descripcion:
        "Bolso artesanal compacto en tono gris, fácil de llevar y combinar. Elaborado por Eseoese by Silvi en San Salvador.",
      precio: "$20.00 USD",
      materiales: "Trapillo de algodón.",
    },
    {
      nombre: "Bolso de mano crochet",
      descripcion:
        "Bolso tejido en crochet en vibrante tono rojo, resistente y ligero.",
      precio: "$12.00 USD",
      materiales: "Hilo sintético de alta calidad.",
    },
    {
      nombre: "Cartera Estilo Rubí",
      descripcion:
        "Cartera artesanal de diseño llamativo y femenino en tonos fucsia y natural, tejida a mano y estructurada.",
      precio: "$45.00 USD",
      materiales: "Tejido a mano en tonos fucsia y natural.",
    },
    {
      nombre: "Set de cojines bordados hecho a mano",
      descripcion:
        "Set de 2 cojines decorativos bordados (34×34 cm y 20×20 cm), creados por manos expertas de Artesanías en Nahuizalco.",
      precio: "$17.00 USD",
      materiales: "Bordado artesanal de Nahuizalco.",
    },
  ],

  // Precios generales (del catálogo real)
  precios: {
    rangoGeneral:
      "Nuestras piezas van desde $12 hasta $45 USD según el diseño y el trabajo artesanal.",
    envioIncluido: false,
  },

  // Horarios
  horarios: {
    atencion:
      "Atendemos por WhatsApp y redes sociales de lunes a domingo, de 8:00 a.m. a 10:00 p.m.",
    sucursal:
      "Por el momento no contamos con sucursal física: somos una tienda 100% en línea.",
    zonaHoraria: "Hora de El Salvador (GMT-6).",
  },

  // Envíos
  envios: {
    cobertura:
      "Por ahora enviamos únicamente dentro de El Salvador, a todo el país.",
    costo:
      "Envío estándar a domicilio: $3.50 USD (puede variar según la zona).",
    procesamiento:
      "Preparamos tu pedido en 1 a 3 días hábiles antes del envío.",
  },

  // Pagos
  pagos: {
    moneda: "USD (dólares)",
    metodos: [
      "Pago en línea en el checkout de la tienda (tarjeta de crédito o débito)",
      "Billeteras digitales: Apple Pay, Google Pay y Shop Pay",
    ],
    ayudaWhatsapp:
      "Si tenés alguna duda al momento de pagar, escribinos por WhatsApp y te acompañamos en el proceso.",
  },

  // Políticas
  politicas: {
    cambiosDevoluciones:
      "Aceptamos devoluciones dentro de los 30 días desde que recibís tu pedido, siempre que el producto esté sin usar, con sus etiquetas y empaque original, y presentés el recibo o comprobante de compra. Para un cambio, se procesa la devolución y luego se realiza la compra del artículo deseado.",
    reembolsos:
      "Una vez aprobada la devolución, el reembolso se hace al método de pago original en un plazo de hasta 10 días hábiles.",
    excepciones:
      "No aplican devoluciones en: productos perecederos, artículos personalizados, productos de cuidado personal, artículos en oferta y tarjetas de regalo.",
    garantia: "Garantía de 15 días en todas tus compras.",
    productoHechoAMano:
      "Por ser piezas artesanales hechas a mano, cada una es única: puede tener leves variaciones de color o textura respecto a la foto. Eso es parte de su valor, no un defecto.",
  },

  // Cómo comprar
  comoComprar:
    "Podés comprar directamente en nuestra tienda en línea (art-es.shop) agregando al carrito y pagando en el checkout, o escribirnos por WhatsApp y con gusto te acompañamos en todo el proceso.",

  // Contacto (datos reales)
  contacto: {
    whatsapp: "+503 7210 0755",
    whatsappLink: "https://wa.me/50372100755",
    instagram: "@artes.shop.sv (instagram.com/artes.shop.sv)",
    facebook: "facebook.com/artes.shop.sv",
    tiktok: "@artes.shop",
    web: "https://art-es.shop",
    correo: "artessv2024@gmail.com",
    // direccion:
    //   "Nuevo Lourdes Pte, Senda Cortez Blanco, Pol II, Casa 10, Colón, La Libertad, El Salvador, CP 01512 (sin atención presencial)",
  },

  // Preguntas frecuentes
  preguntasFrecuentes: [
    {
      pregunta: "¿Quiénes hacen las piezas?",
      respuesta:
        "Artesanos salvadoreños reales: Silvi (Eseoese by Silvi, San Salvador) teje los bolsos y carteras, y don José (Nahuizalco) hace los bolsos de mecate, los cojines bordados y el arte en madera.",
    },
    {
      pregunta: "¿Los productos son realmente hechos a mano?",
      respuesta:
        "Sí, cada pieza es hecha a mano por artesanos salvadoreños, como el taller Eseoese by Silvi en San Salvador y Artesanías en Nahuizalco. Por eso cada una es única.",
    },
    {
      pregunta: "¿Hacen envíos fuera de El Salvador?",
      respuesta:
        "Por ahora solo enviamos dentro de El Salvador. Si estás fuera del país, escribinos por WhatsApp y vemos cómo ayudarte.",
    },
    {
      pregunta: "¿Cuánto tarda en llegar mi pedido?",
      respuesta:
        "Preparamos tu pedido en 1 a 3 días hábiles y luego sale el envío a domicilio a cualquier punto de El Salvador.",
    },
    {
      pregunta: "¿Tienen tienda física?",
      respuesta:
        "Por el momento no: somos una tienda 100% en línea. Nos encontrás en art-es.shop y en redes como @artes.shop.sv.",
    },
    {
      pregunta: "¿Puedo devolver o cambiar un producto?",
      respuesta:
        "Sí: tenés 30 días desde que lo recibís, siempre que esté sin usar, con etiquetas y empaque original y tu comprobante. Escribinos por WhatsApp para iniciar el proceso.",
    },
  ],
};

/**
 * Resuelve un artesano por id o alias (acepta el vendor/tag que manda el
 * widget desde Shopify). Si no hay match, devuelve el artesano por defecto.
 */
export function resolverArtesano(idOAlias?: string | null): Artesano {
  const porDefecto =
    knowledgeBase.artesanos.find((a) => a.id === knowledgeBase.artesanoPorDefecto) ??
    knowledgeBase.artesanos[0];
  if (!idOAlias) return porDefecto;
  const clave = idOAlias.trim().toLowerCase();
  return (
    knowledgeBase.artesanos.find(
      (a) => a.id === clave || a.alias.includes(clave)
    ) ?? porDefecto
  );
}
