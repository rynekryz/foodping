#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <time.h>
#include <vector>

namespace {

constexpr char AP_NAME[] = "FoodPing-Setup";
constexpr char HOSTNAME[] = "esp32";
constexpr char ALLOWED_ORIGIN[] = "https://rynekryz.github.io";
constexpr char TIMEZONE[] = "<+08>-8";
constexpr char NTP_PRIMARY[] = "pool.ntp.org";
constexpr char NTP_SECONDARY[] = "time.google.com";
constexpr char SCRIPT_URL[] = "https://script.google.com/macros/s/";

constexpr uint8_t ALERT_HOUR = 8;
constexpr uint8_t ALERT_MINUTE = 0;
constexpr int WARNING_DAYS = 3;

constexpr uint8_t PIN_SAFE = 25;
constexpr uint8_t PIN_WARNING = 26;
constexpr uint8_t PIN_EXPIRED = 27;
constexpr uint8_t PIN_BUZZER = 14;
constexpr uint8_t PIN_BUTTON = 0;

constexpr unsigned long WIFI_TIMEOUT_MS = 20000;
constexpr unsigned long HOTSPOT_FALLBACK_MS = 30000;
constexpr unsigned long SYNC_INTERVAL_MS = 60000;
constexpr unsigned long HTTP_TIMEOUT_MS = 10000;
constexpr unsigned long STATUS_INTERVAL_MS = 1000;
constexpr unsigned long ALARM_DURATION_MS = 10000;
constexpr unsigned long ALARM_BEEP_MS = 200;
constexpr unsigned long RESET_HOLD_MS = 5000;
constexpr unsigned long BLINK_MS = 500;
constexpr unsigned long RESTART_DELAY_MS = 1000;

constexpr size_t MAX_FOODS = 100;
constexpr size_t MAX_BODY_BYTES = 512;
constexpr size_t MAX_RESPONSE_BYTES = 16384;
constexpr time_t MIN_VALID_EPOCH = 1700000000;

const char ROOT_CA[] PROGMEM = R"PEM(-----BEGIN CERTIFICATE-----
MIIFVzCCAz+gAwIBAgINAgPlk28xsBNJiGuiFzANBgkqhkiG9w0BAQwFADBHMQsw
CQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExMQzEU
MBIGA1UEAxMLR1RTIFJvb3QgUjEwHhcNMTYwNjIyMDAwMDAwWhcNMzYwNjIyMDAw
MDAwWjBHMQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZp
Y2VzIExMQzEUMBIGA1UEAxMLR1RTIFJvb3QgUjEwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQC2EQKLHuOhd5s73L+UPreVp0A8of2C+X0yBoJx9vaMf/vo
27xqLpeXo4xL+Sv2sfnOhB2x+cWX3u+58qPpvBKJXqeqUqv4IyfLpLGcY9vXmX7w
Cl7raKb0xlpHDU0QM+NOsROjyBhsS+z8CZDfnWQpJSMHobTSPS5g4M/SCYe7zUjw
TcLCeoiKu7rPWRnWr4+wB7CeMfGCwcDfLqZtbBkOtdh+JhpFAz2weaSUKK0Pfybl
qAj+lug8aJRT7oM6iCsVlgmy4HqMLnXWnOunVmSPlk9orj2XwoSPwLxAwAtcvfaH
szVsrBhQf4TgTM2S0yDpM7xSma8ytSmzJSq0SPly4cpk9+aCEI3oncKKiPo4Zor8
Y/kB+Xj9e1x3+naH+uzfsQ55lVe0vSbv1gHR6xYKu44LtcXFilWr06zqkUspzBmk
MiVOKvFlRNACzqrOSbTqn3yDsEB750Orp2yjj32JgfpMpf/VjsPOS+C12LOORc92
wO1AK/1TD7Cn1TsNsYqiA94xrcx36m97PtbfkSIS5r762DL8EGMUUXLeXdYWk70p
aDPvOmbsB4om3xPXV2V4J95eSRQAogB/mqghtqmxlbCluQ0WEdrHbEg8QOB+DVrN
VjzRlwW5y0vtOUucxD/SVRNuJLDWcfr0wbrM7Rv1/oFB2ACYPTrIrnqYNxgFlQID
AQABo0IwQDAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E
FgQU5K8rJnEaK0gnhS9SZizv8IkTcT4wDQYJKoZIhvcNAQEMBQADggIBAJ+qQibb
C5u+/x6Wki4+omVKapi6Ist9wTrYggoGxval3sBOh2Z5ofmmWJyq+bXmYOfg6LEe
QkEzCzc9zolwFcq1JKjPa7XSQCGYzyI0zzvFIoTgxQ6KfF2I5DUkzps+GlQebtuy
h6f88/qBVRRiClmpIgUxPoLW7ttXNLwzldMXG+gnoot7TiYaelpkttGsN/H9oPM4
7HLwEXWdyzRSjeZ2axfG34arJ45JK3VmgRAhpuo+9K4l/3wV3s6MJT/KYnAK9y8J
ZgfIPxz88NtFMN9iiMG1D53Dn0reWVlHxYciNuaCp+0KueIHoI17eko8cdLiA6Ef
MgfdG+RCzgwARWGAtQsgWSl4vflVy2PFPEz0tv/bal8xa5meLMFrUKTX5hgUvYU/
Z6tGn6D/Qqc6f1zLXbBwHSs09dR2CQzreExZBfMzQsNhFRAbd03OIozUhfJFfbdT
6u9AWpQKXCBfTkBdYiJ23//OYb2MI3jSNwLgjt7RETeJ9r/tSQdirpLsQBqvFAnZ
0E6yove+7u7Y/9waLd64NnHi/Hm3lCXRSHNboTXns5lndcEZOitHTtNCjv0xyBZm
2tIMPNuzjsmhDYAPexZ3FL//2wmUspO8IFgV6dtxQ/PeEMMA3KgqlbbC1j+Qa3bb
bP6MvPJwNQzcmRk13NfIRmPVNnGuV/u3gm3c
-----END CERTIFICATE-----)PEM";

