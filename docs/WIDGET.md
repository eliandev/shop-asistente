# Widget flotante de Silvi — guía de inserción

El asistente puede usarse de dos formas:
1. **Link directo:** la URL pública de la app (ej. `https://tu-app.vercel.app`) — chat a pantalla completa.
2. **Burbuja flotante en tu tienda:** un `<script>` que inyecta un botón flotante
   y abre el chat en un panel, sin tocar el diseño del sitio.

## Inserción en Shopify (recomendada: sin tocar archivos del tema)

La forma segura y editable desde el **Theme Editor** (no requiere tocar código del tema):

1. En Shopify Admin: **Tienda online → Temas → Personalizar**.
2. En el panel izquierdo, bajá hasta el grupo **Footer** (pie de página) —
   lo que se agrega ahí aparece en TODAS las páginas.
3. **Agregar sección → Custom Liquid** (Liquid personalizado).
4. Pegá esto en el campo de código:

```liquid
{% comment %}
  Widget del asistente de ART-ES.
  En páginas de producto, el chat lo atiende el taller del artesano que hizo
  la pieza (usa el vendor del producto); en el resto de páginas, el default.
{% endcomment %}
<script
  src="https://TU-APP.vercel.app/widget.js"
  defer
  data-color="#0047AB"
  data-posicion="derecha"
  data-etiqueta="Chateá con el taller"
  {% if product %}data-artesano="{{ product.vendor | escape }}"{% endif %}>
</script>
```

> **Nota:** para que la detección funcione, el campo **Vendor** de cada producto
> en Shopify debe ser el taller/artesano (ej. "Eseoese by Silvi", "Artesanías en
> Nahuizalco"). Los alias reconocidos se definen en `lib/knowledge-base.ts`
> (campo `alias` de cada artesano); si el vendor no coincide con ninguno,
> atiende el artesano por defecto — nunca se rompe.

5. Reemplazá `TU-APP.vercel.app` por el dominio real del despliegue y guardá.

**Ventajas de esta vía:** la puede activar/desactivar cualquier persona desde el
Theme Editor, no modifica `theme.liquid` ni archivos globales del tema, y
sobrevive actualizaciones del tema sin conflictos.

### Alternativa (global, requiere tocar el tema — usar con cuidado)

Editar `layout/theme.liquid` y pegar el `<script>` antes de `</body>`.
⚠️ **Riesgo:** `theme.liquid` es un archivo global; un error ahí afecta toda la
tienda. Si tomás esta vía: hacé una **copia del tema** primero, probá en el
**preview** y publicá solo después de verificar.

## Flujo de publicación recomendado (siempre)

1. Duplicar el tema actual (respaldo).
2. Aplicar el cambio en el tema borrador.
3. Verificar en el preview del tema (móvil y escritorio).
4. Publicar.

## Personalización del script

| Atributo | Default | Uso |
|---|---|---|
| `data-color` | `#0047AB` | Color del botón flotante |
| `data-posicion` | `derecha` | `derecha` o `izquierda` |
| `data-etiqueta` | "Abrir chat de asistencia" | Texto accesible (aria-label/tooltip) |

## Analytics (GA4 / dataLayer)

Si la tienda tiene `dataLayer` (GA4), el widget empuja estos eventos:
- `silvi_widget_abierto` — el visitante abrió el chat
- `silvi_widget_cerrado` — lo cerró

Podés crear eventos/conversiones en GA4 a partir de ellos para medir uso.

## Detalles técnicos

- El panel es un `iframe` que carga la app del chat (carga perezosa: solo al
  primer clic, no afecta la velocidad de la tienda).
- En pantallas <480px el panel ocupa toda la pantalla (UX móvil).
- El botón respeta foco de teclado (`focus-visible`) y `aria-expanded`.
- Página de prueba local: `/widget-demo.html`.
- Endurecimiento opcional: restringir el embebido a tu tienda agregando en
  `next.config.js` el header `Content-Security-Policy: frame-ancestors` con los
  dominios permitidos (hoy se permite cualquier origen para facilitar pruebas).
