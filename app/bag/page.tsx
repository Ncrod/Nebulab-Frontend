import type { Metadata } from "next";
import BagPage from "../components/BagPage";

export const metadata: Metadata = {
  title: "Bag | Nebulab",
};

// Signed-in only: components/SessionGate sends a signed-out visit to /login.
export default function Bag() {
  return <BagPage />;
}