enum class Level { None, Safe, Warning, Expired };

struct Food {
  String name;
  time_t expiry;
};

Preferences prefs;
WebServer server(80);
WiFiClientSecure secureClient;
std::vector<Food> foods;

String ssid;
String password;
String scriptId;

bool accessPointActive = false;
bool wasConnected = false;
unsigned long disconnectedSince = 0;
unsigned long lastSync = 0;
unsigned long lastStatus = 0;
unsigned long lastBlink = 0;
bool blinkState = false;
unsigned long restartAt = 0;
unsigned long alarmUntil = 0;
long lastAlertDay = -1;
bool buttonWasPressed = false;
unsigned long buttonPressedAt = 0;

long dayNumber(time_t t) {
  tm local;
  localtime_r(&t, &local);
  int year = local.tm_year + 1900;
  const int month = local.tm_mon + 1;
  const int day = local.tm_mday;
  if (month <= 2) year--;
  const long era = (year >= 0 ? year : year - 399) / 400;
  const long yearOfEra = year - era * 400;
  const long dayOfYear = (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5 + day - 1;
  const long dayOfEra = yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear;
  return era * 146097 + dayOfEra;
}

bool timeReady() {
  return time(nullptr) > MIN_VALID_EPOCH;
}

Level levelFor(long daysLeft) {
  if (daysLeft > WARNING_DAYS) return Level::Safe;
  if (daysLeft > 0) return Level::Warning;
  return Level::Expired;
}

Level overallLevel() {
  if (foods.empty() || !timeReady()) return Level::None;
  const long today = dayNumber(time(nullptr));
  Level worst = Level::Safe;
  for (const Food& food : foods) {
    const Level level = levelFor(dayNumber(food.expiry) - today);
    if (level > worst) worst = level;
  }
  return worst;
}

int dueCount() {
  if (!timeReady()) return 0;
  const long today = dayNumber(time(nullptr));
  int count = 0;
  for (const Food& food : foods) {
    const long daysLeft = dayNumber(food.expiry) - today;
    if (daysLeft >= 0 && daysLeft <= WARNING_DAYS) count++;
  }
  return count;
}

void setLeds(bool safe, bool warning, bool expired) {
  digitalWrite(PIN_SAFE, safe);
  digitalWrite(PIN_WARNING, warning);
  digitalWrite(PIN_EXPIRED, expired);
}

void showLevel(Level level) {
  setLeds(level == Level::Safe, level == Level::Warning, level == Level::Expired);
}

bool isValidScriptId(const String& id) {
  if (id.length() < 10 || id.length() > 200) return false;
  for (size_t i = 0; i < id.length(); i++) {
    const char c = id[i];
    if (!isalnum(static_cast<unsigned char>(c)) && c != '-' && c != '_') return false;
  }
  return true;
}

void loadConfig() {
  prefs.begin("foodping", false);
  ssid = prefs.getString("ssid", "");
  password = prefs.getString("pass", "");
  scriptId = prefs.getString("script", "");
}

void saveConfig() {
  prefs.putString("ssid", ssid);
  prefs.putString("pass", password);
  prefs.putString("script", scriptId);
}

void scheduleRestart() {
  restartAt = millis() + RESTART_DELAY_MS;
}

void clearConfigAndRestart() {
  prefs.clear();
  scheduleRestart();
}

void addCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
  server.sendHeader("Vary", "Origin");
}

