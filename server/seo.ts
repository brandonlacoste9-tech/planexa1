import { getSitemapPaths } from "../shared/seo";

function getPublicSiteUrl(): string {
  const raw =
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VITE_PUBLIC_SITE_URL?.trim() ||
    "";
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildRobotsTxt(): string {
  const base = getPublicSiteUrl();
  const sitemapUrl = `${base}/sitemap.xml`;
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");
}

export function buildSitemapXml(): string {
  const base = getPublicSiteUrl();
  const lastmod = new Date().toISOString().split("T")[0]!;
  const paths = getSitemapPaths();

  const urls = paths
    .map(path => {
      const loc = `${base}${path === "/" ? "/" : path}`;
      const priority =
        path === "/" ? "1.0" : path.startsWith("/book/") ? "0.9" : "0.8";
      const changefreq = path === "/" ? "weekly" : "monthly";
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
