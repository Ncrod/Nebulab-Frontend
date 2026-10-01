import type { Metadata } from "next";
import { LoginScreen } from "../components/login/LoginScreen";

export const metadata: Metadata = {
  title: "Reset your password | Nebulab",
};

/** The link emailed by "Forgot your password?" lands here: /reset-password?token=... */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <LoginScreen initialMode="reset" resetToken={token ?? null} />;
}
