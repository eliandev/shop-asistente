/**
 * ============================================================================
 *  BASE DE CONOCIMIENTO — ART-ES
 * ============================================================================
 *
 *  👉 ESTE ES EL ÚNICO ARCHIVO QUE NECESITÁS EDITAR.
 *
 *  Todo lo que Silvi (el asistente) sabe sale de aquí. Si un dato NO está en
 *  este archivo, Silvi tiene instrucciones de admitir que no lo sabe y pasar
 *  el contacto de WhatsApp — nunca de inventar.
 *
 *  ⚠️  LOS DATOS DE ABAJO SON UNA PLANTILLA DE EJEMPLO.
 *      Reemplazá cada valor por la información REAL de tu negocio antes de
 *      publicar. El reto pide "mínimo 10 datos concretos": aquí hay 14+.
 *
 *  Buscá los comentarios  // ✏️ EDITAR  para saber qué cambiar.
 * ============================================================================
 */

export interface Producto {
  nombre: string;
  descripcion: string;
  precio: string;
  materiales: string;
  tiempoProduccion: string;
}

export interface KnowledgeBase {
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
    respuestaChat: string;
    zonaHoraria: string;
  };
  envios: {
    elSalvador: string;
    centroamerica: string;
    costos: string;
    empaque: string;
  };
  pagos: {
    metodos: string[];
    contraEntrega: string;
    whatsapp: string;
  };
  politicas: {
    cambiosDevoluciones: string;
    garantiaAutenticidad: string;
    productoHechoAMano: string;
  };
  comoComprar: string;
  contacto: {
    whatsapp: string;
    instagram: string;
    web: string;
    correo: string;
  };
  preguntasFrecuentes: { pregunta: string; respuesta: string }[];
}

export const knowledgeBase: KnowledgeBase = {
  // 1–4. Identidad del negocio  // ✏️ EDITAR
  negocio: {
    nombre: "ART-ES",
    queEs:
      "Tienda en línea de artesanía salvadoreña hecha a mano. Trabajamos directamente con artesanos y artesanas de El Salvador para llevar sus piezas al mundo.",
    propuestaUnica:
      "Cada pieza es 100% artesanal, hecha a mano por artesanos salvadoreños reales. No vendemos producción industrial ni réplicas: vendemos trabajo auténtico, con historia y con nombre.",
    origen:
      "ART-ES nace en El Salvador para dar visibilidad y un canal de venta digno a los artesanos locales, rescatando técnicas tradicionales como el teñido con añil, el barro y el tejido de fibras naturales.",
  },

  // 5–7. Productos con precios concretos  // ✏️ EDITAR (precios, nombres, materiales)
  productos: [
    {
      nombre: "Bolso tejido de tule",
      descripcion:
        "Bolso artesanal tejido a mano con fibra de tule, ideal para el día a día.",
      precio: "$28.00 USD",
      materiales: "Fibra natural de tule teñida con tintes naturales.",
      tiempoProduccion: "Disponible en stock / 5 días si es por encargo.",
    },
    {
      nombre: "Camisa teñida con añil",
      descripcion:
        "Camisa de algodón teñida a mano con añil salvadoreño con técnica de amarrado (shibori).",
      precio: "$35.00 USD",
      materiales: "Algodón 100% y añil natural cultivado en El Salvador.",
      tiempoProduccion: "Por encargo, 7 días hábiles.",
    },
    {
      nombre: "Set de tazas de barro",
      descripcion: "Juego de 2 tazas de barro cocido, moldeadas a mano.",
      precio: "$22.00 USD",
      materiales: "Barro local cocido en horno tradicional.",
      tiempoProduccion: "Disponible en stock.",
    },
  ],

  // 8. Precios generales  // ✏️ EDITAR
  precios: {
    rangoGeneral:
      "Nuestros productos van desde $15 hasta $60 USD según la pieza y el trabajo artesanal.",
    envioIncluido: false,
  },

  // 9. Horarios  // ✏️ EDITAR
  horarios: {
    atencion:
      "Lunes a viernes de 9:00 a.m. a 6:00 p.m. y sábados de 9:00 a.m. a 1:00 p.m.",
    respuestaChat:
      "Por WhatsApp respondemos dentro del horario de atención; fuera de horario contestamos al siguiente día hábil.",
    zonaHoraria: "Hora de El Salvador (GMT-6).",
  },

  // 10–11. Envíos  // ✏️ EDITAR (tiempos y costos reales)
  envios: {
    elSalvador:
      "Envíos a todo El Salvador en 2 a 4 días hábiles a través de courier local.",
    centroamerica:
      "Enviamos a Guatemala, Honduras, Nicaragua, Costa Rica y Panamá en 7 a 12 días hábiles.",
    costos:
      "El Salvador: $3.50 dentro de San Salvador y $5.00 al resto del país. Centroamérica: se cotiza según país y peso al confirmar el pedido.",
    empaque:
      "Empacamos cada pieza a mano con materiales reciclados y una tarjeta con la historia del artesano.",
  },

  // 12. Pagos  // ✏️ EDITAR
  pagos: {
    metodos: [
      "Tarjeta de crédito o débito (a través de la tienda en línea)",
      "Transferencia bancaria",
      "Pago contra entrega (solo dentro de El Salvador)",
    ],
    contraEntrega:
      "El pago contra entrega está disponible únicamente dentro de El Salvador y se coordina por WhatsApp.",
    whatsapp:
      "La forma más rápida de cerrar una compra es por WhatsApp: te ayudamos a elegir, confirmamos disponibilidad y coordinamos el pago.",
  },

  // 13. Políticas  // ✏️ EDITAR
  politicas: {
    cambiosDevoluciones:
      "Aceptamos cambios dentro de los primeros 7 días si la pieza llega con algún defecto de fabricación. Al ser productos hechos a mano, pequeñas variaciones de color o textura no se consideran defectos.",
    garantiaAutenticidad:
      "Garantizamos que cada pieza es hecha a mano por artesanos salvadoreños. No usamos producción industrial.",
    productoHechoAMano:
      "Por ser artesanal, cada pieza es única: puede tener leves diferencias respecto a la foto. Eso es parte de su valor, no un defecto.",
  },

  // 14. Cómo comprar  // ✏️ EDITAR
  comoComprar:
    "Podés comprar directamente en nuestra tienda en línea agregando al carrito y pagando con tarjeta, o escribirnos por WhatsApp para que te acompañemos en todo el proceso y coordinar pago contra entrega o transferencia.",

  // Contacto  // ✏️ EDITAR — PONÉ TUS DATOS REALES
  contacto: {
    whatsapp: "+503 0000-0000",
    instagram: "@artes.sv",
    web: "https://artes.example.com",
    correo: "hola@artes.example.com",
  },

  // FAQ extra  // ✏️ EDITAR / AGREGAR las que quieras
  preguntasFrecuentes: [
    {
      pregunta: "¿Los productos son realmente hechos a mano?",
      respuesta:
        "Sí, cada pieza es hecha a mano por artesanos salvadoreños. Por eso cada una es única.",
    },
    {
      pregunta: "¿Hacen piezas personalizadas o por encargo?",
      respuesta:
        "Sí, varias piezas se hacen por encargo. Escribinos por WhatsApp para contarnos qué buscás y darte tiempos.",
    },
    {
      pregunta: "¿Puedo comprar al por mayor?",
      respuesta:
        "Sí, manejamos precios especiales por mayoreo. Coordinalo directamente por WhatsApp.",
    },
  ],
};
