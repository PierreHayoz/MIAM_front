// app/framer-provider.jsx
"use client";
import { LayoutGroup } from "framer-motion";

export default function FramerProvider({ children }) {
  // Pas d'AnimatePresence ici, pas de key sur pathname
  return <LayoutGroup id="app">{children}</LayoutGroup>;
}
