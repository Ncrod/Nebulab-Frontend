import type { Metadata } from "next";
import { LoginScreen } from "../components/login/LoginScreen";

export const metadata: Metadata = {
  title: "Admin | Nebulab",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginScreen variant="admin" />;
}
