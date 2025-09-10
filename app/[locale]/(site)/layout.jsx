// app/[locale]/(site)/layout.jsx (Server)
import SiteShell from './SiteShell';
export default function SiteLayout({ children }) {
  return (<SiteShell>
    {children}
    </SiteShell>);
}
