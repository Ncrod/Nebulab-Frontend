import type { Metadata } from "next";
import { LoginScreen } from "../components/login/LoginScreen";

export const metadata: Metadata = {
  title: "Iniciar sesión | Nebulab",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <LoginScreen initialMode={mode === "signup" ? "signup" : "login"} />;
}
