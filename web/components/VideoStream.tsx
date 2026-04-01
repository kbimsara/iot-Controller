"use client";

import { useState } from "react";

interface Props {
  streamUrl: string | null;
}

export default function VideoStream({ streamUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700
                 aspect-video flex items-center justify-center relative"
    >
      {/* Placeholder when not connected */}
      {!streamUrl && (
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.277A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
            />
          </svg>
          <p className="text-sm">Connect to an ESP32-CAM to view stream</p>
        </div>
      )}

      {/* Loading spinner */}
      {streamUrl && !loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div
            className="w-10 h-10 border-2 border-blue-500 border-t-transparent
                       rounded-full animate-spin"
          />
        </div>
      )}

      {/* Error state */}
      {streamUrl && error && (
        <div className="flex flex-col items-center gap-2 text-red-400">
          <p className="text-sm">Stream unavailable.</p>
          <p className="text-xs text-gray-500">Check connection or browser mixed-content settings.</p>
        </div>
      )}

      {/* MJPEG stream — key forces remount when URL changes */}
      {streamUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={streamUrl}
          src={streamUrl}
          alt="ESP32-CAM live stream"
          onLoad={() => {
            setLoaded(true);
            setError(false);
          }}
          onError={() => {
            setLoaded(false);
            setError(true);
          }}
          className={`absolute inset-0 w-full h-full object-contain
                      transition-opacity duration-300
                      ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
