import { notFound } from "next/navigation";
import { locales } from "../i18n";
import Navigation from "../components/navigation/Navigation";
import { getNavigation } from "../lib/strapi";
import { getSiteSettings } from "../lib/strapi";
import Footer from "../components/footer/Footer";
import SmoothScrolling from "../components/scroll/SmoothScrolling";
import ScrollToTopLenis from "../components/scroll/ScrollToTopLenis";
import IllustrationList from "../components/Illustrations/IllustrationList";
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const globals = await getSiteSettings({ locale });
  if (!locales.includes(locale)) notFound();

  // "main" = slug/nom de ton container dans Strapi (adapte si nécessaire)
  const nav = await getNavigation({ tree: "navigation", locale, type: "TREE" });

  return (
    <>
    <SmoothScrolling>
      <IllustrationList/>
      <ScrollToTopLenis/>
      <Navigation currentLocale={locale} nav={nav} />
      <div className="pt-40">{children}</div>
      <Footer globals={globals} locale={locale}/>
      </SmoothScrolling>
    </>
  );
}
