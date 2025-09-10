// app/[locale]/layout.jsx (Server Component)
import { notFound } from 'next/navigation';
import { locales } from '../i18n';
import { getNavigation } from '../lib/strapi';
import SmoothScrolling from '../components/scroll/SmoothScrolling';
import ScrollToTopLenis from '../components/scroll/ScrollToTopLenis';
import IllustrationList from '../components/Illustrations/IllustrationList';
import { NavDataProvider } from '../providers/NavDataProvider';
import Footer from '../components/footer/Footer';
import Navigation from '../components/navigation/Navigation';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const nav = await getNavigation({ tree: 'navigation', locale, type: 'TREE' });

  return (
    <SmoothScrolling>
      <IllustrationList />
      <ScrollToTopLenis />
      <Navigation currentLocale={locale} nav={nav} />
      <NavDataProvider value={{ nav, locale }}>
        <div className="pt-40">{children}</div>
      </NavDataProvider>
      <Footer />
    </SmoothScrolling>
  );
}
