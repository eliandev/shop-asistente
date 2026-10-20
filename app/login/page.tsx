import type { Metadata } from "next";
import FormAuth from "@/components/FormAuth";

export const metadata: Metadata = {
  title: { absolute: "Entrar · Silvi Assistants" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <FormAuth modo="login" />;
}
