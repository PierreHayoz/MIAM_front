// app/components/navigation/LanguageSwitcher.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/app/i18n";

export default function LanguageSwitcher({ currentLocale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [alts, setAlts] = useState(null);

  useEffect(() => {
    let ok = true;
    fetch(`/api/i18n/alternates?pathname=${encodeURIComponent(pathname || "/")}`)
      .then(r => r.json())
      .then(d => { if (ok) setAlts(d?.alternates || {}); })
      .catch(() => { if (ok) setAlts({}); });
    return () => { ok = false; };
  }, [pathname]);

  const items = useMemo(
    () => locales.map(l => ({ code: l, active: l === currentLocale })),
    [currentLocale]
  );

  const go = (l) => {
    const target = alts?.[l] || `/${l}${pathname.replace(/^\/[a-zA-Z-]+/, "")}`;
    router.push(target);
  };

  return (
    <div className="flex gap-2">
      {items.map(({ code, active }) => (
        <button
          key={code}
          onClick={() => go(code)}
          className={`px-2 py-1 rounded ${active ? "bg-black text-white" : "border"}`}
          aria-current={active ? "true" : "false"}
          aria-label={`Changer la langue en ${code.toUpperCase()}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
