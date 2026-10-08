import * as THREE from 'three';

import { World } from './World.js';
import { Player } from './player/Player.js';
import { Octree } from '../../build/jsm/math/Octree.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import { Gun } from './models/Gun.js';

const STEPS_PER_FRAME = 5;
export class Game {
    constructor(scene, renderer) {
        
        this.scene = scene
        this.world = new World(scene) 
        this.renderer = renderer

        this.clock = new THREE.Timer();
        this.clock.connect(document);

        this.playerCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.playerCamera.rotation.order = 'YXZ'
        this.playerCamera.position.set(0, 80, 80)

        this.orbitPosition = new THREE.Vector3(0, 80, 80);
        this.orbitTarget = new THREE.Vector3(0, 0, 0);
        
        this.orbitCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.orbitCamera.position.copy(this.orbitPosition);
        
        
        this.orbitControls = new OrbitControls(this.orbitCamera, renderer.domElement);
        this.orbitControls.target.copy(this.orbitTarget);

        this.orbitControls.enabled = false;
        this.orbitControls.update();

        this.gun = new Gun(); 
        this.playerCamera.add(this.gun.object);

        this.crosshair = document.getElementById('crosshair');

        this.worldOctree = new Octree();
        this.worldOctree.fromGraphNode(scene);

        this.player = new Player(this.worldOctree, this.playerCamera)
        this.pointerControls = new PointerLockControls(
            this.playerCamera, this.renderer.domElement
        )

        this.canShoot = false;
        this.timerToShoot = 0
        this.pointerControlsOn = true

        this.bullets = []
        
    }

    start() {
        this.render()
    }

    togglePlayerControl() {
        this.pointerControlsOn = !this.pointerControlsOn
    }

    update() {
        this.clock.update();

        const deltaTime = Math.min(
            0.05,
            this.clock.getDelta()
        );

        this.world.update(deltaTime);
        this.updatePlayer(deltaTime)
        this.updateOrbitControls()
        this.updateBullets(deltaTime)
    
        return deltaTime
    };

    updatePlayer(deltaTime) {

        if(!this.pointerControlsOn || !this.pointerControls.isLocked) {
            return
        }

        const physicsDelta = deltaTime / STEPS_PER_FRAME;

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            this.player.update(physicsDelta);
        }
    }

    updateOrbitControls() {
        if(this.orbitControls.enabled)
            this.orbitControls.update();
    }

    updateBullets(deltaTime) {

        let physicsDelta = deltaTime / STEPS_PER_FRAME
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            // balas atualizadas junto com a física
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                this.bullets[j].update(physicsDelta, this.worldOctree, this.scene);
                
                if (!this.bullets[j].alive) 
                    this.bullets.splice(j, 1);
                
            }
        } 
    }

    getActiveCamera() {

        if (this.pointerControlsOn) {
            return this.playerCamera;
        }

        return this.orbitCamera;
    }
    
    toggleCamera() {
        this.pointerControlsOn = !this.pointerControlsOn;

        if (this.pointerControlsOn) {
            this.enablePlayerCamera()
        } else {
           this.enableOrbitCamera()
        }
    }

    enablePlayerCamera() {
        // camera do jogador
        this.pointerControls.lock();
        this.orbitControls.enabled = false;

        this.player.physics.restorePlayerDirection(
            this.playerCamera
        );

        // Interface
        this.canShoot = true;
        this.gun.object.visible = true;
        this.crosshair.style.display = '';
    }

    enableOrbitCamera() {

        // camera orbital
        this.player.physics.storePlayerDirection(
            this.playerCamera
        );

        this.pointerControls.unlock();

        this.orbitCamera.position.copy(this.orbitPosition);
        this.orbitControls.target.copy(this.orbitTarget);

        this.orbitControls.enabled = true;
        this.orbitControls.update();

        this.canShoot = false;
        this.gun.object.visible = false;
        this.crosshair.style.display = 'none';
    }

    shoot() {

        if(this.canShoot && this.pointerControlsOn) {
            this.pointerControls.lock()
            this.gun.shoot(this.scene, this.playerCamera, this.bullets, this.worldOctree)
        }
        
        // fica falso até completar os segundos entre tiros
        this.canShoot = false;
        const CADENCIA_TIRO = 0.15; 
    
        setTimeout(() => {
            this.canShoot = true
        }, CADENCIA_TIRO * 1000);

    }
}