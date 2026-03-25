import { JsonLdOrganization } from "@/components/seo/JsonLdOrganization";
import { DEFAULT_OG_IMAGE, getSeoMeta, SITE_NAME } from "@shared/seo";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

function getCanonicalSiteUrl(): string {
  const env = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/**
 * Per-route title, description, Open Graph, Twitter, robots, and canonical URL.
 * Google executes JS; this keeps head tags aligned with each client route.
 */
export function RouteSeo() {
  const [pathname] = useLocation();
  const meta = getSeoMeta(pathname);
  const siteUrl = getCanonicalSiteUrl();
  const path = pathname.split("?")[0] || "/";
  const canonical =
    siteUrl === "" ? "" : `${siteUrl}${path === "/" ? "/" : path}`;

  const robots = meta.indexable ? "index, follow" : "noindex, nofollow";

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={robots} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}

        <meta property="og:type" content={meta.ogType} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      {path === "/" && siteUrl ? <JsonLdOrganization siteUrl={siteUrl} /> : null}
    </>
  );
}
