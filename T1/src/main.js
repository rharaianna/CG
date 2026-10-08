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
import { Game } from './Game.js';

// ------------------------ Initial variables ------------------------

const STEPS_PER_FRAME = 5

const scene = new THREE.Scene();    // Create main scene
const light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
const material = setDefaultMaterial(); // create a basic material
const renderer = initRenderer();    // Init a basic renderer



//  ------------------------ LISTENERS ------------------------

document.body.addEventListener('click', function (event) {
  game.shoot()
});

document.body.addEventListener('keydown', function (event) { 
  if (event.key.toLocaleLowerCase() === 'c')
    game.toggleCamera()
});

// pointerControls.addEventListener('unlock', () => {
//   pointerControlsOn = false;
//   orbitControls.enabled = true;
// });

document.addEventListener('mousedown', (evento) => {// disparo
  if (game.pointerControlsOn) {
    if (evento.button === 0 || evento.button === 2) {//0->botao esquerdo e 2->boato direito
      game.shoot(game.playerCamera);
    }
  }
});

document.addEventListener('contextmenu', (evento) => {
  evento.preventDefault();// previne menu de contexto ao apertar botao direito
});

window.addEventListener('resize', function () { 
  onWindowResize(game.playerCamera, renderer) 
}, false);


/// game
const game = new Game(scene, renderer)


// Use this to show information onscreen
let information = new InfoBox();
information.add("Trabalho versão 1.0");
information.addParagraph();
information.add("- Use o mouse para visualizar");
information.add("- Use WASD ou Arrows para movimentar");
information.add("- Aperte c para trocar de câmera");
information.addParagraph();
information.add("por Isadora, João Pedro & Rhara");
information.show();


// ------------------------ COLLISION ------------------------


// Remove da cena tudo que não deve entrar na malha estática de colisão:
//   • portas são dinâmicas (abrem/fecham)
//   • degraus visuais a colisão é feita pela rampa invisível abaixo deles
/* for (const door of castle.doors) {
  castle.object.remove(door.object);
}
for (const { stair, ramp } of castle.stairs) {
  castle.object.remove(stair.object);        // exclui degraus visuais
  ramp.collisionMesh.visible = true;         // ativa rampa para o Octree capturar
}
 */


/* // Restaura o estado visual original após o bake
for (const door of castle.doors) {
  castle.object.add(door.object);
}
for (const { stair, ramp } of castle.stairs) {
  castle.object.add(stair.object);           // devolve degraus visuais
  ramp.collisionMesh.visible = false;        // rampa volta a ser invisível
} */


//jogar aqui td que tem update
const updatables = [];
//updatables.push(...castle.doors) 


const doorPosition = new THREE.Vector3();
const playerPosition = new THREE.Vector3();


render();

function render() {

 
  // temporariamente aqui!!!!
  // quem vai cuidar do render e do clock vai ser o game!!!!
  const deltaTime = game.update();
  
    


 /*  camera.getWorldPosition(playerPosition);
  for (const door of castle.doors) {
    door.object.getWorldPosition(doorPosition);

    const nearDoor =
      playerPosition.distanceTo(doorPosition) <= door.interactionDistance;

    if (nearDoor !== door.isOpen) {
      door.toggleDoor(nearDoor);
    }
  } */

  updatables.forEach(object => {
    object.update(deltaTime);
  });


    

  renderer.render(scene, game.getActiveCamera());
  requestAnimationFrame(render);
}
