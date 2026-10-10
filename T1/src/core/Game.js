import * as THREE from 'three';

import { World } from './World.js';
import { Player } from '../player/Player.js';
import { Octree } from '../../../build/jsm/math/Octree.js';
import { PointerLockControls } from '../../../build/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../../../build/jsm/controls/OrbitControls.js';
import { Gun } from '../models/Gun.js';

import { initRenderer, initDefaultBasicLight, SecondaryBox } from '../../../libs/util/util.js';
import { Enemy } from '../entity/Enemy.js';
import { enemiesConfig } from '../entity/enemy.config.js';

const STEPS_PER_FRAME = 3;

export class Game {
    constructor() {
        
        this.scene = new THREE.Scene();  
        this.world = new World(this.scene) 
        this.renderer = initRenderer()

        // luz temporária
        this.light = initDefaultBasicLight(this.scene); 

        this.clock = new THREE.Timer();
        this.clock.connect(document);

        this.playerCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.playerCamera.rotation.order = 'YXZ'
        this.playerCamera.position.set(0, 80, 80)

        this.orbitPosition = new THREE.Vector3(0, 80, 80);
        this.orbitTarget = new THREE.Vector3(0, 0, 0);
        
        this.orbitCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.orbitCamera.position.copy(this.orbitPosition);
        
        this.orbitControls = new OrbitControls(this.orbitCamera, this.renderer.domElement);
        this.orbitControls.target.copy(this.orbitTarget);

        this.orbitControls.enabled = false;
        this.orbitControls.update();

        this.gun = new Gun(this.playerCamera); 
        //this.playerCamera.add(this.gun.object);

        this.crosshair = document.getElementById('crosshair');

        this.worldOctree = new Octree();
        this.worldOctree.fromGraphNode(this.world.collisionEnabledGroup);

        this.player = new Player(this.worldOctree, this.playerCamera)
        this.pointerControls = new PointerLockControls(
            this.playerCamera, this.renderer.domElement
        )

        this.enemy1 = new Enemy(this.scene, this.world.castle.movementArea1, enemiesConfig.WALKING_PURPLE)
        this.enemy2 = new Enemy(this.scene, this.world.castle.movementArea2, enemiesConfig.FLYING_BLUE)

        this.enemies = [this.enemy1, this.enemy2]

        this.canShoot = false;
        this.timerToShoot = 0
        this.pointerControlsOn = true

        this.bullets = []
        this.keys = 0


        this.fps = 0;
        this.frames = 0;
        this.fpsTimer = 0;

        this.tooltip = new SecondaryBox()

    }

    start() {
        this.renderer.setAnimationLoop(() => this.render());
    }

    togglePlayerControl() {
        this.pointerControlsOn = !this.pointerControlsOn
    }

    render() {
        this.update();

        this.renderer.render(
            this.scene,
            this.getActiveCamera()
        );
    }

    updateTooltip() {
        this.tooltip.changeMessage(`${this.fps} FPS`)
    }

    update() {
        
        this.updateTooltip()

        this.clock.update();
        const deltaTime = Math.min(0.05, this.clock.getDelta());
        this.timerToShoot += deltaTime
        
        this.frames++;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 1) {
            this.fps = this.frames;

            this.frames = 0;
            this.fpsTimer = 0;
        }
        
        // so se tiver na camera correta
        this.updatePlayer(deltaTime)
        this.updateOrbitControls()

        // cuida de atualizar todos os casos do mundo
        // e interações so se o jogador tiver se movendo
        this.world.update(deltaTime, this.player.getPosition(), this.player.isMoving)

        // atualiza a movimentação e detecção só se o jogador 
        // tiver se movendo
        this.enemy1.update(deltaTime, this.player.getPosition(), this.player.isMoving)
        this.enemy2.update(deltaTime, this.player.getPosition(), this.player.isMoving)
        
        // so se tiver balas ativas
        this.updateBullets(deltaTime)
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

        if(!this.bullets.length)
            return

        const physicsDelta = deltaTime / STEPS_PER_FRAME

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            this.bullets.forEach((bullet, i) => {
                bullet.update(physicsDelta)
                this.resolveBulletCollision(bullet)
    
                if (!bullet.alive)
                    this.bullets.splice(i, 1)
            })
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

    onBulletHitEnemy(bullet, enemy) {
        const killed = enemy.onHit(bullet.damage)
        bullet.destroy()

        if (killed) {
            this.keys += 1
        }
    }

    findClosestEnemyHit(ray, maxDistance) {
        let closest = null
        let closestDist = Infinity

        const hitPoint = new THREE.Vector3()

        // verifica para cada inimigo se tem algum inimigo que foi atingido nesse frame
        for (const enemy of this.enemies) {
            
            if (enemy.life <= 0)
                continue

            if (!ray.intersectBox(enemy.hitbox, hitPoint)) 
                continue

            const distanceToEnemy = ray.origin.distanceTo(hitPoint)

            if (distanceToEnemy <= maxDistance && distanceToEnemy < closestDist) {
                closestDist = distanceToEnemy
                closest = enemy
            }
        }

        return { 
            enemy: closest, 
            distanceToEnemy: closestDist 
        }
    }

    resolveBulletCollision(bullet) {
        // se a bala já morreu por distância, não testa nada
        if (!bullet.alive) 
            return

        // pego o raio e a distancia percorrida em relação ao último frame
        const { ray, distance } = bullet.getSweep()

        if (distance === 0) 
            return

        // ve se a distancia que o raio intersepta a parede é menor ou igual 
        // à que ele percorreu
        const wall = this.worldOctree.rayIntersect(ray)
        let distanceToWall = Infinity

        if(wall && wall?.distance <= distance) {
            distanceToWall = wall.distance
        }

        // ve se atingiu inimigo com a distancia que o ray percorreu
        const { enemy, distanceToEnemy } = this.findClosestEnemyHit(ray, distance)

        // inimigo tava na frente da parede 
        if (enemy && distanceToEnemy < distanceToWall) {
            this.onBulletHitEnemy(bullet, enemy)   
        } 
        
        // bateu na parede
        else if (distanceToWall !== Infinity) {
            bullet.destroy()                       
        }
    }

    shoot() {

        if(this.canShoot && this.pointerControlsOn) {
            this.pointerControls.lock()
            this.gun.shoot(this.scene, this.playerCamera, this.bullets, this.worldOctree)
        }
        
        // fica falso até completar os segundos entre tiros
        this.canShoot = false;
        
        // tempo necessário para liberar o tiro
        const TIME_NEEDED_TO_SHOOT = 0.5; 
        
        if(this.timerToShoot >= TIME_NEEDED_TO_SHOOT) {
            this.canShoot = true
            this.timerToShoot = 0
        }
        
    }
}