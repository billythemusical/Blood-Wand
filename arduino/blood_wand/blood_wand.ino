//Accelorometer 

/*
   Connect Vin to the power supply, 3-5V is fine. Use the same voltage that the microcontroller logic is based off of. For most Arduinos, that is 5V
   Connect GND to common power/data ground
   Connect the SCL pin to the I2C clock SCL pin on your Arduino.On an UNO: A5
   Connect the SDA pin to the I2C data SDA pin on your Arduino.On an UNO: A4
*/

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>

Adafruit_BNO055 bno = Adafruit_BNO055(55);

 /* Get a new sensor event */
  sensors_event_t event;
//  bno.getEvent(&event);

// Wind Sensor

#define analogPinForRV    1   // change to pins you the analog pins are using
#define analogPinForTMP   0

// to calibrate your sensor, put a glass over it, but the sensor should not be
// touching the desktop surface however.
// adjust the zeroWindAdjustment until your sensor reads about zero with the glass over it.

const float zeroWindAdjustment =  -0.02; // negative numbers yield smaller wind speeds and vice versa.

int TMP_Therm_ADunits;  //temp termistor value from wind sensor
float RV_Wind_ADunits;    //RV output from wind sensor
float RV_Wind_Volts;
unsigned long lastMillis;
int TempCtimes100;
float zeroWind_ADunits;
float zeroWind_volts;
float WindSpeed_MPH;
int MPH;

//Fabric Touch Sensor

#include <CapacitiveSensor.h>
CapacitiveSensor cs_7_8 = CapacitiveSensor(7, 8); //10M Resistor between pins 7 and 8, you may also connect an antenna on pin 8
long touchValue;
int LED = 5;
int touching = -1;

//Button

int BUTTON = 3;
int buttonOn = 0;
int currentButtonState;
int previousButtonState;


void setup() {
  
  Serial.begin(9600);   // faster printing to get a bit better throughput on extended info
  // remember to change your serial monitor BAUD

  Serial.println("start");
  // put your setup code here, to run once:
  
  //Accelerometer

   /* Initialise the sensor */
  if (!bno.begin())
  {
    /* There was a problem detecting the BNO055 ... check your connections */
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while (1);
  }

  delay(1000);

  bno.setExtCrystalUse(true);

  //Wind Sensor

  //   Uncomment the three lines below to reset the analog pins A2 & A3
  //   This is code from the Modern Device temp sensor (not required)
  pinMode(A2, INPUT);        // GND pin
  pinMode(A3, INPUT);        // VCC pin
  digitalWrite(A3, LOW);     // turn off pullups

  //Fabric Touch Sensor

  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);

  //Button

  pinMode(BUTTON, INPUT);

}

void loop() {
  printer();
  accell();
  buttonClear();
  windSensor();
  fabricTouch();
}

void printer () {

//  if (Serial.available() > 0) {
//    char input = Serial.read();
    Serial.print("WindSpeed_MPH:");
    Serial.print(WindSpeed_MPH);
    Serial.print(',');
    Serial.print("touching:");
    Serial.print(touching);
    Serial.print(',');
    Serial.print("buttonOn:");
    Serial.print(buttonOn);
    Serial.print(',');
    Serial.print(event.orientation.x, 4);
    Serial.print(",");
    Serial.print(event.orientation.z, 4);
    Serial.println("");
//  }

}

void accell() {
   /* Get a new sensor event */
//  sensors_event_t event;
  bno.getEvent(&event);
  }

void windSensor() {

  if (millis() - lastMillis > 20) {     // read every 20 ms - printing slows this down further

    TMP_Therm_ADunits = analogRead(analogPinForTMP);
    RV_Wind_ADunits = analogRead(analogPinForRV);
    RV_Wind_Volts = (RV_Wind_ADunits *  0.0048828125);

    TempCtimes100 = (0.005 * ((float)TMP_Therm_ADunits * (float)TMP_Therm_ADunits)) - (16.862 * (float)TMP_Therm_ADunits) + 9075.4;

    zeroWind_ADunits = -0.0006 * ((float)TMP_Therm_ADunits * (float)TMP_Therm_ADunits) + 1.0727 * (float)TMP_Therm_ADunits + 47.172; //  13.0C  553  482.39

    zeroWind_volts = (zeroWind_ADunits * 0.0048828125) - zeroWindAdjustment;


    WindSpeed_MPH =  pow(((RV_Wind_Volts - zeroWind_volts) / .2300) , 2.7265);
    //      MPH = map(WindSpeed_MPH, 0, 15, 0, 1024);

//    if (Serial.available) {
//      Serial.print("MPH: ");
//      Serial.println(WindSpeed_MPH);
//      delay(1);
//
//                  }

      lastMillis = millis();
    }
  }

  void fabricTouch() {
    // intialize cap sensor pins and sensitivity
    // sensor resolution is set to (value)
    touchValue = cs_7_8.capacitiveSensor(20);

    if (touchValue >= 8000) {
      touching = 0;
    } else {
      touching = -1;
    }
  }

  void buttonClear() {

    currentButtonState = digitalRead(BUTTON);

    if (currentButtonState == HIGH) {
      buttonOn = 0;
      digitalWrite(LED, HIGH);
    } else {
      digitalWrite(LED, LOW);
      buttonOn = -1;
    }
  }
