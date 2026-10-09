import { MobileTabBar } from './MobileTabBar';
import { OfflineBanner } from './OfflineBanner';
import { SiteFooter } from './SiteFooter';
import { TopNav } from './TopNav';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * The app frame: skip link, offline notice, top bar, page, footer, and the tab bar on phones.
 * Pages render their own content only: a <PageHeader> and sections inside a <PageContainer>.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a href="#main" className="skip-link">Skip to content</a>
      <OfflineBanner />
      <TopNav />
      <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] outline-none lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
