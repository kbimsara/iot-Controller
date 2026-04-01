"use client";

import { useEsp32 } from "@/hooks/useEsp32";
import ConnectionSettings from "@/components/ConnectionSettings";
import VideoStream from "@/components/VideoStream";
import LightControl from "@/components/LightControl";

export default function HomePage() {
  const {
    ip,
    saveIp,
    connectionState,
    lightOn,
    connect,
    disconnect,
    toggleLight,
    streamUrl,
  } = useEsp32();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <header className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          IoT Controller
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ESP32-CAM live stream &amp; light control
        </p>
      </header>

      {/* Connection */}
      <ConnectionSettings
        ip={ip}
        connectionState={connectionState}
        onConnect={connect}
        onDisconnect={disconnect}
        onIpChange={saveIp}
      />

      {/* Video stream */}
      <VideoStream streamUrl={streamUrl} />

      {/* Light control */}
      <LightControl
        lightOn={lightOn}
        connectionState={connectionState}
        onToggle={toggleLight}
      />

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 pt-4">
        Enter your ESP32-CAM&apos;s local IP address to connect.
        <br />
        If the stream does not load, allow mixed content for this page in your
        browser settings.
      </footer>
    </main>
  );
}
