import localFont from "next/font/local";

export const sfProDisplay = localFont({
  variable: "--font-sf-pro-display",
  display: "swap",
  src: [
    { path: "./sf-pro-display/thinitalic.otf", weight: "100", style: "italic" },
    { path: "./sf-pro-display/ultralightitalic.otf", weight: "200", style: "italic" },
    { path: "./sf-pro-display/lightitalic.otf", weight: "300", style: "italic" },
    { path: "./sf-pro-display/regular.otf", weight: "400", style: "normal" },
    { path: "./sf-pro-display/medium.otf", weight: "500", style: "normal" },
    { path: "./sf-pro-display/semibolditalic.otf", weight: "600", style: "italic" },
    { path: "./sf-pro-display/bold.otf", weight: "700", style: "normal" },
    { path: "./sf-pro-display/heavyitalic.otf", weight: "800", style: "italic" },
    { path: "./sf-pro-display/blackitalic.otf", weight: "900", style: "italic" },
  ],
});

export const neueMontreal = localFont({
  variable: "--font-neue-montreal",
  display: "swap",
  src: [
    { path: "./neue-montreal/light.otf", weight: "300", style: "normal" },
    { path: "./neue-montreal/lightitalic.otf", weight: "300", style: "italic" },
    { path: "./neue-montreal/regular.otf", weight: "400", style: "normal" },
    { path: "./neue-montreal/italic.otf", weight: "400", style: "italic" },
    { path: "./neue-montreal/medium.otf", weight: "500", style: "normal" },
    { path: "./neue-montreal/mediumitalic.otf", weight: "500", style: "italic" },
    { path: "./neue-montreal/bold.otf", weight: "700", style: "normal" },
    { path: "./neue-montreal/bolditalic.otf", weight: "700", style: "italic" },
  ],
});
