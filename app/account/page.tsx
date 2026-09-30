import type { Metadata } from "next";
import AccountPage from "../components/AccountPage";

export const metadata: Metadata = {
  title: "Account | Nebulab",
};

// Signed-in only: components/SessionGate sends a signed-out visit to /login.
export default function Account() {
  return <AccountPage />;
}
