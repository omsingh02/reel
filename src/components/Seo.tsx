import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://wat.lovable.app';

interface SeoProps {
  title: string;
  description: string;
  /** Route path, e.g. "/movies" — used for canonical and og:url. */
  path: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export function Seo({ title, description, path, jsonLd, noindex }: SeoProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
