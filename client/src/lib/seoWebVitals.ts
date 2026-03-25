import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

function sendToEndpoint(metric: Metric, endpoint: string) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
  } else {
    void fetch(endpoint, { method: "POST", body, keepalive: true });
  }
}

/**
 * Report Core Web Vitals for SEO/performance monitoring. Set
 * VITE_SEO_WEB_VITALS_ENDPOINT to POST JSON to your analytics backend.
 * Set VITE_SEO_DEBUG=1 to log metrics in the console (any environment).
 */
export function initSeoWebVitals() {
  const endpoint = import.meta.env.VITE_SEO_WEB_VITALS_ENDPOINT?.trim();
  const debug = import.meta.env.VITE_SEO_DEBUG === "1";

  const handle = (metric: Metric) => {
    if (debug) {
      console.info(`[SEO/Web Vitals] ${metric.name}`, metric.value, metric.rating);
    }
    if (endpoint) {
      sendToEndpoint(metric, endpoint);
    }
  };

  onCLS(handle);
  onINP(handle);
  onLCP(handle);
  onFCP(handle);
  onTTFB(handle);
}
