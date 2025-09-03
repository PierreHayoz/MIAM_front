// app/components/footer/Footer.jsx
import Image from 'next/image';
import Link from 'next/link';
import Newsletter from '../newsletter/Newsletter';
import { getGlobal } from '@/app/lib/strapi';

export default async function Footer() {
  const global = await getGlobal({ locale: 'fr' }); // ajuste si tu gères i18n autrement
  const c = global?.contact || null;
  const socials = Array.isArray(global?.socialLinks)
    ? global.socialLinks.map(s => ({
        label: s?.label || s?.labe || '', // fallback si le champ s'appelle encore "labe"
        url: s?.url || '#',
      })).filter(s => s.label && s.url)
    : [];

  const AddressBlock = () => {
    const addressLines = [
      c?.address,
      [c?.postalCode, c?.city].filter(Boolean).join(' '),
      c?.country,
    ].filter(Boolean);

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
        <Link
          href={c.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {content}
        </Link>
      );
    }
    return content;
  };

  return (
    <div className="pt-40 w-full md:grid grid-cols-4 p-4 flex flex-col md:gap-0 gap-4">
      <div className="col-span-4 md:col-span-1">
        <Newsletter />
      </div>

      <div className="col-start-3">
        <ul>
          <li className="font-semibold">Contact</li>
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
          <li className="font-semibold">Réseaux sociaux</li>
          {socials.length > 0 ? (
            socials.map((s, i) => (
              <li key={`${s.label}-${i}`} className="text-MIAMgreytext">
                <Link
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {s.label}
                </Link>
              </li>
            ))
          ) : (
            <>
              <li className="text-MIAMgreytext">Instagram</li>
              <li className="text-MIAMgreytext">Facebook</li>
              <li className="text-MIAMgreytext">Youtube</li>
            </>
          )}
        </ul>
      </div>

      <Image
        className="col-span-5 pt-16"
        src="/logo/MIAM.svg"
        alt="Logo de l'appli"
        width={1920}
        height={24}
        priority
      />
    </div>
  );
}
