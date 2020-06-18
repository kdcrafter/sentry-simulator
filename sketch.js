function setup() {
    createCanvas(700, 700, WEBGL);
}

function draw() {
    rectMode(CENTER);

    background(150);
    ambientLight(255);

    // let camPos = createVector(0, 0, 0);
    // let camCenter = createVector(0, 1, 0);
    // let camUp = createVector(0, 1, 0);
    // camera(camPos, camCenter, camUp);

    cam = createCamera();
    cam.setPosition(0, -200, 0.00001); // a z value of 0 causes canvas to only show background
    cam.lookAt(0, 0, 0);

    push();
    rotateX(millis() / 1000);
    rotateY(millis() / 1000);
    rotateZ(millis() / 1000);

    ambientMaterial(255);
    sphere();
    pop();

    push();
    translate(0, 100, 0);
    rotateX(HALF_PI)

    ambientMaterial(100);
    plane(10000, 10000);
    pop();
}