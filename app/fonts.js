import localFont from "next/font/local";

export const haas = localFont({
  src: "./fonts/HaasGrotDisp-65Medium.otf",
  variable: "--font-haas",
  weight: "400", // ou "500"/"600" si tu veux le mapper à un autre niveau
  style: "normal",
});
