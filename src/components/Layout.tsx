import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
