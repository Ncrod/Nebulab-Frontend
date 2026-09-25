import type { Metadata } from "next";
import BagPage from "../components/BagPage";

export const metadata: Metadata = {
  title: "Bag | Nebulab",
};

// Signed-in only. There is no auth yet, so for now anyone can open it; once there is, a signed-out visit will redirect to /login.
export default function Bag() {
  return <BagPage />;
}
