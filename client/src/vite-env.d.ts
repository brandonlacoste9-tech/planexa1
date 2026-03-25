/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_ANALYTICS_WEBSITE_ID?: string;
  /** POST URL for Core Web Vitals JSON (optional). */
  readonly VITE_SEO_WEB_VITALS_ENDPOINT?: string;
  /** Set to "1" to log LCP, INP, CLS, etc. to the console. */
  readonly VITE_SEO_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
