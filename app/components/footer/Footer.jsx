// app/components/footer/Footer.jsx
import Image from 'next/image';
import Link from 'next/link';
import Newsletter from '../newsletter/Newsletter';
import { getGlobal } from '@/app/lib/strapi';

// --- i18n ultra-light (garde ton style)
const UI = {
  fr: {
    contact: "Contact",
    socials: "Réseaux sociaux",
    legal: "Impressum",
    logoAlt: "Logo de l'appli",
    link: "/fr/impressum",
  },
  en: {
    contact: "Contact",
    socials: "Social media",
    legal: "Imprint",
    logoAlt: "App logo",
    link: "/en/imprint",
  },
  de: {
    contact: "Kontakt",
    socials: "Soziale Medien",
    legal: "Impressum",
    logoAlt: "App-Logo",
    link: "/de/impressum",
  },
};
const baseLang = (l) => String(l || "fr").toLowerCase().split("-")[0];
const t = (l, k) => UI[baseLang(l)]?.[k] ?? UI.en[k] ?? k;

export default async function Footer({ locale }) {
  const global = await getGlobal({ locale }); // ✅
  const c = global?.contact || null;

  const socials = Array.isArray(global?.socials)
    ? global.socials
        .map(s => ({ label: s?.label || s?.labe || '', url: s?.url || '#' }))
        .filter(s => s.label && s.url)
    : [];

  const AddressBlock = () => {
    const content = (
      <address className="not-italic whitespace-pre-line text-MIAMgreytext">
        {c?.name && <div>{c.name}</div>}
        {c?.address && <div>{c.address}</div>}
        {(c?.postalCode || c?.city) && (
          <div>{[c?.postalCode, c?.city].filter(Boolean).join(' ')}</div>
        )}
        {c?.country && <div>{c.country}</div>}
      </address>
    );

    if (c?.mapUrl) {
      return (
        <Link href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {content}
        </Link>
      );
    }
    return content;
  };

  return (
    <div className="pt-40 w-full md:grid grid-cols-4 px-4 flex flex-col md:gap-0 gap-4">
      <div className="col-span-4 md:col-span-1">
        <Newsletter locale={locale} />
      </div>

      <div className="col-start-3">
        <ul>
          <li className="font-semibold">{t(locale, "contact")}</li>
          <li className="text-MIAMgreytext">
            <AddressBlock />
          </li>

          {(c?.email || c?.phone) && (
            <li className="mt-2 flex flex-col gap-1 text-MIAMgreytext">
              {c?.email && (
                <Link href={`mailto:${c.email}`} className="hover:underline">
                  {c.email}
                </Link>
              )}
              {c?.phone && (
                <Link href={`tel:${c.phone}`} className="hover:underline">
                  {c.phone}
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>

      <div>
        <ul>
          <li className="font-semibold">{t(locale, "socials")}</li>
          {socials.length > 0 ? (
            socials.map((s, i) => (
              <li key={`${s.label}-${i}`} className="text-MIAMgreytext">
                <Link href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {s.label}
                </Link>
              </li>
            ))
          ) : (
            <>
              <li className="text-MIAMgreytext">Instagram</li>
              <li className="text-MIAMgreytext">Facebook</li>
              <li className="text-MIAMgreytext">YouTube</li>
            </>
          )}
        </ul>
      </div>

      <Image
        className="col-span-4 pt-16"
        src="/logo/MIAM.svg"
        alt={t(locale, "logoAlt")}
        width={1920}
        height={24}
        priority
      />

      {/* Bloc Impressum cliquable et localisé */}
      <Link
        href={t(locale, "link")}
        className="col-span-4 impressum block hover:underline text-end py-2"
      >
        {t(locale, "legal")}
      </Link>
    </div>
  );
}
