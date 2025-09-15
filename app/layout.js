// app/layout.jsx  (root)
import "./globals.css";
import { haas } from "./fonts";

export const metadata = {
  title: {
    default: "MIAM",
    template: "%s | MIAM - Machine interactive et artistique en mouvemement",
  },
  description: "L’association MIAM (Machine Immersive et Artistique en Mouvement) a pour mission de promouvoir la création et la diffusion de musiques immersives, de soutenir les technologies médiatiques innovantes et d’accompagner les artistes désireux d’inspirer un public diversifié.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={haas.variable}>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
