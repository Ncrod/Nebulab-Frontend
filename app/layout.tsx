import type { Metadata } from "next";
import { sfProDisplay, neueMontreal } from "./fonts";
import { Agentation } from "agentation";
import SideNav from "./components/SideNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebulab",
  description: "Tienda de dispositivos Apple",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sfProDisplay.variable} ${neueMontreal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SideNav />
        {children}
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
