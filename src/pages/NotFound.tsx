import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Seo
        title="Page Not Found — Watchlist"
        description="This page doesn't exist or has moved. Head back to Watchlist to keep discovering movies and TV shows to watch."
        path={location.pathname}
        noindex
      />
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-mono text-muted-foreground mb-2">404</p>
          <h1 className="mb-3 text-2xl font-semibold">Page not found</h1>
          <p className="mb-6 text-muted-foreground">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/">Back to Discover</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
