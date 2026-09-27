# BRD — Silvi Assistants (Business Requirements Document)

**Versión:** 1.0 · **Estado:** propuesta / en definición · **Dueño:** Elian
**Documento hermano:** [PRD.md](./PRD.md) (producto)
**Fecha base:** 2026-07

> Las cifras de mercado y las proyecciones de este documento son **direccionales**
> (marcos de estimación con supuestos explícitos), **no datos cerrados**. Están
> pensadas para **validarse** antes de tomar decisiones de inversión.

---

## 1. Resumen ejecutivo

Silvi Assistants vende un **asistente de IA no-code para tiendas Shopify** que
atiende y vende con **catálogo en vivo**, la voz de la marca y **cero
invención**. El producto ya está validado técnicamente (v2.0 en producción). El
objetivo del negocio es convertirlo en un **SaaS global freemium** con ingresos
recurrentes, apalancado en un embudo de bajo costo de adquisición (el plan Free
con "link compartible" es, además, un **motor de crecimiento**).

- **Modelo:** Freemium + suscripción con **límites de uso** (planes por volumen de mensajes de IA).
- **Distribución:** **SaaS propio primero** (Stripe), **Shopify App Store** después.
- **Mercado:** **Global**, bilingüe **EN + ES**, precios en **USD**.
- **Meta 12 meses (base, a validar):** llegar a **~$3–5k MRR** y sentar las bases para el App Store.

## 2. Objetivos de negocio

| # | Objetivo | Indicador | Horizonte |
|---|---|---|---|
| O1 | Validar disposición a pagar | Primeros 10 clientes de pago | 0–3 meses tras MVP |
| O2 | Ingreso recurrente | MRR | $1k (mes 6) → $3–5k (mes 12) *(escenario base)* |
| O3 | Embudo eficiente | Conversión Free→pago ≥ 3–5% | continuo |
| O4 | Retención | Churn ≤ 5%/mes; NRR ≥ 100% | continuo |
| O5 | Margen | Margen bruto ≥ 80% | continuo |
| O6 | Alcance | 2º canal de adquisición vivo (App Store o partners) | mes 9–12 |

## 3. Problema y oportunidad

**Problema.** Las tiendas pequeñas y medianas pierden ventas por responder tarde
las mismas preguntas (precio, stock, envíos, pagos, devoluciones) y por dar
soporte inconsistente. Las soluciones existentes suelen ser **caras, genéricas,
o exigen configuración técnica**, y muchos bots **alucinan** (inventan precios o
políticas), lo que erosiona la confianza.

**Oportunidad.** Un asistente que (a) se conecta al catálogo **con solo el
dominio** (sin tokens ni apps), (b) **nunca inventa** y deriva a humano, y (c)
se crea **sin código en minutos**, elimina las tres barreras de golpe. El
componente **Criterio** (soporte con autonomía graduada 🟢/🟡/🔴 + humano en el
loop) agrega un diferencial que los chatbots "responde-todo" no tienen.

## 4. Mercado (marco de estimación)

> Ballpark ampliamente conocido: Shopify tiene **millones de comercios activos** a
> nivel global. Úsese como orden de magnitud; **validar** con fuentes vigentes.

- **TAM (Total):** comercios Shopify globales que podrían usar un asistente de IA de ventas/soporte.
- **SAM (Serviceable):** subconjunto **SMB/DTC** angloparlante e hispanohablante, con catálogo activo y necesidad de atención (mercado inicial del producto bilingüe).
- **SOM (Obtainable, año 1):** los que podamos alcanzar por PLG + contenido + ecosistema Shopify + red propia. **Meta año 1 (base):** cientos de cuentas activas, decenas de pago.

**Tendencias a favor:** adopción acelerada de IA en e-commerce; presión por
reducir costos de soporte; expectativa de respuesta inmediata 24/7;
abaratamiento de modelos (Haiku-class) que mejora el margen.

## 5. Segmentos y personas

1. **DTC / SMB Shopify (primario de pago):** 1–3 personas, sin equipo de soporte, quieren vender más y responder rápido. Sensibles a precio y a "que funcione ya".
2. **Emprendedor que arranca (top del embudo):** usa el **Free** como primer canal; convierte al crecer o al querer el widget/quitar marca.
3. **Agencias / freelancers (expansión):** gestionan varias tiendas; valoran multi-tienda, seats y reventa (plan Scale / futuro partner).

## 6. Panorama competitivo y diferenciación

**Categorías/competidores** (referencia general, validar posicionamiento y
precios actuales de cada uno): Shopify Inbox, Tidio, Gorgias, Re:amaze, Zowie,
Manychat, Intercom/Fin, y "GPT wrappers" genéricos.

