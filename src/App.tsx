import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, type Location } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LegacyDeepLinkRedirect } from "@/components/LegacyDeepLinkRedirect";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { startQueryPersistence } from "@/lib/queryPersist";

const Index = lazy(() => import("./pages/Index"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Upcoming = lazy(() => import("./pages/Upcoming"));
const Stats = lazy(() => import("./pages/Stats"));
const Auth = lazy(() => import("./pages/Auth"));
const SearchPage = lazy(() => import("./pages/Search"));
const TitleRoute = lazy(() => import("./pages/Title"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

startQueryPersistence(queryClient);

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;
  const background = state?.background;

  return (
    <>
      <LegacyDeepLinkRedirect />
      <Routes location={background ?? location}>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/shows" element={<TVShows />} />
        <Route path="/tv" element={<Navigate to="/shows" replace />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/movie/:id" element={<TitleRoute mediaType="movie" />} />
        <Route path="/show/:id" element={<TitleRoute mediaType="tv" />} />
        <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/movie/:id" element={<TitleRoute overlay mediaType="movie" />} />
          <Route path="/show/:id" element={<TitleRoute overlay mediaType="tv" />} />
        </Routes>
      )}
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
