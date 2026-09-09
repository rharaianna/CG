import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { Octree } from '../../build/jsm/math/Octree.js';
import { OctreeHelper } from '../../build/jsm/helpers/OctreeHelper.js';

import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../../libs/util/util.js";

import { Castle } from './models/castle/Castle.js'
import { PlayerController } from './player/PlayerController.js';
import { PlayerPhysics } from './player/PlayerPhysics.js';


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


// ------------------------ COLLISION ------------------------

const worldOctree = new Octree();
worldOctree.fromGraphNode(scene)
const player = new PlayerController();
const physics = new PlayerPhysics(worldOctree);

const STEPS_PER_FRAME = 5



//  ------------------------ LISTENERS ------------------------

document.body.addEventListener('click', function() {controls.lock();});
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();


//  ------------------------ FUNCTIONS ------------------------

function moveControls(deltaTime){
    const speedDelta = deltaTime * (player.playerOnFloor ? 100 : 50)

    if(player.moveForward){
        physics.playerVelocity.add(physics.getForwardVector(camera).multiplyScalar(speedDelta))
    }
    if(player.moveBackward){
        physics.playerVelocity.add(physics.getForwardVector(camera).multiplyScalar(-speedDelta))
    }

    if(player.moveLeft){
        physics.playerVelocity.add(physics.getSideVector(camera).multiplyScalar(-speedDelta))
    }
    if(player.moveRight){
        physics.playerVelocity.add(physics.getSideVector(camera).multiplyScalar(speedDelta))
    }

    if(physics.playerOnFloor){
        if (player.moveUp)
            physics.playerVelocity.y = 40;
    }
}




function render()
{
    timer.update();

    const deltaTime = Math.min(0.05, timer.getDelta())/STEPS_PER_FRAME

    for(let i=0; i< STEPS_PER_FRAME; i++){
        if(controls.isLocked){
            moveControls(deltaTime)
            physics.updatePlayer(deltaTime)
            camera.position.copy(physics.playerCollider.end);
        }
        physics.teleportPlayerIfOob(camera);
    }

    renderer.render(scene, camera)
    requestAnimationFrame(render);
}

// Use this to show information onscreen
// let controls = new InfoBox();
//   controls.add("Basic Scene");
//   controls.addParagraph();
//   controls.add("Use mouse to interact:");
//   controls.add("* Left button to rotate");
//   controls.add("* Right button to translate (pan)");
//   controls.add("* Scroll to zoom in/out.");
//   controls.show();