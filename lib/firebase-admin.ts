/**
 * ============================================================================
 *  FIREBASE ADMIN — Firestore para captura de leads (solo servidor)
 * ============================================================================
 *  Singleton del Admin SDK. Las credenciales viven ÚNICAMENTE en variables de
 *  entorno (local .env.local / Vercel) y jamás llegan al bundle del cliente:
 *    - FIREBASE_PROJECT_ID
 *    - FIREBASE_CLIENT_EMAIL
 *    - FIREBASE_PRIVATE_KEY   (una línea, saltos como \n escapados)
 *
 *  Las reglas de Firestore (firestore.rules) niegan todo acceso de clientes;
 *  el Admin SDK las ignora por diseño, así que SOLO el servidor escribe.
 *
 *  Transporte REST (`preferRest`): en serverless (Vercel) las conexiones gRPC
 *  con keepalive se cuelgan/tardan decenas de segundos en el arranque en frío.
 *  Forzar REST evita ese hang. Firestore.settings() debe llamarse UNA sola vez
 *  antes de la primera operación, por eso cacheamos la instancia.
 * ============================================================================
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let dbCache: Firestore | null = null;

/** ¿Están las credenciales de Firebase configuradas? */
export function firebaseConfigurado(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

/** Firestore listo para usar (inicializa app + settings una sola vez). */
export function getDb(): Firestore {
  if (dbCache) return dbCache;
  if (!firebaseConfigurado()) {
    throw new Error("Firebase no está configurado (faltan variables FIREBASE_*).");
  }
  // ¿El app ya existía? (en dev con hot-reload el app persiste aunque este
  // módulo se recargue, y settings() ya se habría aplicado sobre su Firestore).
  const recienCreado = getApps().length === 0;
  if (recienCreado) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel/dotenv guardan la key en una línea con \n literales
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = getFirestore();
  // REST en vez de gRPC: evita el cuelgue de conexión en serverless/dev.
  // settings() solo se puede llamar una vez y antes de cualquier operación:
  // por eso solo al crear el app, y con guarda por si ya se aplicó.
  if (recienCreado) {
    try {
      db.settings({ preferRest: true });
    } catch {
      /* ya inicializado en otra instancia del módulo: usar tal cual */
    }
  }
  dbCache = db;
  return db;
}
