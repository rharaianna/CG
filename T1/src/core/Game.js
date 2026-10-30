import * as THREE from 'three';

import { World } from './World.js';
import { Player } from '../player/Player.js';
import { Octree } from '../../../build/jsm/math/Octree.js';
import { PointerLockControls } from '../../../build/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../../../build/jsm/controls/OrbitControls.js';
import { Gun } from '../models/Gun.js';
import { Objects3D } from '../models/Objects3D.js';

import { initRenderer } from '../../../libs/util/util.js';
import { configureShadows } from '../utils/ShadowUtils.js';
import { Enemy } from '../entity/Enemy.js';
import { enemiesConfig } from '../entity/enemy.config.js';
import { State } from './State.js';
import { Tooltip } from './Tooltip.js';
import { Key } from '../entity/Key.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EVENTS } from './events.enum.js';
import { KEYS, KEYS_CONFIG } from '../entity/key.config.js';



const STEPS_PER_FRAME = 3;
const TIME_TO_SHOOT = 0.2

export class Game {
    constructor() {
        
        this.scene = new THREE.Scene();  
        this.world = new World(this.scene) 
    
        this.renderer = initRenderer('rgba(0, 0, 0, 0.69)', THREE.PCFShadowMap);
        this.state = new State();
        this.lighting()

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

        this.objects = new Objects3D(this.scene)

        this.models = {
            ghost: this.objects.loadGhost(),  
            tree: this.objects.loadTree(),
            crossbow: this.objects.loadCrossbow(),
            arrow: this.objects.loadArrow()
        }

        this.gun = new Gun(this.playerCamera, this.models.crossbow, this.models.arrow); 
        this.scene.add(this.playerCamera)

        configureShadows(this.gun.object);
        //this.playerCamera.add(this.gun.object);

        this.crosshair = document.getElementById('crosshair');

        this.worldOctree = new Octree();
        this.worldOctree.fromGraphNode(this.world.collisionEnabledGroup);

        this.player = new Player(this.worldOctree, this.playerCamera, this.world.getInicialPosition())
        this.pointerControls = new PointerLockControls(
            this.playerCamera, this.renderer.domElement
        )

        this.enemy1 = this.createEnemy(this.world.castle.frontalTowerMovementArea, enemiesConfig.FLYING_SECOND)
        this.enemy2 = this.createEnemy(this.world.castle.secondFloorMovementArea, enemiesConfig.WALKING_SECOND)
        this.enemy3 = this.createEnemy(this.world.castle.towerMovementArea, enemiesConfig.FLYING_FIRST)
        this.enemy4 = this.createEnemy(this.world.castle.internalBuildingMovementArea, enemiesConfig.WALKING_FIRST)

        this.enemies = [this.enemy1, this.enemy2, this.enemy3, this.enemy4]
        this.updateEnemiesDayState()
        //this.enemies = [this.enemy2]

        this.canShoot = true;
        this.timerToShoot = 0
        this.pointerControlsOn = true

        this.bullets = []
        this.keys = new Set()
        this.keysEntity = []


        this.fps = 0;
        this.frames = 0;
        this.fpsTimer = 0;

        this.tooltip = new Tooltip();
        this.updateTooltip();

        configureShadows(this.scene)


        this.labelRenderer = new CSS2DRenderer();

        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);

        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';

