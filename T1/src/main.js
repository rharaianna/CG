import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../../libs/util/util.js";

import { Castle } from './models/castle/Castle.js'

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
camera = initCamera(new THREE.Vector3(0, 100, 200)); // Init camera in this position
scene.add(camera); // Add camera to the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

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
let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

const clock = new THREE.Timer();

//jogar aqui td que tem update
const updatables = [];
updatables.push(castle.castleDoor);


render();

function render()
{
  requestAnimationFrame(render);

  clock.update();
  const deltaTime = clock.getDelta();

  updatables.forEach(object => {
        object.update(deltaTime);
  });

  renderer.render(scene, camera) // Render scene
}
