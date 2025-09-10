// app/components/ui/ShareButtons.jsx
import { useCallback, useMemo, useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";

const SOCIALS = [
  {
    id: "x",
    label: "X",
    build: ({ url, title }) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    build: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    build: ({ url, title }) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    build: ({ url }) => `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    build: ({ url, title }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "email",
    label: "Email",
    build: ({ url, title }) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

function getOrigin() {
  // côté client uniquement
  if (typeof window !== "undefined" && window.location) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

/**
 * Props:
 * - title: string (ex: event.title)
 * - description?: string (optionnel)
 * - slug: string   (ex: "festival-2025")
 * - locale: string (ex: "fr")
 * - basePath?: string (ex: "/events" si tu préfixes les events)
 * - utm?: object   (ex: { source: 'share', medium: 'social' })
 */
export default function ShareButtons({
  title,
  description,
  slug,
  locale = "fr",
  basePath = "",
  utm = { source: "share", medium: "social" },
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  // Construit l’URL canonique de l’event
  const url = useMemo(() => {
    const origin = getOrigin();
    const path = `/${locale}${basePath ? `/${basePath.replace(/^\/|\/$/g, "")}` : ""}/${slug}`;
    const usp = new URLSearchParams();
    Object.entries(utm || {}).forEach(([k, v]) => usp.append(`utm_${k}`, String(v)));
    return origin ? `${origin}${path}?${usp.toString()}` : path;
  }, [slug, locale, basePath, utm]);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const onNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: title,
        text: description || title,
        url,
      });
    } catch (e) {
      // fermé sans partager → pas d’erreur visible
    }
  }, [title, description, url]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // vieux navigateurs : fallback prompt
      window.prompt("Copier l’URL :", url);
    }
  }, [url]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Bouton principal */}
      {canNativeShare ? (
        <button
          type="button"
          onClick={onNativeShare}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm
                     bg-MIAMgreen/90 text-white hover:bg-MIAMgreen transition shadow-sm"
        >
          <Share2 size={16} />
          Partager
        </button>
      ) : (
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm
                     bg-MIAMgreen/90 text-white hover:bg-MIAMgreen transition shadow-sm"
        >
          {copied ? <Check size={16} /> : <LinkIcon size={16} />}
          {copied ? "Lien copié" : "Copier le lien"}
        </button>
      )}

      {/* Liens sociaux */}
      <div className="flex items-center gap-1">
        {SOCIALS.map((s) => (
          <a
            key={s.id}
            href={s.build({ url, title })}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2 py-1 text-xs text-MIAMgreytext hover:bg-black/5 transition"
            aria-label={`Partager sur ${s.label}`}
            title={`Partager sur ${s.label}`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
