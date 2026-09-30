import type { Metadata } from "next";
import LandingPage from "../components/LandingPage";

export const metadata: Metadata = {
  title: "Nebulab",
};

// Signed-in home. components/SessionGate sends a signed-out visit to /login, and a signed-in one on "/" here.
export default function SignedInHome() {
  return <LandingPage loggedIn />;
}
