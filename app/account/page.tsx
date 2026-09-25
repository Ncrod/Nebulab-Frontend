import type { Metadata } from "next";
import AccountPage from "../components/AccountPage";

export const metadata: Metadata = {
  title: "Account | Nebulab",
};

// Signed-in only. There is no auth yet, so for now anyone can open it; once there is, a signed-out visit will redirect to /login.
export default function Account() {
  return <AccountPage />;
}