        document.body.appendChild(this.labelRenderer.domElement);

    }

    createEnemy(area, config) {
        return new Enemy(this.scene, area, {
            ...config,
            model: this.models[config.model],
        })
    }

    lighting() {

        this.scene.background = new THREE.Color(
            this.state.isDay ? 'rgb(139, 197, 228)' : 'rgb(5, 4, 8)'
        );

        if (!this.dirLight) {

            this.dirLight2 = new THREE.DirectionalLight('rgb(250, 250, 250)');
            this.dirLight2.position.set(-10, 50, -15);
            this.dirLight2.castShadow = false;
            this.scene.add(this.dirLight2);

            this.dirLight = new THREE.DirectionalLight('rgb(255,255,255)');
            this.dirLight.castShadow = true;

            //tamanho da textura da sombra (largura × altura em pixels). Mais pixels = sombra mais nítida
            //tem que ter proporção similar ao frustum
            this.dirLight.shadow.mapSize.set(2048, 4096);
            

            //tem direção, não posição real. A direção é o vetor que vai de position até target
            const cx = 0, cz = 40;
            this.dirLight.target.position.set(cx, 0, cz);
            this.dirLight.position.set(cx+3, 50, cz + 15);
            this.scene.add(this.dirLight.target);

            //Frustum da câmera, É o tamanho do retângulo (em unidades do mundo) que recebe sombra, medido a partir do centro da câmera.
            //Quanto menor o retângulo, mais nítida a sombra
            const cam = this.dirLight.shadow.camera;
            cam.left = -60;
            cam.right = 60;
            cam.top = 110;
            cam.bottom = -110;

            //É a faixa de profundidade, medida a partir da position da luz ao longo da direção dela. Só objetos entre 0.1 e 100 de distância entram no shadow map
            cam.near = 0.1;
            cam.far = 100;
            cam.updateProjectionMatrix();

            //bias: um pequeno deslocamento na profundidade ao comparar. Evita que uma superfície “se sombreie sozinha”
            //normalBias: empurra o ponto de teste para fora ao longo da normal da superfície
            //radius: o quanto a borda da sombra é borrada
            this.dirLight.shadow.bias = -0.0007;
            this.dirLight.shadow.normalBias = 0.2;
            this.dirLight.shadow.radius = 2.5;

            this.scene.add(this.dirLight);
            
            //Camera p debugar a luz
            //this.scene.add(new THREE.CameraHelper(this.dirLight.shadow.camera));
        }

        const ambientColor = this.state.isDay ? 'rgb(254, 225, 251)' : 'rgb(220, 233, 255)';
        const directionalColor = this.state.isDay ? 'rgb(244, 225, 183)' : 'rgb(128, 172, 243)';

        this.dirLight2.color.set(ambientColor);
        this.dirLight2.intensity = this.state.isDay ? 0.8 : 0.4;

        this.dirLight.color.set(directionalColor);
        this.dirLight.intensity = this.state.isDay ? 2 : 0.5;
    }

    setDay(isDay) {
        this.state.isDay = isDay;
        this.lighting();
        this.updateEnemiesDayState();
    }

    updateEnemiesDayState() {
        const enemiesEnabled = !this.state.isDay
        this.enemies.forEach(enemy => enemy.setEnabled(enemiesEnabled))
    }

    start() {
        this.renderer.setAnimationLoop(() => this.render());
    }

    togglePlayerControl() {
        this.pointerControlsOn = !this.pointerControlsOn
    }

    render() {
        this.update();
        this.renderer.render(this.scene, this.getActiveCamera());
        this.labelRenderer.render(this.scene, this.getActiveCamera());
    }

    updateTooltip() {
        this.tooltip.updateText(`${this.fps} FPS - ${this.keys.size}`)
    }

    updateKeys() {
        this.tooltip.updateKeys(Array.from(this.keys))
    }

    update() {
        this.clock.update();
        const deltaTime = Math.min(0.05, this.clock.getDelta());
        
        this.frames++;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 1) {
            this.fps = this.frames;

            this.frames = 0;
            this.fpsTimer = 0;
        }

        // regarga do tiro aqui
        if (!this.canShoot && this.pointerControlsOn) {
            this.timerToShoot += deltaTime
            if (this.timerToShoot >= TIME_TO_SHOOT) {
                this.canShoot = true
                this.timerToShoot = 0
            }
        }

        this.gun.update();
        this.gun.setArrowVisible(this.canShoot && this.pointerControlsOn)
        
        this.updateTooltip();
        // so se tiver na camera correta
        this.updatePlayer(deltaTime)
        this.updateOrbitControls()

        // cuida de atualizar todos os casos do mundo
        // e interações so se o jogador tiver se movendo
        this.world.update(deltaTime, this.player.getPosition(), this.player.isMoving, (event) => this.handleEvent(event))

        // atualiza a movimentação e detecção só se o jogador 
        // tiver se movendo
        this.updateEnemies(deltaTime)
        this.updateKeysEntities(deltaTime)
    
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

    updateEnemies(deltaTime) {

        if (!this.enemies.length) return;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            enemy.update(
                deltaTime,
                this.player.getPosition(),
                this.player.isMoving
            );

            if (!enemy.alive) {
                this.enemies.splice(i, 1);
            }
        }

    }

    updateKeysEntities(deltaTime) {
        if (!this.keysEntity.length) return;

        for (let i = this.keysEntity.length - 1; i >= 0; i--) {
            const key = this.keysEntity[i];

            key.update(
                deltaTime,
                this.worldOctree,
                this.player.getPosition(),
                this.player.isMoving
            );

            // so adiciono a chave quando ela for coletada!!
            if (!key.alive) {
                this.keys.add(key.getKey())
                this.updateKeys()
                this.keysEntity.splice(i, 1);
            }
        }
    }

    updateBullets(deltaTime) {
        if (!this.bullets.length) return;

        const physicsDelta = deltaTime / STEPS_PER_FRAME;

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const bullet = this.bullets[j];

                bullet.update(physicsDelta);
                this.resolveBulletCollision(bullet);

                if (!bullet.alive) {
                    this.bullets.splice(j, 1);
                }
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

    onBulletHitEnemy(bullet, enemy) {
        const killed = enemy.onHit(bullet.damage)
        bullet.destroy()

        const key = enemy.getKey()
        const position = enemy.getPosition()

        const config = {
            key,
            position
        }

        if (killed) {
            this.spawnKey(config)
        }
    }

    findClosestEnemyHit(ray, maxDistance) {
        let closest = null
        let closestDist = Infinity

        const hitPoint = new THREE.Vector3()

        // verifica para cada inimigo se tem algum inimigo que foi atingido nesse frame
        for (const enemy of this.enemies) {
            if (!enemy.enabled)
                continue
            
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
        this.timerToShoot = 0
        
        // // tempo necessário para liberar o tiro
        // const TIME_NEEDED_TO_SHOOT = 0.5; 
        
        // if(this.timerToShoot >= TIME_NEEDED_TO_SHOOT) {
        //     this.canShoot = true
        //     this.timerToShoot = 0
        //     this.gun.restArrow.visible = true
        // }
        
    }

    spawnKey(config) {

        const key = new Key(this.scene, config)
        this.keysEntity.push(key)
    }

    // função para a gente poder organizar melhor os eventos do jogo
    // criado pra tratar caso do receptaculo consumir as chaves
    handleEvent(event) {
        
        const { type, body } = event
        console.log(event);

        // identifica cada caso e retorna para onde a função foi chamada
        switch(type) {
            case EVENTS.CONSUME_KEY:
                return this.handleConsumeKey(body)

        }
    }

    handleConsumeKey(body) {
        const { key } = body 

        // remove a chave e retorna se deu certo
        if(this.keys.has(key)) {
            this.keys.delete(key)
            this.updateKeys()
            return true
        } else return false
    }

    collectAllKeys() {
        Object.values(KEYS).forEach(key => {
            this.keys.add(key);
        });

        this.updateKeys();
    }

}
