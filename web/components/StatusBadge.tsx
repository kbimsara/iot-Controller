import type { ConnectionState } from "@/types";

const CONFIG: Record<
  ConnectionState,
  { label: string; className: string }
> = {
  disconnected: {
    label: "Disconnected",
    className: "bg-gray-700 text-gray-400",
  },
  connecting: {
    label: "Connecting…",
    className: "bg-yellow-900 text-yellow-300 animate-pulse",
  },
  connected: {
    label: "Connected",
    className: "bg-green-900 text-green-300",
  },
  error: {
    label: "Error",
    className: "bg-red-900 text-red-400",
  },
};

export default function StatusBadge({ state }: { state: ConnectionState }) {
  const { label, className } = CONFIG[state];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