void reply(int code, const char* body) {
  addCorsHeaders();
  server.send(code, "application/json", body);
}

bool originAllowed() {
  const String origin = server.header("Origin");
  return origin.length() == 0 || origin == ALLOWED_ORIGIN;
}

void handlePreflight() {
  if (!originAllowed()) {
    reply(403, "{\"ok\":false}");
    return;
  }
  addCorsHeaders();
  server.send(204);
}

void handleSave() {
  if (!originAllowed()) {
    reply(403, "{\"ok\":false}");
    return;
  }

  const String body = server.arg("plain");
  if (body.length() == 0 || body.length() > MAX_BODY_BYTES) {
    reply(400, "{\"ok\":false}");
    return;
  }

  JsonDocument doc;
  if (deserializeJson(doc, body.c_str())) {
    reply(400, "{\"ok\":false}");
    return;
  }

  const String newSsid = doc["ssid"] | "";
  const String newPassword = doc["password"] | "";
  const String newScriptId = doc["script_id"] | "";

  const bool passwordOk = newPassword.length() == 0 || (newPassword.length() >= 8 && newPassword.length() <= 63);
  if (newSsid.length() == 0 || newSsid.length() > 32 || !passwordOk || !isValidScriptId(newScriptId)) {
    reply(400, "{\"ok\":false}");
    return;
  }

  ssid = newSsid;
  password = newPassword;
  scriptId = newScriptId;
  saveConfig();
  reply(200, "{\"ok\":true}");
  scheduleRestart();
}

void handleResetWifi() {
  if (!originAllowed()) {
    reply(403, "{\"ok\":false}");
    return;
  }
  reply(200, "{\"ok\":true}");
  clearConfigAndRestart();
}

void handleNotFound() {
  reply(404, "{\"ok\":false}");
}

void startServer() {
  static const char* headerKeys[] = {"Origin"};
  server.collectHeaders(headerKeys, 1);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/save", HTTP_OPTIONS, handlePreflight);
  server.on("/reset-wifi", HTTP_POST, handleResetWifi);
  server.on("/reset-wifi", HTTP_OPTIONS, handlePreflight);
  server.onNotFound(handleNotFound);
  server.begin();
}

void startAccessPoint() {
  WiFi.softAP(AP_NAME);
  accessPointActive = true;
}

void stopAccessPoint() {
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
  accessPointActive = false;
}

void beginStation() {
  WiFi.setHostname(HOSTNAME);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid.c_str(), password.c_str());
}

void beginNetwork() {
  if (ssid.length() == 0) {
    WiFi.mode(WIFI_AP);
    startAccessPoint();
    return;
  }

  WiFi.mode(WIFI_STA);
  beginStation();
  const unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < WIFI_TIMEOUT_MS) {
    delay(250);
  }

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.mode(WIFI_AP_STA);
    startAccessPoint();
    beginStation();
  }
}

void onConnected() {
  if (accessPointActive) stopAccessPoint();
  MDNS.begin(HOSTNAME);
  MDNS.addService("http", "tcp", 80);
  configTzTime(TIMEZONE, NTP_PRIMARY, NTP_SECONDARY);
  lastSync = 0;
}

