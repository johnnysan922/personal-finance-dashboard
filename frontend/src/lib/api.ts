const trimSlash = (s: string) => s.replace(/\/+$/, "");

/** Base URL for REST (no trailing slash). In dev, Vite proxies `/api` to the backend. */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE;
  if (fromEnv) return trimSlash(fromEnv);
  if (typeof window !== "undefined") return "";
  return "http://127.0.0.1:8000";
}

/** WebSocket base, e.g. `ws://127.0.0.1:8000` or empty to use same host as page. */
export function getWsBase(): string {
  const fromEnv = import.meta.env.VITE_WS_BASE;
  if (fromEnv) return trimSlash(fromEnv);
  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    const wsProto = protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${host}`;
  }
  return "ws://127.0.0.1:8000";
}
