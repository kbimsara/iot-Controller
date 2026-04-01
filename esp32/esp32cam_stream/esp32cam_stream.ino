/**
 * ESP32-CAM Streaming Server
 * Board: AI-Thinker ESP32-CAM
 *
 * Endpoints:
 *   GET /stream    — MJPEG live stream
 *   GET /light/on  — Turn flash LED on
 *   GET /light/off — Turn flash LED off
 *   GET /status    — JSON: { "light": "on"|"off", "uptime": <seconds> }
 *
 * Setup:
 *   1. Set WIFI_SSID and WIFI_PASS below
 *   2. Arduino IDE board: AI Thinker ESP32-CAM
 *   3. Partition scheme: Huge APP (3MB No OTA)
 *   4. After flash, open Serial Monitor at 115200 baud to see IP
 */

#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <WiFi.h>
#include <WebServer.h>

// ── WiFi credentials ──────────────────────────────────────────────────────────
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// ── GPIO ──────────────────────────────────────────────────────────────────────
#define FLASH_LED_PIN 4

// ── AI-Thinker ESP32-CAM pin map ──────────────────────────────────────────────
#define PWDN_GPIO_NUM   32
#define RESET_GPIO_NUM  -1
#define XCLK_GPIO_NUM    0
#define SIOD_GPIO_NUM   26
#define SIOC_GPIO_NUM   27
#define Y9_GPIO_NUM     35
#define Y8_GPIO_NUM     34
#define Y7_GPIO_NUM     39
#define Y6_GPIO_NUM     36
#define Y5_GPIO_NUM     21
#define Y4_GPIO_NUM     19
#define Y3_GPIO_NUM     18
#define Y2_GPIO_NUM      5
#define VSYNC_GPIO_NUM  25
#define HREF_GPIO_NUM   23
#define PCLK_GPIO_NUM   22

// ── Globals ───────────────────────────────────────────────────────────────────
WebServer server(80);
bool lightOn = false;

// ── CORS helper ───────────────────────────────────────────────────────────────
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin",  "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Camera initialisation ─────────────────────────────────────────────────────
void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_VGA;  // 640×480
  config.jpeg_quality = 12;             // 0–63, lower = better quality
  config.fb_count     = 2;             // double buffer

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x — restarting\n", err);
    delay(1000);
    ESP.restart();
  }
  Serial.println("Camera init OK");
}

// ── MJPEG stream handler ──────────────────────────────────────────────────────
#define PART_BOUNDARY "frame"
static const char* STREAM_CT =
  "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* PART_HDR =
  "--" PART_BOUNDARY "\r\nContent-Type: image/jpeg\r\n\r\n";

void handleStream() {
  addCORSHeaders();

  WiFiClient client = server.client();
  client.println("HTTP/1.1 200 OK");
  client.printf("Content-Type: %s\r\n", STREAM_CT);
  client.println("Cache-Control: no-cache");
  client.println("Connection: close");
  client.println();

  while (client.connected()) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Frame capture failed");
      continue;
    }

    client.print(PART_HDR);
    client.write(fb->buf, fb->len);
    client.print("\r\n");
    esp_camera_fb_return(fb);

    delay(30); // ~33 fps cap
  }
}

// ── Light handlers ────────────────────────────────────────────────────────────
void handleLightOn() {
  addCORSHeaders();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }
  digitalWrite(FLASH_LED_PIN, HIGH);
  lightOn = true;
  server.send(200, "application/json", "{\"light\":\"on\"}");
}

void handleLightOff() {
  addCORSHeaders();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }
  digitalWrite(FLASH_LED_PIN, LOW);
  lightOn = false;
  server.send(200, "application/json", "{\"light\":\"off\"}");
}

// ── Status handler ────────────────────────────────────────────────────────────
void handleStatus() {
  addCORSHeaders();
  if (server.method() == HTTP_OPTIONS) {
    server.send(204);
    return;
  }
  String json = "{\"light\":\"";
  json += lightOn ? "on" : "off";
  json += "\",\"uptime\":";
  json += millis() / 1000;
  json += "}";
  server.send(200, "application/json", json);
}

// ── Not found ─────────────────────────────────────────────────────────────────
void handleNotFound() {
  addCORSHeaders();
  server.send(404, "application/json", "{\"error\":\"not found\"}");
}

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32-CAM starting...");

  // Disable brownout detector (helps with power supply fluctuations)
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

  // Flash LED
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Camera
  initCamera();

  // WiFi
  Serial.printf("Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Routes
  server.on("/stream",    HTTP_GET,     handleStream);
  server.on("/light/on",  HTTP_GET,     handleLightOn);
  server.on("/light/on",  HTTP_OPTIONS, handleLightOn);
  server.on("/light/off", HTTP_GET,     handleLightOff);
  server.on("/light/off", HTTP_OPTIONS, handleLightOff);
  server.on("/status",    HTTP_GET,     handleStatus);
  server.on("/status",    HTTP_OPTIONS, handleStatus);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started on port 80");
  Serial.println("Endpoints:");
  Serial.printf("  Stream : http://%s/stream\n",    WiFi.localIP().toString().c_str());
  Serial.printf("  Light  : http://%s/light/on|off\n", WiFi.localIP().toString().c_str());
  Serial.printf("  Status : http://%s/status\n",    WiFi.localIP().toString().c_str());
}

// ── Loop ──────────────────────────────────────────────────────────────────────
void loop() {
  server.handleClient();
}
