/* ---------------------------------------
 *  GLOBAL VARIABLES
 */

// serial stuff
var serial;
var x;
var z;
var xMap;
var zMap;
var constrainDegree = 40;

// Blood paint stuff
let drops = [];
var offset = 2;
var minDropSize = 5;
var maxDropSize = 15;
var dropLength = 60;
var easing = 0.08; // how fast the drops run

// Wind, button, picked up
var WindSpeed_MPH = 0;
var touching = -1;
var buttonOn = 0;

var bkgdImg;

/* ---------------------------------------
 *  SETUP
 */
//  function preload() {
//   bkgdImg = new loadImage("http://localhost:7800/bkgd-img.jpg");
// }
function setup() {
	createCanvas(windowWidth, windowHeight);
  text('Pressa da reset, Dumbo :)', 10, 10);
	imageMode(CORNER);
	bkgdImg = new loadImage("/assets/bkgd-img.jpg");
  background(bkgdImg);
	// image(bkgdImg,0,0, 100, 100);
  // Serial
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  // serial.on('connected', serverConnected); // callback for connecting to the server
  // serial.on('open', portOpen); // callback for the port opening
  serial.on('list', printList); // set a callback function for the serialport list event
  // serial.on('error', serialError); // callback for errors
  // serial.on('close', portClose); // callback for the port closing
  // serial.list(); // list the serial ports

  // Blood drops settings
  // createCanvas(400, 400);
  noStroke();
  frameRate(30);
  angleMode(DEGREES);
  ellipseMode(CENTER);
}


/* ---------------------------------------
 *  DRAW
 */

function draw() {
	//clear the screen on button press by redrawing background image
	if (buttonOn[1] > -1) {
		background(bkgdImg);
		drops.length = 0;
	}
	
	//Blood spatters
	 if (WindSpeed_MPH[1] > 5) {
      fill(255, 0, 0, 98);
      // noStroke();
		 for (var i = 0; i < 10; i++) {
      ellipse(random(0, windowWidth), random(0 , windowHeight), WindSpeed_MPH[1] * random(0.01, 3));
      ellipse(random(0, windowWidth), random(0 , windowHeight), WindSpeed_MPH[1] * random(0.01, 3));
    }
	 }	 

	
	push();
  // Accelerometer
  translate(height / 2, width / 2);
  translateInput();

  // Update blood paint movement
  for (let i = 0; i < drops.length; i++) {
    drops[i].move();
    drops[i].display();
  }
	

  //touch to turn on DRAWING
  if (touching[1] == 0) {
    // fill(0, 100, 255);
    // textSize(24);
    // stroke(1);
    // text("drawing", width / 2, height / 2);
    
    // Do blood paint
    
    createDrop(xMap, zMap);
    // Keep size of array in check, delete the first 40, every 5 seconds
    if (millis() % 5000 < 100) {
      print(drops.length);
      drops.splice(0, 40); //index, amount
    }

    // Draw the blood based on Accelerometer
    noStroke();
    ellipse(xMap, zMap, 10, 10);
    pop();

    //blow blood function
  }
  
  

  //guiText();
}

//Reset the sketch functionality
function resetButton () {
background(img);
}


/* ---------------------------------------
 * Drawing Drops functionality
 */

function createDrop(x, y) {
  let d = new drop(x, y);
  drops.push(d);
}

class drop {
  constructor(xIn, yIn) {
    // make local variables
    this.x = xIn;
    this.y = yIn;
    // length of slide effect
    this.maxLength = random(10, dropLength);
    this.maxFall = this.maxLength + yIn;
    // speed
    this.speed = random(5, 15);
    // size of this drop
    this.diameter = random(minDropSize, maxDropSize);
  }

  move() {
    var rand = random(-0.5, 0.5)

    //only update this.y if it is below the lenght a drop can slide
    if (this.y > this.maxFall) {
      //print("larger");
      this.y = this.y;
    } else {
      this.y += this.speed * easing;
      this.x += rand;
    }
  }

  display() {
  	//drawing drops color
    fill(150,0,0,255);
    ellipse(this.x, this.y + 1, this.diameter, this.diameter);
    //drawing color
    fill(200,0,0, 255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}


/* ---------------------------------------
 *  Handle serial input
 */

// Translation of input from Accelerometer
function translateInput() {
  // fix X mapping
  if (x > (360 - constrainDegree)) {
    xMap = map((-1 * (360 - x)), 0, constrainDegree, 0, width / 2);
    print(xMap);
  } else {
    xMap = map(x, 0, constrainDegree, 0, width / 2);
  }

  // fix Z mapping
  zMap = map(z, 0, constrainDegree, 0, height / 2);
}
/*
function guiText() {
  //background(0);
  fill(255);
  text("sensor value: " + inData, 30, 30);
}
*/

// port list
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    var p = portList[i];
    if (p.indexOf('Adafruit') > -1) { // returns neg 1 if not there
      print("found Adafruit: " + p);

      // open port
      serial.clear();
      serial.open(p, {
        baudrate: 9600
      });
    }
  }
}

// Standard serial setup

function serialEvent() {

  // For serial.println:
  // read a string from the serial port:
  var inString = serial.readLine();
  // print(inString);
  if (!inString) return;
 		 // check to see that there's actually a string there:
  if (inString.length > 0) {
    // split it
    var parts = inString.split(',');
    // print(parts);

    if (parts.length > 4) { // check that the array has at least three
      WindSpeed_MPH = split(parts[0], ':');
      touching = split(parts[1], ':');
      buttonOn = split(parts[2], ':');
      // convert it to a number:
      x = Number(parts[3]);
      z = Number(parts[4]);
      // debug
      print(WindSpeed_MPH[1], touching[1], buttonOn[1], x, z);
    }
  }
  //handshake
  serial.write('x');
}

// function serverConnected() {
//   print('connected to server.');
// }

// function portOpen() {
//   print('the serial port opened.')
// }

// function serialError(err) {
//   print('Something went wrong with the serial port. ' + err);
// }

// function portClose() {
//   print('The serial port closed.');
// }