**Nuestra diferenciación:**
1. **Catálogo en vivo sin tokens ni app** (solo el dominio) — onboarding sin fricción técnica.
2. **Anti-invención por diseño** (fuentes acotadas del lado del server) — confianza.
3. **"El link es el asistente"** — time-to-value en minutos y **loop de crecimiento** (cada link compartido es marketing).
4. **Criterio: autonomía graduada con humano en el loop** — no es "responde todo" ni "escala todo".
5. **Bilingüe EN+ES** y precio accesible — hueco desatendido en el mercado hispano + competitivo en el global.

## 7. Propuesta de valor

> "Un empleado de IA para tu tienda que vende y da soporte con tus datos reales
> —sin código, sin inventar— por el precio de un café al mes."

Beneficios: más ventas (responde en el momento de la compra), menos carga de
soporte (deflection), cero alucinación (confianza), y control (humano en el loop
para lo sensible).

## 8. Modelo de negocio y monetización {#modelo}

**Estrategia:** Freemium **product-led** (PLG). El **Free** entrega valor real y
distribuye la marca; el pago se dispara por **uso** (límites de mensajes) y por
**funciones** (widget, quitar marca, Criterio, analítica, multi-tienda).

### Pricing {#pricing}

Unidad facturable: **mensaje de IA/mes** (agregado por cuenta).

| Plan | USD/mes *(propuesta)* | Mensajes IA/mes | Incluye |
|---|---|---|---|
| **Free** | $0 | 100 | Link compartible, catálogo en vivo, anti-invención, marca Silvi visible |
| **Starter** | ~$19 | 1.000 | Widget en 1 tienda, se quita la marca, analítica básica |
| **Growth** | ~$49 | 5.000 | + Criterio (soporte), hasta 3 tiendas, analítica avanzada, prioridad |
| **Scale** | ~$149 | 20.000 | + multi-tienda/seats, export, integraciones, SLA |

- **Anual:** ~2 meses gratis (descuento ~17%).
- **Overage:** paquete de +1.000 mensajes por ~$X, o upgrade sugerido en 1 click.
- **Prueba gratis:** 14 días de Growth (con o sin tarjeta — decisión abierta §14).

### Unit economics (marco)

- **Costo variable dominante = tokens de IA.** A precios actuales de un modelo
  **Haiku-class**, el costo por mensaje ronda **fracciones de centavo de USD**
  → **validar** con el pricing vigente de Anthropic (p. ej. vía la skill
  `claude-api` o la doc oficial) y multiplicar por tokens promedio in/out.
- **Ejemplo ilustrativo (a completar con datos reales):** si un mensaje cuesta
  ~$0,003 en tokens, un cliente **Growth** ($49, 5.000 msgs) que usa el 100% del
  cupo cuesta ~$15 en IA → **margen bruto ~70–85%** aun antes de optimizar
  (caché, límites). Los **límites de uso son el control de margen**: nadie puede
  quemar tu costo sin pagar más.
- **Infra** (Vercel, DB, Stripe fees ~2.9%+30¢, n8n) es marginal frente a la suscripción.

## 9. Go-to-market {#gtm}

**Motor central: PLG + contenido.**
1. **Loop del Free:** cada asistente compartido (link) expone la marca "Powered by Silvi" → nuevos signups. Costo de adquisición ≈ 0.
2. **Prueba social real:** **ART-ES** como caso de estudio (tienda salvadoreña real) + demos (María/Glow Beauty) + **video de Criterio**.
3. **Contenido/SEO bilingüe:** guías "asistente para Shopify", "cómo dar soporte con IA sin alucinar", comparativas honestas.
4. **Ecosistema Shopify:** comunidades, foros, y **Shopify App Store** (fase C) para descubrimiento orgánico.
5. **Partners/agencias:** programa de reventa (fase posterior).
6. **Outbound ligero:** a tiendas Shopify hispanas/DTC pequeñas con oferta "probá tu asistente gratis en 2 minutos".

**Activación (clave del PLG):** signup → asistente publicado con catálogo real →
primera conversación → "aha". Onboarding guiado + plantillas por rubro.

## 10. KPIs y métricas de éxito

| Área | KPI | Meta inicial |
|---|---|---|
| Crecimiento | Signups / semana; coef. de viralidad (k) del loop Free | k > 0, creciente |
| Activación | % que publica y recibe ≥1 conversación | ≥ 40% |
| Conversión | Free→pago (30 días) | 3–5% |
| Ingreso | MRR, ARR, ARPA | $1k→$3–5k MRR (12m, base) |
| Retención | Churn logo/ingreso; **NRR** | churn ≤ 5%/m; NRR ≥ 100% |
| Eficiencia | CAC, **LTV/CAC** | LTV/CAC ≥ 3 |
| Producto | North Star: mensajes de IA útiles/mes | creciente |
| Margen | Margen bruto | ≥ 80% |

