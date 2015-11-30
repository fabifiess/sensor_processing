int ledPin = 13; 
String readString;

void setup() { 
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}
void loop() {
  while (Serial.available()) {
    delay(3);
    char c = Serial.read(); 
    readString += c;
  }
  if (readString.length() > 0) {
    Serial.println(readString); 
    if (readString == "1") {
      digitalWrite(ledPin, HIGH); 
    }
    if (readString == "0") {
      digitalWrite(ledPin, LOW);
    }
    readString = ""; 
  }
}
