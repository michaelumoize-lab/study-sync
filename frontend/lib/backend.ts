/**
 * Internal Backend Service Client
 *
 * Communicates with the Python FastAPI backend service via Vercel service bindings.
 * In Vercel deployments and `vercel dev`, Vercel injects the internal target URL
 * into `process.env.BACKEND_URL`.
 *
 * Note: Service bindings resolve at runtime in server-side functions only
 * (Server Components, Server Actions, Route Handlers), not during builds or in middleware.
 */

function getBackendBaseUrl(): string {
  const configuredUrl = process.env.BACKEND_URL || process.env.INTERNAL_BACKEND_URL;
  if (!configuredUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "BACKEND_URL or INTERNAL_BACKEND_URL must be configured in production."
      );
    }
    return "http://localhost:8000/";
  }
  return configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`;
}

/**
 * Perform a server-side fetch to the internal backend service using the bound URL.
 */
export async function fetchBackend(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const targetUrl = new URL(cleanPath, getBackendBaseUrl());

  const headers = new Headers(init?.headers);

  // Attach internal service secret if configured
  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (internalSecret && !headers.has("X-Internal-Secret")) {
    headers.set("X-Internal-Secret", internalSecret);
  }

  return fetch(targetUrl, {
    ...init,
    headers,
  });
}

/**
 * Resolve an absolute URL for a backend endpoint given the bound base URL.
 */
export function getBackendEndpoint(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(cleanPath, getBackendBaseUrl()).toString();
}
