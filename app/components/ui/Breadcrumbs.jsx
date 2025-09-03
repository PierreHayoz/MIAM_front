// app/components/ui/BreadcrumbsServer.jsx
import Link from "next/link";

function buildAncestors(page) {
  const chain = [];
  let node = page?.parent || null;
  while (node) {
    chain.unshift(node); // du plus haut vers le plus proche parent
    node = node.parent || null;
  }
  return chain;
}

export default function BreadcrumbsServer({ page, locale }) {
  const ancestors = buildAncestors(page);
  const items = [...ancestors, page];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href={`/${locale}`} className="hover:underline">
            Accueil
          </Link>
          {items.length > 0 && <span className="mx-1">/</span>}
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const href = `/${locale}/${item.slug}`;
          return (
            <li key={item.id} className="flex items-center">
              {isLast ? (
                <span className="font-medium text-gray-900">{item.pageTitle || item.slug}</span>
              ) : (
                <>
                  <Link href={href} className="hover:underline">
                    {item.pageTitle || item.slug}
                  </Link>
                  <span className="mx-1">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
