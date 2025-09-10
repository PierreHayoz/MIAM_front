// app/[locale]/(site)/SiteShell.jsx (Client)
'use client';
import { useNavData } from '@/app/providers/NavDataProvider';

export default function SiteShell({ children }) {
  const { nav, locale } = useNavData();
  return (
    <>
      {children}
    </>
  );
}
