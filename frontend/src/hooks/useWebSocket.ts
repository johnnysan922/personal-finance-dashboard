import { useCallback, useEffect, useRef, useState } from "react";
import { getWsBase } from "../lib/api";

export type WebSocketStatus = "connecting" | "open" | "closed" | "error";

type Options = {
  path?: string;
  onMessage?: (data: unknown) => void;
};

const DEFAULT_PATH = "/ws/prices";

export function useWebSocket(options: Options = {}) {
  const { path = DEFAULT_PATH, onMessage } = options;
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const [status, setStatus] = useState<WebSocketStatus>("closed");

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const base = getWsBase();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      setStatus("open");
    };

    ws.onclose = () => {
      setStatus("closed");
      const delay = Math.min(30_000, 1000 * 2 ** attemptRef.current);
      attemptRef.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data as string) as unknown;
        onMessageRef.current?.(parsed);
      } catch {
        onMessageRef.current?.(ev.data);
      }
    };
  }, [path]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { status };
}
