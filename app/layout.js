// app/layout.jsx  (root)
import "./globals.css";
import { haas } from "./fonts";

export const metadata = {
  title: {
    default: "MIAM",
    template: "%s | MIAM - Machine interactive et artistique en mouvemement",
  },
  description: "Description de mon site",
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
