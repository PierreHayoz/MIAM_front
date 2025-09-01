// app/components/navigation/Navigation.jsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { X } from "lucide-react";
import Image from "next/image";

function NavItemDesktop({ item }) {
  const { title, href, external, children } = item;
  return (
    <li className="relative group">
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="px-3 py-2 hover:underline"
      >
        {title}
        {children?.length ? " ▾" : ""}
      </Link>

      {children?.length ? (
        <ul className="absolute hidden group-hover:block bg-white shadow rounded mt-1 min-w-40 p-1 z-50">
          {children.map((c) => (
            <NavItemDesktop key={c.id} item={c} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function MobileNavItem({ item, openIds, toggle, onNavigate }) {
  const { title, href, external, children, id } = item;
  const hasChildren = !!children?.length;
  const isOpen = openIds.has(id);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block px-3 py-2 rounded hover:bg-black/5"
          onClick={onNavigate}
        >
          {title}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-black/5"
        aria-expanded={isOpen}
        aria-controls={`submenu-${id}`}
        onClick={() => toggle(id)}
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.25 7.5l4.5 4.5 4.5-4.5" />
        </svg>
      </button>
      <ul
        id={`submenu-${id}`}
        className={`${isOpen ? "block" : "hidden"} ml-2 border-l pl-2 my-1 space-y-1`}
      >
        {children.map((c) => (
          <MobileNavItem
            key={c.id}
            item={c}
            openIds={openIds}
            toggle={toggle}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </li>
  );
}

export default function Navigation({ currentLocale, nav = [], alternatesFromServer }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIds, setOpenIds] = useState(new Set());

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const closeMenu = () => setMenuOpen(false);

  // ESC pour fermer + lock du scroll quand le menu est ouvert
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    if (menuOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="fixed z-50 md:backdrop-blur-3xl bg-MIAMwhite/2 top-0 left-0 right-0 md:border-b">
      <div className=" mx-auto flex items-center justify-between p-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between w-full">
          <Image src="/logo/MIAM.svg" width={100} height={200}/>
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <NavItemDesktop key={item.id} item={item} />
            ))}
          </ul>
          <LanguageSwitcher
            currentLocale={currentLocale}
            alternatesFromServer={alternatesFromServer}
          />
        </div>

        {/* Mobile header: bouton burger + (optionnel) switcher si tu le veux ici */}
        <div className="flex bg-MIAMwhite/20 backdrop-blur-3xl md:hidden items-center justify-between w-full">
<Image src="/logo/MIAM.svg" width={100} height={200}/>
          
          <button
            type="button"
            className="inline-flex items-center justify-center rounded p-2 hover:bg-black/5"
            aria-label="Ouvrir le menu"
            aria-controls="mobile-drawer"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            {/* Icône burger */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Si tu veux le switcher visible aussi en header mobile, dé-commente : */}
          {/* <LanguageSwitcher currentLocale={currentLocale} alternatesFromServer={alternatesFromServer} /> */}
        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="md:hidden" id="mobile-drawer">
          {/* Overlay */}
          <button
            aria-label="Fermer le menu"
            className="fixed inset-0 bg-black/40"
            onClick={closeMenu}
          />
          {/* Panneau */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-MIAMwhite shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Menu</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded p-2 hover:bg-black/5"
                aria-label="Fermer le menu"
                onClick={closeMenu}
              >
                {/* Icône close */}
                <X size={24} strokeWidth={1.4}/>
              </button>
            </div>

            <ul className="space-y-1">
              {nav.map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  openIds={openIds}
                  toggle={toggle}
                  onNavigate={closeMenu}
                />
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t">
              <LanguageSwitcher
                currentLocale={currentLocale}
                alternatesFromServer={alternatesFromServer}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
