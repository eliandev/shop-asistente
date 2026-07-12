import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { firebaseConfigurado, getDb } from "@/lib/firebase-admin";

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

    return NextResponse.json({ ok: true, duplicate });
  } catch (err) {
    console.error("Error en /api/lead:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
