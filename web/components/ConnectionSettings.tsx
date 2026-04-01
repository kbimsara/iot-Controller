"use client";

import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import type { ConnectionState } from "@/types";

interface Props {
  ip: string;
  connectionState: ConnectionState;
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
  onIpChange: (ip: string) => void;
}

export default function ConnectionSettings({
  ip,
  connectionState,
  onConnect,
  onDisconnect,
  onIpChange,
}: Props) {
  const [draft, setDraft] = useState(ip);
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  // Sync if parent IP changes (e.g., restored from localStorage)
  useEffect(() => {
    setDraft(ip);
  }, [ip]);

  const handleChange = (val: string) => {
    setDraft(val);
    onIpChange(val);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-5 space-y-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">ESP32-CAM</h2>
        <StatusBadge state={connectionState} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="192.168.1.x"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft && !isConnected) onConnect(draft);
          }}
          disabled={isConnected || isConnecting}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2
                     border border-gray-600 focus:border-blue-500 outline-none
                     placeholder-gray-500 text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {!isConnected ? (
          <button
            onClick={() => onConnect(draft)}
            disabled={!draft.trim() || isConnecting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500
                       disabled:bg-gray-600 disabled:cursor-not-allowed
                       text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isConnecting ? "Connecting…" : "Connect"}
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="px-5 py-2 bg-red-800 hover:bg-red-700
                       text-white rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {connectionState === "error" && (
        <p className="text-red-400 text-xs">
          Could not reach ESP32 at <span className="font-mono">{ip}</span>.
          Check the IP, ensure the board is powered, and that your browser
          allows mixed HTTP/HTTPS content for this page.
        </p>
      )}
    </div>
  );
}
