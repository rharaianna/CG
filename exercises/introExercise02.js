import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material,materialshere, materialcylinder, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
materialshere = setDefaultMaterial('lightblue'); // create a basic material
materialcylinder = setDefaultMaterial('green'); 
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let sphereGeometry = new THREE.SphereGeometry(2, 32, 16 );
let sphere = new THREE.Mesh(sphereGeometry, materialshere);
// position the sphere
sphere.position.set(0.0, 2.0, 0.0);
// add the sphere to the scene
scene.add(sphere);

// create a cube
let littlecilinderGeometry = new THREE.CylinderGeometry(1, 1, 1);
let littlecilinder = new THREE.Mesh(littlecilinderGeometry, materialcylinder);
// position the cilinder
littlecilinder.position.set(3.0, 0.5, 0.0);
// add the cilinder to the scene
scene.add(littlecilinder);

// create a cube
let mediumcubeGeometry = new THREE.BoxGeometry(3, 3, 3);
let mediumcube = new THREE.Mesh(mediumcubeGeometry, material);
// position the cube
mediumcube.position.set(6.0, 1.5, 0.0);
// add the cube to the scene
scene.add(mediumcube);

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}