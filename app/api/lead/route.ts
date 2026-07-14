import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { firebaseConfigurado, getDb } from "@/lib/firebase-admin";
import { construirCorreoLead, snippetDesdeShareUrl } from "@/lib/correo";

export const runtime = "nodejs";

/**
 * Captura de leads "Reclamar tu asistente" (Reto 3 — Vibecoders League).
 * Guarda el lead en Firestore (colección `leads`) con dedupe transaccional:
 * el ID del documento es SHA-256 del correo en minúsculas (sin PII en la ruta).
 */

// ── Anti-abuso: rate-limit por IP (in-memory, por instancia) ────────────────
const RATE_LIMIT = 8;
const RATE_VENTANA_MS = 60_000;
const peticiones = new Map<string, { conteo: number; reinicio: number }>();
function limitado(ip: string): boolean {
  const ahora = Date.now();
  const r = peticiones.get(ip);
  if (!r || ahora > r.reinicio) {
    peticiones.set(ip, { conteo: 1, reinicio: ahora + RATE_VENTANA_MS });
    return false;
  }
  r.conteo += 1;
  return r.conteo > RATE_LIMIT;
}

// ── Saneamiento ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor
    .replace(/[<>`\\]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return limpio || null;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** Snapshot del asistente: solo lo útil para segmentar (ver spec §5). */
function snapshotAsistente(cruda: any): Record<string, string> | null {
  if (!cruda || typeof cruda !== "object") return null;
  const snap = {
    marca: texto(cruda.marca, 40) ?? "",
    asistente: texto(cruda.asistente, 30) ?? "",
    rubro: texto(cruda.rubro, 90) ?? "",
    dominio: texto(cruda.dominio, 80) ?? "",
    color: texto(cruda.color, 9) ?? "",
  };
  return snap.marca || snap.asistente ? snap : null;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    if (limitado(ip)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    // Honeypot: los bots lo llenan; se responde ok sin persistir nada.
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true, duplicate: false });
    }

    const email = texto(body?.email, 120)?.toLowerCase() ?? "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const tipo = body?.tipo === "pro" ? "pro" : "guardar";
    const asistente = snapshotAsistente(body?.asistente);
    // link del asistente (contiene ?c=): sirve para el correo y para que el
    // dueño lo abra desde la consola. Debe ser una URL http(s) del propio sitio.
    const shareUrlBruto = texto(body?.share_url, 3500);
    const shareUrl =
      shareUrlBruto && /^https?:\/\//.test(shareUrlBruto) ? shareUrlBruto : null;

    if (!firebaseConfigurado()) {
      return NextResponse.json(
        { error: "server_not_configured" },
        { status: 500 }
      );
    }

    const db = getDb();
    const ref = db.collection("leads").doc(sha256(email));

    // Campos que se actualizan en cada envío (merge)
    const datos = {
      email,
      nombre: texto(body?.nombre, 80),
      whatsapp: texto(body?.whatsapp, 30),
      negocio: texto(body?.negocio, 40) ?? asistente?.marca ?? null,
      tipo,
      asistente,
      share_url: shareUrl,
      acepta_marketing: body?.acepta_marketing === true,
      fuente: texto(body?.fuente, 40),
      user_agent: texto(req.headers.get("user-agent"), 200),
      ip_hash: sha256(ip + (process.env.LICENCIA_SECRET ?? "")),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Dedupe por correo: si existe → merge + submissions++; si no → crear.
    const duplicate = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (doc.exists) {
        tx.set(
          ref,
          { ...datos, submissions: FieldValue.increment(1) },
          { merge: true }
        );
        return true;
      }
      tx.set(ref, {
        ...datos,
        submissions: 1,
        createdAt: FieldValue.serverTimestamp(),
      });
      return false;
    });

    // Disparar la automatización de n8n (Silvi Lead Engine). En serverless hay
    // que usar await: una promesa sin await se cancela al terminar la función.
    // El try/catch garantiza que un fallo del webhook NO afecte el guardado.
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: datos.email,
            nombre: datos.nombre,
            whatsapp: datos.whatsapp,
            negocio: datos.negocio,
            tipo: datos.tipo,
            asistente: datos.asistente,
            fuente: datos.fuente,
            share_url: datos.share_url,
            duplicate,
          }),
        });
      } catch (err) {
        console.error("No se pudo disparar n8n:", err); // no bloquea la respuesta
      }
    }

    // Disparo de correo (no bloqueante): escribimos el mensaje ya compuesto en
    // la colección `mail`. La extensión "Trigger Email from Firestore" lo envía
    // por SMTP. Si la extensión no está instalada aún, el doc queda pendiente
    // sin romper nada. Solo se envía si la persona dio un correo y un link.
    if (shareUrl) {
      try {
        const origen = req.nextUrl?.origin || "https://silvi-assistants.vercel.app";
        const { subject, html, text: cuerpo } = construirCorreoLead({
          nombre: datos.nombre,
          tipo,
          asistente: asistente?.asistente || "tu asistente",
          marca: datos.negocio || asistente?.marca || "tu marca",
          color: asistente?.color || "#0047AB",
          shareUrl,
          widgetSnippet: snippetDesdeShareUrl(
            shareUrl,
            origen,
            asistente?.asistente || "tu asistente",
            asistente?.color || "#0047AB",
            tipo
          ),
        });
        await db.collection("mail").add({
          to: email,
          message: { subject, html, text: cuerpo },
          lead_tipo: tipo,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (e) {
        console.warn("No se pudo encolar el correo del lead:", e);
      }
    }

    return NextResponse.json({ ok: true, duplicate });
  } catch (err) {
    console.error("Error en /api/lead:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