## 11. Proyección financiera (escenarios ilustrativos)

> **Supuestos base (editables):** ARPA ≈ $35/mes (mezcla Starter/Growth); churn
> 5%/mes; conversión Free→pago 4%; crecimiento de signups por PLG + contenido.
> **No es una predicción** — es un modelo para llenar con datos reales.

| Escenario | Clientes de pago (mes 12) | MRR (mes 12) | Notas |
|---|---|---|---|
| Conservador | ~40 | ~$1,4k | PLG lento, poco contenido |
| **Base** | ~100–140 | **~$3–5k** | Loop Free + contenido + ART-ES |
| Optimista | ~300+ | ~$10k+ | App Store tracciona + partners |

**Costos principales:** IA (variable, acotado por límites), infra (bajo), Stripe
fees, y tiempo/ads si se invierte en adquisición. **Break-even operativo** temprano
posible por el bajo costo variable y CAC≈0 del loop.

## 12. Stakeholders y roles

| Rol | Quién | Responsabilidad |
|---|---|---|
| Founder / Product / Eng | Elian | Visión, roadmap, desarrollo, soporte inicial (vía Criterio) |
| Proveedores clave | Anthropic (IA), Shopify/UCP (catálogo), Stripe (pagos), Vercel (hosting), n8n (automatización) | Servicios core |
| Caso de estudio | ART-ES (Silvi, Don José) | Prueba social real |
| Clientes | Merchants SMB/DTC globales | Ingreso |

## 13. Riesgos de negocio y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Costo de IA erosiona margen | Alto | Límites de uso duros/blandos, Haiku, caché, monitoreo de margen |
| Competencia consolidada | Alto | Diferenciación clara (sin tokens, anti-invención, Criterio, bilingüe), nicho hispano + precio |
| Dependencia de Shopify | Medio | Abstraer capa de catálogo; respaldo Storefront; visión multi-plataforma |
| Baja conversión Free→pago | Alto | Activación fuerte, valor visible (analítica), gates de valor (widget/marca/límites) |
| Churn | Medio | Onboarding, ROI visible, Criterio como pegamento, anual con descuento |
| Legal/privacidad (IA, PII global) | Medio | GDPR/CCPA, DPA, transparencia de IA, minimización de datos (§ PRD 8) |
| Reputación por alucinación | Alto | Anti-invención del server + auditoría continua |
| Founder único / ancho de banda | Medio | Automatizar (Criterio, self-serve billing), priorizar Fase A |

## 14. Cumplimiento y legal

- **Términos de servicio** y **Política de privacidad** (bilingües) antes de cobrar.
- **GDPR/CCPA:** export/borrado de datos, base legal, **DPA** con encargados (Anthropic, Stripe, Vercel, n8n, DB).
- **Transparencia de IA:** avisar al shopper que conversa con un asistente automático.
- **Pagos:** Stripe (PCI a cargo de Stripe); manejar impuestos/`Stripe Tax` para venta global.
- **Datos de shoppers:** minimización y retención configurable; no persistir conversación salvo lo necesario.

## 15. Roadmap y hitos de negocio {#roadmap}

| Hito | Depende de (PRD) | Señal de éxito |
|---|---|---|
| **Lanzar MVP monetizable** | Fase A | Cobro self-serve funcionando |
| **Primer cliente de pago** | Fase A | Validación de willingness-to-pay |
| **10 clientes / ~$1k MRR** | Fase A→B | Repetibilidad del embudo |
| **Criterio como feature + i18n EN** | Fase B | Ticket promedio ↑, alcance global |
| **~$3–5k MRR** | Fase B | Tracción sostenida |
| **Shopify App Store publicado** | Fase C | 2º canal de descubrimiento |
| **Partners/agencias + NRR ≥ 100%** | Fase C | Expansión |

## 16. Decisiones abiertas (a validar)

1. **Precios y topes exactos** por plan (calibrar contra costo real de tokens y benchmarks).
2. **Prueba gratis** con tarjeta vs sin tarjeta (afecta conversión y calidad de leads).
3. **DB:** Postgres nuevo (Supabase/Neon) vs seguir en Firestore para todo (estimar esfuerzo).
4. **Auth:** Auth.js vs Clerk/Supabase Auth (costo, velocidad, control).
5. **Criterio para el merchant:** ¿incluido en Growth o add-on aparte?
6. **Nombre/marca comercial** para el mercado global (Silvi Assistants vs otro) y dominio.
7. **Estrategia de impuestos/venta global** (Stripe Tax, Merchant of Record tipo Paddle/LemonSqueezy).
