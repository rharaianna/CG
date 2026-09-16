import * as THREE from 'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { Octree } from '../../build/jsm/math/Octree.js';
import { OctreeHelper } from '../../build/jsm/helpers/OctreeHelper.js';


import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ
} from "../../libs/util/util.js";

import { Castle } from './models/castle/Castle.js'
import { PlayerController } from './player/PlayerController.js';
import { PlayerPhysics } from './player/PlayerPhysics.js';
import { Bullet } from './player/Bullet.js';
import { Gun } from './models/Gun.js';
import { Door } from './models/structures/Door.js';

// ------------------------ Initial variables ------------------------
const timer = new THREE.Timer();
timer.connect(document)

const scene = new THREE.Scene();    // Create main scene
const light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
const material = setDefaultMaterial(); // create a basic material
const renderer = initRenderer();    // Init a basic renderer

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ'

const gun = new Gun();
gun.object.add(new THREE.AxesHelper(0.3));
camera.add(gun.object)
scene.add(camera); // Add camera to the scene

const pointerControls = new PointerLockControls(camera, renderer.domElement); //
const orbitControls = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
orbitControls.enabled = false;
let pointerControlsOn = true;

const bullets = []

const raycaster = new THREE.Raycaster();
const alvosAtivos = []; // seus inimigos/objetos atingíveis
const particulasImpacto = []; // pool simples de efeitos

let podeAtirar = true;
const CADENCIA_TIRO = 0.15; // segundos entre tiros


//  ------------------------ LISTENERS ------------------------

document.body.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && pointerControlsOn) {
        pointerControls.lock();
    }
});

// document.body.addEventListener('keydown', function (event) { // alternate controls
//   if (event.key.toLocaleLowerCase() === 'c') {// consertar onde a camera orbial começa quando muda, a pointer precisa de c + click
//     pointerControlsOn = !pointerControlsOn;

//     if (pointerControlsOn) { // 
//       orbitControls.enabled = false;
//       podeAtirar =  true;
//     } else {
//       pointerControls.unlock();
//       orbitControls.enabled = true;
//       podeAtirar = false;
//     }
//   }
// });


document.addEventListener('mousedown', (evento) => {
  if (evento.button === 0) shoot(camera);
});

pointerControls.addEventListener('unlock', () => {
    pointerControlsOn = false;
    orbitControls.enabled = true;
});

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);


// ------------------------ CREATE CASTLE ------------------------

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(300, 300)
scene.add(plane);

// tamanhos aproximados do castelo
const CASTLE_WIDTH = 40
const CASTLE_DEPTH = 46
const SCALE = 1
const CASTLE_X = 0
const CASTLE_Y = 0
const CASTLE_Z = 0
let castle = new Castle(CASTLE_X, CASTLE_Y, CASTLE_Z, null, CASTLE_WIDTH, CASTLE_DEPTH, SCALE)
scene.add(castle.object)
castle.hideBoundingBox()
//castle.showBoundingBox(scene);

// Use this to show information onscreen
let information = new InfoBox();
information.add("Basic Scene");
information.addParagraph();
information.add("Use mouse to interact:");
information.add("* Left button to rotate");
information.add("* Right button to translate (pan)");
information.add("* Scroll to zoom in/out.");
information.show();


// ------------------------ COLLISION ------------------------

// A porta continua visível, mas fica fora da malha estática de colisão.
castle.object.remove(castle.castleDoor.object);

const worldOctree = new Octree();
worldOctree.fromGraphNode(scene);

castle.object.add(castle.castleDoor.object);

const player = new PlayerController();
const physics = new PlayerPhysics(worldOctree);

const STEPS_PER_FRAME = 5


//  ------------------------ FUNCTIONS ------------------------

function moveControls(deltaTime) {
  const speedDelta = deltaTime * (player.playerOnFloor ? 100 : 50)

  if (player.moveForward) {
    physics.playerVelocity.add(physics.getForwardVector(camera).multiplyScalar(speedDelta))
  }
  if (player.moveBackward) {
    physics.playerVelocity.add(physics.getForwardVector(camera).multiplyScalar(-speedDelta))
  }

  if (player.moveLeft) {
    physics.playerVelocity.add(physics.getSideVector(camera).multiplyScalar(-speedDelta))
  }
  if (player.moveRight) {
    physics.playerVelocity.add(physics.getSideVector(camera).multiplyScalar(speedDelta))
  }

  if (physics.playerOnFloor) {
    if (player.moveUp)
      physics.playerVelocity.y = 40;
  }
}


function shoot(camera){
    if(!podeAtirar) return;
    
    podeAtirar = false;
    setTimeout(() => podeAtirar = true, CADENCIA_TIRO * 100);

    const origin = gun.getPontaCilindro();
    const direction = camera.getWorldDirection(new THREE.Vector3());

    const bullet = new Bullet(scene, origin, direction)
    bullets.push(bullet)
}

const clock = new THREE.Timer();

//jogar aqui td que tem update
const updatables = [];
updatables.push(castle.castleDoor);
const doorPosition = new THREE.Vector3();
const playerPosition = new THREE.Vector3();


render();

function render() {
  
  
  clock.update();
  const deltaTime1 = clock.getDelta();
  
  camera.getWorldPosition(playerPosition);
  castle.castleDoor.object.getWorldPosition(doorPosition);

  const nearDoor = playerPosition.distanceTo(doorPosition) < 4;

  if (nearDoor !== castle.castleDoor.isOpen) {
    castle.castleDoor.toggleDoor(nearDoor);
  }

  updatables.forEach(object => {
    object.update(deltaTime1);
  });
    //debugSphere.position.copy(gun.getPontaCilindro());

  timer.update();
  const deltaTime = Math.min(0.05, timer.getDelta()) / STEPS_PER_FRAME

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

        if (orbitControls.enabled) {
            orbitControls.update();
        }
        if (pointerControls.isLocked) {
            moveControls(deltaTime);
            physics.updatePlayer(deltaTime);
            camera.position.copy(physics.playerCollider.end);
        }
        physics.teleportPlayerIfOob(camera);

        // balas atualizadas junto com a física
        for (let j = bullets.length - 1; j >= 0; j--) {
            bullets[j].update(deltaTime, worldOctree, scene);
            if (!bullets[j].alive) {
                bullets.splice(j, 1);
            }
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
