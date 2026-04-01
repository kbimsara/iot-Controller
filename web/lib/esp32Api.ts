import type { Esp32Status } from "@/types";

export const buildBaseUrl = (ip: string) => `http://${ip}`;

export async function fetchStatus(ip: string): Promise<Esp32Status> {
  const res = await fetch(`${buildBaseUrl(ip)}/status`, {
    signal: AbortSignal.timeout(3000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`/status returned ${res.status}`);
  return res.json() as Promise<Esp32Status>;
}

export async function setLight(ip: string, on: boolean): Promise<void> {
  const endpoint = on ? "/light/on" : "/light/off";
  const res = await fetch(`${buildBaseUrl(ip)}${endpoint}`, {
    signal: AbortSignal.timeout(3000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Light command failed: ${res.status}`);
}
