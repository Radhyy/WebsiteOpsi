#include <WiFi.h>
#include <HTTPClient.h>

// ==========================================
// CONFIGURATION
// ==========================================

// Ganti sesuai nomor mahasiswa/siswa
const int STUDENT_ID = 2;

// Ganti dengan WiFi milikmu
const char* ssid = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";

// Endpoint API
const char* serverName = "https://iotservicebutton.netlify.app/api/record-button";

// Pin tombol (sesuai kode MicroPython temanmu)
const int PIN_HELP = 25;
const int PIN_STRUGGLE = 32;
const int PIN_SUCCESS = 4;

// Debounce
unsigned long lastPress = 0;
const unsigned long debounceDelay = 300;

// ==========================================

void setup() {
  Serial.begin(115200);

  pinMode(PIN_HELP, INPUT_PULLUP);
  pinMode(PIN_STRUGGLE, INPUT_PULLUP);
  pinMode(PIN_SUCCESS, INPUT_PULLUP);

  Serial.println();
  Serial.println("Menghubungkan WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");
  Serial.print("IP Address : ");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (millis() - lastPress < debounceDelay) {
    return;
  }

  if (digitalRead(PIN_HELP) == LOW) {
    Serial.println("HELP");
    sendInteraction("HELP");
    lastPress = millis();
  }

  if (digitalRead(PIN_STRUGGLE) == LOW) {
    Serial.println("STRUGGLE");
    sendInteraction("STRUGGLE");
    lastPress = millis();
  }

  if (digitalRead(PIN_SUCCESS) == LOW) {
    Serial.println("SUCCESS");
    sendInteraction("SUCCESS");
    lastPress = millis();
  }

  delay(20);
}

void sendInteraction(String buttonType) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnect");
    return;
  }

  HTTPClient http;

  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String payload =
      "{\"student_id\":" + String(STUDENT_ID) +
      ",\"button_type\":\"" + buttonType + "\"}";

  Serial.println("================================");
  Serial.println("Mengirim Data...");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  Serial.print("HTTP Code : ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Response:");
    Serial.println(response);
  } else {
    Serial.print("Gagal POST. Error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}
