// app/layout.jsx  (root)
import "./globals.css";
import { haas } from "./fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={haas.variable}>
      <body className="antialiased bg-MIAMwhite">{children}</body>
    </html>
  );
}