void maintainNetwork() {
  const bool connected = WiFi.status() == WL_CONNECTED;

  if (connected && !wasConnected) onConnected();
  if (!connected && wasConnected) disconnectedSince = millis();
  wasConnected = connected;

  if (connected || ssid.length() == 0 || accessPointActive) return;

  if (millis() - disconnectedSince > HOTSPOT_FALLBACK_MS) {
    WiFi.mode(WIFI_AP_STA);
    startAccessPoint();
    beginStation();
  }
}

bool parseFoods(const String& body) {
  JsonDocument doc;
  if (deserializeJson(doc, body.c_str())) return false;

  JsonArray list = doc.is<JsonArray>() ? doc.as<JsonArray>() : doc["foods"].as<JsonArray>();
  if (list.isNull()) return false;

  std::vector<Food> next;
  for (JsonObject item : list) {
    if (next.size() >= MAX_FOODS) break;
    const char* name = item["name"];
    const double milliseconds = item["date"] | 0.0;
    if (name == nullptr || milliseconds <= 0) continue;
    next.push_back({String(name), static_cast<time_t>(milliseconds / 1000.0)});
  }

  foods = std::move(next);
  return true;
}

bool fetchFoods() {
  if (!isValidScriptId(scriptId) || !timeReady()) return false;

  HTTPClient http;
  const String url = String(SCRIPT_URL) + scriptId + "/exec";
  if (!http.begin(secureClient, url)) return false;

  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.setTimeout(HTTP_TIMEOUT_MS);

  bool ok = false;
  if (http.GET() == HTTP_CODE_OK) {
    const int size = http.getSize();
    if (size < 0 || static_cast<size_t>(size) <= MAX_RESPONSE_BYTES) {
      ok = parseFoods(http.getString());
    }
  }

  http.end();
  return ok;
}

void syncFoods() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (lastSync != 0 && millis() - lastSync < SYNC_INTERVAL_MS) return;
  lastSync = millis();
  if (lastSync == 0) lastSync = 1;
  fetchFoods();
}

void checkAlert() {
  tm now;
  if (!getLocalTime(&now, 0)) return;
  if (now.tm_hour != ALERT_HOUR || now.tm_min != ALERT_MINUTE) return;

  const long today = dayNumber(time(nullptr));
  if (lastAlertDay == today) return;
  lastAlertDay = today;

  if (dueCount() > 0) alarmUntil = millis() + ALARM_DURATION_MS;
}

bool alarmActive() {
  return alarmUntil != 0 && static_cast<long>(alarmUntil - millis()) > 0;
}

void updateBuzzer() {
  if (!alarmActive()) {
    alarmUntil = 0;
    digitalWrite(PIN_BUZZER, LOW);
    return;
  }
  digitalWrite(PIN_BUZZER, (millis() / ALARM_BEEP_MS) % 2 == 0);
}

void updateStatus() {
  if (millis() - lastStatus < STATUS_INTERVAL_MS) return;
  lastStatus = millis();

  if (ssid.length() == 0) {
    if (millis() - lastBlink >= BLINK_MS) {
      lastBlink = millis();
      blinkState = !blinkState;
    }
    setLeds(false, blinkState, false);
    return;
  }

  showLevel(overallLevel());
  checkAlert();
}

void handleButton() {
  const bool pressed = digitalRead(PIN_BUTTON) == LOW;
  const unsigned long now = millis();

  if (pressed && !buttonWasPressed) buttonPressedAt = now;

  if (pressed && now - buttonPressedAt >= RESET_HOLD_MS && restartAt == 0) {
    clearConfigAndRestart();
  }

  if (!pressed && buttonWasPressed && now - buttonPressedAt < RESET_HOLD_MS) {
    alarmUntil = 0;
  }

  buttonWasPressed = pressed;
}

}

void setup() {
  pinMode(PIN_SAFE, OUTPUT);
  pinMode(PIN_WARNING, OUTPUT);
  pinMode(PIN_EXPIRED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  loadConfig();
  secureClient.setCACert(ROOT_CA);
  beginNetwork();
  startServer();
}

void loop() {
  server.handleClient();
  maintainNetwork();
  handleButton();
  syncFoods();
  updateStatus();
  updateBuzzer();

  if (restartAt != 0 && static_cast<long>(millis() - restartAt) >= 0) ESP.restart();
}
