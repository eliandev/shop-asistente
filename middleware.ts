import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Solo rutas del SaaS: la v2 (/, /crear, /chat, /criterio) NO pasa por aquí.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/auth/:path*"],
};
