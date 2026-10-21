import type { Metadata } from "next";
import AboutPage from "../components/AboutPage";

export const metadata: Metadata = {
  title: "About us | Nebulab",
};

export default function About() {
  return <AboutPage />;
}
