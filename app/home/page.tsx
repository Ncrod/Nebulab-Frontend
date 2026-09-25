import type { Metadata } from "next";
import LandingPage from "../components/LandingPage";

export const metadata: Metadata = {
  title: "Nebulab",
};

// Signed-in home. Temporary preview route: once auth exists, "/" will render this variant by session.
export default function SignedInHome() {
  return <LandingPage loggedIn />;
}
