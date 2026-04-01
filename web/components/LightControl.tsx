"use client";

import type { ConnectionState } from "@/types";

interface Props {
  lightOn: boolean;
  connectionState: ConnectionState;
  onToggle: () => void;
}

export default function LightControl({
  lightOn,
  connectionState,
  onToggle,
}: Props) {
  const isConnected = connectionState === "connected";

  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h2 className="text-base font-semibold text-white mb-4">Flash Light</h2>

      <div className="flex items-center gap-5">
        {/* Glow indicator */}
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 transition-all duration-300
            ${
              lightOn
                ? "bg-yellow-300 shadow-[0_0_20px_6px_rgba(253,224,71,0.5)]"
                : "bg-gray-700 shadow-none"
            }`}
        />

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          disabled={!isConnected}
          aria-label={lightOn ? "Turn light off" : "Turn light on"}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
            ${
              isConnected
                ? lightOn
                  ? "bg-yellow-500 focus:ring-yellow-500"
                  : "bg-gray-600 focus:ring-gray-500"
                : "bg-gray-700 opacity-40 cursor-not-allowed"
            }`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow
              transition-transform duration-300
              ${lightOn ? "translate-x-7" : "translate-x-0.5"}`}
          />
        </button>

        {/* Label */}
        <span
          className={`text-sm font-medium ${
            isConnected
              ? lightOn
                ? "text-yellow-300"
                : "text-gray-400"
              : "text-gray-600"
          }`}
        >
          {isConnected ? (lightOn ? "ON" : "OFF") : "—"}
        </span>
      </div>
    </div>
  );
}
