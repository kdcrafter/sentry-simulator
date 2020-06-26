var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var showAxis = function(size) {
    var makeTextPlane = function(text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
  
    var axisX = BABYLON.Mesh.CreateLines("axisX", [ 
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
};

var createScene = function () {
    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.80665, 0), new BABYLON.CannonJSPlugin());
    //scene.getPhysicsEngine().setSubTimeStep(10); // to fix objects passing through boxes if needed

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 6, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Add materials and texures
    var blueMaterial = new BABYLON.StandardMaterial("blueMaterial", scene);
    blueMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);

    var greyMaterial = new BABYLON.StandardMaterial("greyMaterial", scene);
    greyMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Add and manipulate meshes in the scene
    var ground = BABYLON.MeshBuilder.CreateBox("ground", {width: 5, height: 0.5, depth: 5}, scene);
    ground.material = greyMaterial;
    ground.position = new BABYLON.Vector3(0, -0.5/2, 0);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.8}, scene);

    var ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.042}, scene);
    ball.position = new BABYLON.Vector3(0, 0.042/2, 0);
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0.383, restitution: 0.8}, scene);

    var sentry = BABYLON.MeshBuilder.CreateBox("sentry", {width: 0.235, height: 0.127, depth: 0.1}, scene);
    sentry.material = blueMaterial;
    sentry.position = new BABYLON.Vector3(-2.5, 1.29, 0);
    sentry.rotation = new BABYLON.Vector3(15 * (Math.PI / 180), 90 * (Math.PI / 180), 0);
    sentry.physicsImpostor = new BABYLON.PhysicsImpostor(sentry, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 1, restitution: 0.8}, scene);
    sentry.physicsImpostor.registerOnPhysicsCollide(ball.physicsImpostor, function(main, collided) {
        console.log("collided");
    });

    // Add controls
    var isPressed = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        isPressed[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        isPressed[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    scene.registerAfterRender(function () {
        // Control sentry with key pressed
        // TODO: add physics to sentry movement (acceleration, rolling friction, etc)
        if (isPressed["z"]) {
            sentry.position.z += 0.05;
        }
        if (isPressed["x"]) {
            sentry.position.z += -0.05;
        }

        if (sentry.position.z > 2.5) {
            sentry.position.z = 2.5;
        }
        if (sentry.position.z < -2.5) {
            sentry.position.z = -2.5;
        }

        // Shoot ball at sentry
        if (isPressed["s"]) {
            ball.position = new BABYLON.Vector3(0, 0.042/2, sentry.position.z);
            velocity = new BABYLON.Vector3(-2, 1.4, 0);
            velocity = velocity.normalize().scale(10);
            ball.physicsImpostor.setLinearVelocity(velocity);
        }
    });

    showAxis(1); // for debuging

    return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});