import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="min-h-screen flex flex-col pb-16 lg:pb-0 lg:ml-64 min-w-0 overflow-x-hidden">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
