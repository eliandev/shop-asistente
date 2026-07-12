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
 * ============================================================================
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** ¿Están las credenciales de Firebase configuradas? */
export function firebaseConfigurado(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

/** Firestore listo para usar (inicializa el app una sola vez). */
export function getDb(): Firestore {
  if (!firebaseConfigurado()) {
    throw new Error("Firebase no está configurado (faltan variables FIREBASE_*).");
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel/dotenv guardan la key en una línea con \n literales
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}
