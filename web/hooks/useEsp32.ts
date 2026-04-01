"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchStatus, setLight } from "@/lib/esp32Api";
import type { ConnectionState } from "@/types";

const LS_KEY = "esp32_ip";

export function useEsp32() {
  const [ip, setIp] = useState<string>("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [lightOn, setLightOn] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore saved IP on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setIp(saved);
  }, []);

  const saveIp = useCallback((newIp: string) => {
    setIp(newIp);
    localStorage.setItem(LS_KEY, newIp);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const connect = useCallback(
    async (targetIp: string) => {
      stopPolling();
      setConnectionState("connecting");
      try {
        const status = await fetchStatus(targetIp);
        setLightOn(status.light === "on");
        setConnectionState("connected");

        // Poll status every 5 s
        pollRef.current = setInterval(async () => {
          try {
            const s = await fetchStatus(targetIp);
            setLightOn(s.light === "on");
          } catch {
            setConnectionState("error");
            stopPolling();
          }
        }, 5000);
      } catch {
        setConnectionState("error");
      }
    },
    [stopPolling]
  );

  const disconnect = useCallback(() => {
    stopPolling();
    setConnectionState("disconnected");
  }, [stopPolling]);

  const toggleLight = useCallback(async () => {
    if (!ip || connectionState !== "connected") return;
    const next = !lightOn;
    try {
      await setLight(ip, next);
      setLightOn(next);
    } catch {
      setConnectionState("error");
      stopPolling();
    }
  }, [ip, lightOn, connectionState, stopPolling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return {
    ip,
    saveIp,
    connectionState,
    lightOn,
    connect,
    disconnect,
    toggleLight,
    streamUrl:
      connectionState === "connected" ? `http://${ip}/stream` : null,
  };
}
