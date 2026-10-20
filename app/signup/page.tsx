import type { Metadata } from "next";
import FormAuth from "@/components/FormAuth";

export const metadata: Metadata = {
  title: { absolute: "Crear cuenta · Silvi Assistants" },
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <FormAuth modo="signup" />;
}
