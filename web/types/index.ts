export interface Esp32Status {
  light: "on" | "off";
  uptime: number;
}

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
