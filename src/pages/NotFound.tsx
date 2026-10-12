import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageContainer } from '@/components/PageHeader';
import { Art } from '@/components/reel';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Seo
        title="Page not found — Reel"
        description="This page doesn't exist or has moved. Head back to Discover to keep finding movies and TV shows."
        path={location.pathname}
        noindex
      />
      <PageContainer className="flex flex-1 items-center justify-center py-16">
        <div className="flex max-w-md flex-col items-center text-center">
          <Art name="search" className="mb-6" />
          <p className="label-mono">Error 404</p>
          <h1 className="mt-2 text-display-sm text-balance">We couldn't find that page</h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            The link may be old, or the page may have moved. Try Discover, or search for the title you were after.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link to="/">Back to Discover</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">Search titles</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default NotFound;
