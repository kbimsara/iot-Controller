# IoT Controller — ESP32-CAM

Live video streaming and flash light control for the AI-Thinker ESP32-CAM board,
with a Next.js + Tailwind dark-theme web interface hosted on Vercel.

---

## Project Structure

```
iot-Controller/
├── esp32/
│   └── esp32cam_stream/
│       └── esp32cam_stream.ino   ← Arduino sketch for ESP32-CAM
└── web/                          ← Next.js web app (Vercel deploy root)
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    └── types/
```

---

## ESP32-CAM Setup

### Requirements
- Arduino IDE 2.x
- Board package: `esp32` by Espressif
  - Add URL in Arduino IDE → Preferences → Additional Boards Manager URLs:
    ```
    https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
    ```
- Board: **AI Thinker ESP32-CAM**
- Partition Scheme: **Huge APP (3MB No OTA)**

### Flash Instructions
1. Open `esp32/esp32cam_stream/esp32cam_stream.ino` in Arduino IDE
2. Set your WiFi credentials:
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_SSID";
   const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
   ```
3. Select board: **AI Thinker ESP32-CAM**
4. Upload (use a USB-UART adapter; IO0 must be pulled LOW during flash)
5. Open Serial Monitor at **115200 baud** — the board will print its local IP

### HTTP API

| Endpoint        | Description                                        |
|-----------------|----------------------------------------------------|
| `GET /stream`   | MJPEG live video stream                            |
| `GET /light/on` | Turn flash LED (GPIO 4) on                         |
| `GET /light/off`| Turn flash LED off                                 |
| `GET /status`   | JSON `{ "light": "on|off", "uptime": N }`          |

All endpoints include `Access-Control-Allow-Origin: *` CORS headers.

---

## Web App Setup

### Local development

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

Open `http://localhost:3000`, enter the ESP32-CAM's local IP, and click **Connect**.

> Running locally (HTTP) avoids mixed-content browser restrictions entirely.

### Deploy to Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com) → set **Root Directory** to `web`
3. Build command: `npm run build` · Output: `.next`
4. Node.js version: 20.x

### Mixed Content Note

The Vercel deployment is served over **HTTPS**, but the ESP32-CAM only supports **HTTP**.
Modern browsers block HTTP requests from HTTPS pages by default.

**To allow it (one-time per browser):**
- **Chrome**: Go to `chrome://settings/content/insecureContent` → add your Vercel domain
- **Firefox**: More permissive; the CSP headers in `vercel.json` usually suffice
- **Alternative**: Use `npm run dev` locally on the same network as the ESP32

---

## License

MIT © Kavindu Bimsara
