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
camera.position.set(0, 80, 80)

const gun = new Gun();
const crosshair = document.getElementById('crosshair')
camera.add(gun.object)
scene.add(camera); // Add camera to the scene

const raio = new THREE.Ray();
const pontoAlvo = new THREE.Vector3();
const camDir = new THREE.Vector3();
const AIM_RANGE = 200;

const pointerControls = new PointerLockControls(camera, renderer.domElement); //
const orbitControls = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
orbitControls.enabled = false;
let pointerControlsOn = true;

let podeAtirar = false;
const CADENCIA_TIRO = 0.15; // segundos entre tiros
const bullets = []


//  ------------------------ LISTENERS ------------------------

document.body.addEventListener('click', function (event) {
  if (pointerControlsOn) {
    pointerControls.lock();
    podeAtirar = true;
  }
});

document.body.addEventListener('keydown', function (event) { // alternate controls
  if (event.key.toLocaleLowerCase() === 'c') {// consertar onde a camera orbial começa quando muda, a pointer precisa de c + click
    pointerControlsOn = !pointerControlsOn;

    if (pointerControlsOn) {         // se a camera pointer 
      pointerControls.lock();        // habilita pointer            
      orbitControls.enabled = false; // desabilita orbital
      physics.restorePlayerDirection(camera)          
      podeAtirar = true;             // habilita disparo              
      gun.object.visible = true;     // volta a mostrar a arma        
      crosshair.style.display = '';  // volta a mostrar a crosshair 
    }
    else {
      physics.storePlayerDirection(camera)
      pointerControls.unlock();         // desabilita pointer
      orbitControls.enabled = true;     // habilita orbital
      podeAtirar = false;               // desabilita disparo
      gun.object.visible = false;       // esconde arma
      crosshair.style.display = 'none'; // esconde crosshair
    }
  }
});

// pointerControls.addEventListener('unlock', () => {
//   pointerControlsOn = false;
//   orbitControls.enabled = true;
// });

document.addEventListener('mousedown', (evento) => {// disparo
  if (pointerControlsOn) {
    if (evento.button === 0 || evento.button === 2) {//0->botao esquerdo e 2->boato direito
      shoot(camera);
    }
  }
});

document.addEventListener('contextmenu', (evento) => {
  evento.preventDefault();// previne menu de contexto ao apertar botao direito
});

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);


// ------------------------ CREATE CASTLE ------------------------

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(100);
//scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(300, 300,)
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


for (const door of castle.doors) {
  castle.object.remove(door.object);
}
// for (const stair of castle.stair){
//   castle.object.remove(stair.object);
// }

castle.object.remove(castle.stairRight.object);
castle.object.remove(castle.stairLeft.object);

const worldOctree = new Octree();
worldOctree.fromGraphNode(scene);


for (const door of castle.doors) {
  castle.object.add(door.object);
}
castle.object.add(castle.stairRight.object);
castle.object.add(castle.stairLeft.object);

castle.collisionRamp.collisionMesh.visible = false;   // rampa volta a ser invisível
castle.collisionRamp2.collisionMesh.visible = false; 

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
      physics.playerVelocity.y = 25;
  }
}


function shoot(camera) {
  if (!podeAtirar) return;

  podeAtirar = false;
  setTimeout(() => podeAtirar = true, CADENCIA_TIRO * 1000);

  // garante matrizes atualizadas (câmera e arma)
  camera.updateMatrixWorld(true);

  // raio saindo do centro da câmera
  camera.getWorldPosition(raio.origin);
  camera.getWorldDirection(camDir);
  raio.direction.copy(camDir);

  // ponto que a crosshair está vendo
  const disparo = worldOctree.rayIntersect(raio);
  const dist = disparo ? disparo.distance : AIM_RANGE;
  pontoAlvo.copy(raio.origin).addScaledVector(camDir, dist);

  // direção do cano até esse ponto
  const origin = gun.getPontaCilindro();
  const direction = pontoAlvo.clone().sub(origin);

  // previne caso que se a parede está mais perto que o cano, a direção inverteria
  if (direction.dot(camDir) <= 0) direction.copy(camDir);
  direction.normalize();

  bullets.push(new Bullet(scene, origin, direction));
}

const clock = new THREE.Timer();

//jogar aqui td que tem update
const updatables = [];
updatables.push(...castle.doors)


const doorPosition = new THREE.Vector3();
const playerPosition = new THREE.Vector3();


render();

function render() {


  clock.update();
  const deltaTime1 = clock.getDelta();

  camera.getWorldPosition(playerPosition);
  for (const door of castle.doors) {
    door.object.getWorldPosition(doorPosition);

    const nearDoor =
      playerPosition.distanceTo(doorPosition) <= door.interactionDistance;

    if (nearDoor !== door.isOpen) {
      door.toggleDoor(nearDoor);
    }
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
      physics.teleportPlayerIfOob(camera);
    }

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
