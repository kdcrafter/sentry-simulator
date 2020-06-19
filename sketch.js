// Note: coordinate position units are in mm

// Global variables
let cam, sentryCam;

function setup() {
    createCanvas(700, 700, WEBGL);

    // Cameras
    let eyeZ = (height/2.0) / tan(PI * 60.0/360.0);

    topCam = createCamera();
    topCam.setPosition(0, -3500, -2500.0001); // camera can't look stright up or down ?
    topCam.lookAt(0, 1300, -2500);
    topCam.perspective(PI/3.0, width/height, eyeZ/10.0, eyeZ*15.0);

    sentryCam = createCamera();
    sentryCam.setPosition(0, 0, 0);
    sentryCam.perspective(PI/3.0, width/height, eyeZ/10.0, eyeZ*15.0);

    setCamera(sentryCam);
}

function draw() {
    // Settings
    rectMode(CENTER);

    // Scene
    background(150);
    ambientLight(255);

    // Ground
    push();
    translate(0, 1300, -2500);
    rotateX(HALF_PI)

    ambientMaterial(100);
    plane(20000, 20000);
    pop();

    // Objects
    push();
    translate(0, 0, millis()/5 - 2500);

    noStroke();
    ambientMaterial(255);
    sphere(17);
    pop();
}