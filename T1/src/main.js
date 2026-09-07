import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { Octree } from '../../build/jsm/math/Octree.js';
import { OctreeHelper } from '../../build/jsm/helpers/OctreeHelper.js';
import { Capsule } from '../../build/jsm/math/Capsule.js';

import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../../libs/util/util.js";

import { Castle } from './models/castle/Castle.js'


// ------------------------ Initial variables ------------------------
const timer = new THREE.Timer();
timer.connect(document)

const scene = new THREE.Scene();    // Create main scene
const light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
const material = setDefaultMaterial(); // create a basic material
const renderer = initRenderer();    // Init a basic renderer

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ'
scene.add(camera); // Add camera to the scene

const orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
const controls = new PointerLockControls(camera, renderer.domElement); //


// ------------------------ CREATE CASTLE ------------------------

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(300, 300)
scene.add(plane);

const CASTLE_WIDTH = 100
const CASTLE_DEPTH = CASTLE_WIDTH * 3/2
const SCALE = 1
const CASTLE_X = 10
const CASTLE_Y = 0
const CASTLE_Z = 10

let castle = new Castle(CASTLE_X, CASTLE_Y, CASTLE_Z, null, CASTLE_WIDTH, CASTLE_DEPTH, SCALE)
scene.add(castle.object)
castle.showBoundingBox(scene);


// ------------------------ CAMERA ------------------------
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// ------------------------ COLLISION ------------------------

const worldOctree = new Octree();
worldOctree.fromGraphNode(scene)

const GRAVITY = 30
const STEPS_PER_FRAME = 5
const playerCollider = new Capsule(new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();


// Use this to show information onscreen
// let controls = new InfoBox();
//   controls.add("Basic Scene");
//   controls.addParagraph();
//   controls.add("Use mouse to interact:");
//   controls.add("* Left button to rotate");
//   controls.add("* Right button to translate (pan)");
//   controls.add("* Scroll to zoom in/out.");
//   controls.show();



//  ------------------------ LISTENERS ------------------------

document.body.addEventListener('click', function () {
    controls.lock();
});

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();


//  ------------------------ FUNCTIONS ------------------------

function playerCollisions(){

    playerOnFloor = false;

    for(let i = 0; i < 3; i++){
        const result = worldOctree.capsuleIntersect(playerCollider);
        if(!result) break;

        if(result.normal.y >= 0.15){
            playerOnFloor = true;
        } else {
            playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
        }

        if(result.depth >= 1e-10){
            playerCollider.translate(result.normal.multiplyScalar(result.depth));
        }
    }
}

function updatePlayer(deltaTime){
    let damping = Math.exp(-4*deltaTime) - 1;

    if(!playerOnFloor){
        playerVelocity.y -= GRAVITY * deltaTime;
        damping *= 0.1 //resitencia ao ar
    }

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    playerCollisions();

    camera.position.copy(playerCollider.end);

}

function getForwardVector(){
    camera.getWorldDirection(playerDirection);
    playerDirection.y =0
    playerDirection.normalize();

    return playerDirection;
}

function getSideVector(){
    camera.getWorldDirection(playerDirection);
    playerDirection.y =0
    playerDirection.normalize();
    playerDirection.cross(camera.up)

    return playerDirection;
}

function movementControls(key, value) {
    switch (key) {
        case 38:
        case 87: // W
            moveForward = value;
            break;
        
        case 40:
        case 83: // S
            moveBackward = value;
            break;

        case 37:
        case 65: // A
            moveLeft = value;
            break;
        
        case 39:
        case 68: // D
            moveRight = value;
            break;
        case 32: //space
            moveUp = value;
            break;
        case 16: // shift
            moveDown = value;
            break;
    }
}


function moveControls(deltaTime){
    const speedDelta = deltaTime * (playerOnFloor ? 100 : 70)

    if(moveForward){
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta))
    }
    if(moveBackward){
        playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta))
    }

    if(moveLeft){
        playerVelocity.add(getSideVector().multiplyScalar(-speedDelta))
    }
    if(moveRight){
        playerVelocity.add(getSideVector().multiplyScalar(speedDelta))
    }

    if(playerOnFloor){
        if(moveUp){
            playerVelocity.y = 70;
        }
    }
}



function teleportPlayerIfOob() {
	if ( camera.position.y <= - 25 ) {
		playerCollider.start.set( 0, 0.35, 0 );
		playerCollider.end.set( 0, 1, 0 );
		playerCollider.radius = 0.35;
		camera.position.copy( playerCollider.end );
		camera.rotation.set( 0, 0, 0 );
    }
}



function render()
{
    timer.update();

    const deltaTime = Math.min(0.05, timer.getDelta())/STEPS_PER_FRAME

    for(let i=0; i< STEPS_PER_FRAME; i++){
        if(controls.isLocked){
            moveControls(deltaTime)
            updatePlayer(deltaTime)
        }
        teleportPlayerIfOob();
    }

    renderer.render(scene, camera)
    requestAnimationFrame(render);
}
