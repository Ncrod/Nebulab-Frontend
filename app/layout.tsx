import type { Metadata } from "next";
import { sfProDisplay, neueMontreal } from "./fonts";
import { Agentation } from "agentation";
import SessionGate from "./components/SessionGate";
import SideNav from "./components/SideNav";
import SmoothScroll from "./components/SmoothScroll";
import Toaster from "./components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebulab",
  description: "Tienda de dispositivos Apple",
  icons: {
    icon: { url: "/svg/favicon.svg", type: "image/svg+xml" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sfProDisplay.variable} ${neueMontreal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <SideNav />
          <SessionGate>{children}</SessionGate>
        </SmoothScroll>
        <Toaster />
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
