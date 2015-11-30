/*
Dim RGB-led.
The leds have a common Anode (+5V) (and resistor) and get into the channels 9, 10 and 11.
Open the Serial Monitor and type in something like this:
2e2eff
The Arduino-board will translate the incoming hex-string into decimal-values 
and appöy them to the RGB-led.
2e2eff steht für 46,46,255
*/


int led_r = 9;
int led_g = 10;
int led_b = 11;

String readString; // empfangener String hat diese Form: "led1:0,0,255"

int helligkeit_r;      // z.B. 0
int helligkeit_g;      // z.B. 0
int helligkeit_b;      // z.B. 255


void setup() 
{
  Serial.begin(9600);
  
  //Setup led1
  pinMode(led_r, OUTPUT);
  pinMode(led_g, OUTPUT);
  pinMode(led_b, OUTPUT);
  digitalWrite(led_r, HIGH);  // leds aus
  digitalWrite(led_g, HIGH);
  digitalWrite(led_b, HIGH);
  
  //Serial.println("Type in something like this: 2effff"); 
}




void loop() 
{
  while (Serial.available()) 
  {
    delay(3);  
    char c = Serial.read();
    readString += c; 
  }

  if (readString.length() >0) 
  {
    
    stringAnalyse();
    

  
    // werte schreiben

    analogWrite(led_r, 255 - helligkeit_r);   // rote led
    analogWrite(led_g, 255 - helligkeit_g);   // grüne led
    analogWrite(led_b, 255 - helligkeit_b);   // blaue led
  } 
  readString="";
}





void stringAnalyse()
{
    // String analysieren: String hat bspw. die Form "00ff00" (Grün).
    String wert_r;
    wert_r += readString.charAt(0);
    wert_r += readString.charAt(1);
    helligkeit_r = hexToDec(wert_r);
    wert_r = "";
    
    // Serial.print("Rot-Wert: ");
    //Serial.println(helligkeit_r);
    
    
    String wert_g;
    wert_g += readString.charAt(2);
    wert_g += readString.charAt(3);
    helligkeit_g = hexToDec(wert_g);
    wert_g = "";
    
    // Serial.print("Gruen-Wert: ");
    // Serial.println(helligkeit_g);
    
    
    String wert_b;
    wert_b += readString.charAt(4);
    wert_b += readString.charAt(5);
    helligkeit_b = hexToDec(wert_b);
    wert_b = "";
    
    // Serial.print("Blau-Wert: ");
    // Serial.println(helligkeit_b);
}




// Converting from Hex to Decimal:
// Source: https://github.com/benrugg/Arduino-Hex-Decimal-Conversion

unsigned int hexToDec(String hexString) {
  
  unsigned int decValue = 0;
  int nextInt;
  
  for (int i = 0; i < hexString.length(); i++) {
    
    nextInt = int(hexString.charAt(i));
    if (nextInt >= 48 && nextInt <= 57) nextInt = map(nextInt, 48, 57, 0, 9);
    if (nextInt >= 65 && nextInt <= 70) nextInt = map(nextInt, 65, 70, 10, 15);
    if (nextInt >= 97 && nextInt <= 102) nextInt = map(nextInt, 97, 102, 10, 15);
    nextInt = constrain(nextInt, 0, 15);
    
    decValue = (decValue * 16) + nextInt;
  }
  
  return decValue;
}


