// Global Variables
let physicsWorld;
let scene, camera, renderer;
let clock;
let bodies = new Set();
let tempTranformation;

// Setup and Begin Simulation
Ammo().then(start);

function start(){
    tempTranformation = new Ammo.btTransform();

    setupPhysicsWorld();
    setupGraphics();

    createBox({x: 0, y: 0, z: 0}, {x: 7, y: 1, z: 7}, 0x777777);
    createBox({x: 0, y: 1.5/2, z: 2}, {x: 5, y: 1.5, z: 1}, 0x415056);
    createBall({x: 0, y: 0, z: -2.5}, 1, 0.042, 0xffffff);

    render();
}

// Setup Functions
function setupPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.80665, 0));
}

function setupGraphics() {
    // Create Clock for Physics Updates
    clock = new THREE.Clock();

    // Create Scene
    scene = new THREE.Scene();

    // Create Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-4, 1.3, 0); // leftside view
    camera.lookAt(new THREE.Vector3(0, 1.3, 0));

    // camera.position.set(0, 7, 0); // top down view
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    camera.position.set(0, 1.3, 2.5); // sentry view
    camera.lookAt(new THREE.Vector3(0, 1.3, 0));

    // Add Lighting
    let lightPositions = [
        {x: 0, y: 20, z: 0},
        {x: 2.5, y: 20, z: 2.5},
        {x: 2.5, y: 20, z: -2.5},
        {x: -2.5, y: 20, z: 2.5},
        {x: -2.5, y: 20, z: -2.5},
    ];

    for (lightPosition of lightPositions) {
        let light = new THREE.PointLight(0xffffff, 0.5, 30, 2);
        light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
        scene.add(light);
    }

    // Setup Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
}

function createBox(pos, scale, color) {
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    // Set Object Graphics
    let geometry = new THREE.BoxBufferGeometry();
    let material = new THREE.MeshPhongMaterial({color: color});
    let box = new THREE.Mesh(geometry, material);

    box.position.set(pos.x, pos.y, pos.z);
    box.scale.set(scale.x, scale.y, scale.z);

    box.castShadow = true;
    box.receiveShadow = true;

    scene.add(box);

    // Set Object Physics
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbcInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbcInfo);

    physicsWorld.addRigidBody(body);
}

function createBall(pos, mass, radius, color) {
    let quat = {x: 0, y: 0, z: 0, w: 1};

    // Set Object Graphics
    let geometry = new THREE.SphereBufferGeometry(radius);
    let material = new THREE.MeshPhongMaterial({color: color});
    let ball = new THREE.Mesh(geometry, material);

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);

    // Set Object Physics
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btSphereShape(radius);
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);

    body.setLinearVelocity(new Ammo.btVector3(0, 4, 8));
    
    ball.userData.physicsBody = body;
    bodies.add(ball);
}

function render(){
    let delta = clock.getDelta();
    updateWorld(delta);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function updateWorld(delta){
    physicsWorld.stepSimulation(delta, 10);

    for (body of bodies) {
        let motionState = body.userData.physicsBody.getMotionState();

        if (motionState) {
            motionState.getWorldTransform(tempTranformation);
            let p = tempTranformation.getOrigin();
            let q = tempTranformation.getRotation();
            body.position.set(p.x(), p.y(), p.z());
            body.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}