import { DEFAULT_DESCRIPTION, SITE_NAME } from "@shared/seo";
import { Helmet } from "react-helmet-async";

type Props = {
  siteUrl: string;
};

/**
 * JSON-LD for Organization + WebSite (helps rich results; render on the home page only).
 */
export function JsonLdOrganization({ siteUrl }: Props) {
  const base = siteUrl.replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
