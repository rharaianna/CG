import * as THREE from 'three';
import { materials } from '../models/material.configs.js';
import { STATUS, BEHAVIOR } from './enemy.enums.js';
import { Entity } from './Entity.js';
import * as SkeletonUtils from "../../../build/jsm/utils/SkeletonUtils.js"
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { KEYS_CONFIG } from './key.config.js';

export class Enemy extends Entity {
    constructor(scene, movementArea, config) {
        super(scene)

        const {
            name, 
            dimensions, 
            key,
            life,
            behavior,
            speed,
            model,
            minProximity
        } = config

        this.config = config
        this.scene = scene
        this.respawn = false
        this.enabled = true
        this.enemyDimensions = dimensions
        this.speed = speed
        this.life = life

        // pega a chave e a cor correspondente
        this.key = key;
        this.color = KEYS_CONFIG[key].color;

        this.model = model
        this.ghost = null
        this.minProximity = minProximity

        // inicia parado
        this.status = STATUS["STILL"]

        // define area onde vai ter movimento
        this.behavior = behavior
        
        this.movementArea = movementArea
        this.center = movementArea.getStartPosition(this.enemyDimensions)
        this.position = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        this.destiny = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        
        this.timer = 0
        this.scale = 1
        this.walkTime = Math.random() * Math.PI * 2; // fase aleatória
    
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x444444, 
            transparent: true, 
            opacity: 0.6, 
        });

        this.body = new THREE.Mesh(
            new THREE.BoxGeometry(
                this.enemyDimensions.width, 
                this.enemyDimensions.height, 
                this.enemyDimensions.depth
            ), 
            material
        )

        this.body.position.copy(this.position)
        material.visible = !model 
        this.mesh.add(this.body)

        // hitbox
        this.hitbox = new THREE.Box3()
        this.updateHitbox()

        this.light = new THREE.PointLight(this.color, 100, 100)
        this.mesh.add(this.light)
                    
        const hud = document.createElement('div');
        hud.className = 'hud';
            hud.innerHTML = `
            <div class="name" style="color: ${this.color}">${name}</div>
            <div class="name">${this.behavior == BEHAVIOR.WALKING ? "Rastejante" : "Voador" }</div>
            <div class="health-bar">
                <div class="fill"></div>
            </div>
        `;
        
        this.hudObject = new CSS2DObject(hud);
        this.hudObject.position.set(0, 3, 0); 
        this.hudTimer = 0
        
        this.mesh.add(this.hudObject)
        this.scene.add(this.mesh)
    }

    updateHud(deltaTime) {

        // vai mostrar por alguns segundos
        const visibleTime = 3
        if(this.hudObject.visible) 
            this.hudTimer += deltaTime
        
        const pos = this.position.clone()
        pos.y += this.enemyDimensions.height
        this.hudObject.position.copy(pos)

        const fill = this.hudObject.element.querySelector(".fill")
        const perc = Math.floor((this.life / this.config.life) * 100);
        fill.style.width = `${perc}%`

        if(this.hudTimer > visibleTime) {
            this.hudObject.visible = false
            this.hudTimer = 0
        }
    }

    // vai ser chamado quando chegar na direção
    // inimigo fica parado por um tempo e dps gera outro local
    moveToAnotherPlace(deltaTime) {
        // um tempo de parada aleatório
        const stillTime = 1 + Math.random() * 3

        this.timer += deltaTime

        if(this.timer >= stillTime) {
            this.timer = 0
            this.generateDestiny()
        }
    }

    updateHitbox() {// se nao precisar volta pro jeito q tava antes
        this.body.updateWorldMatrix(true, false)

        if (!this.body.geometry.boundingBox) {
            this.body.geometry.computeBoundingBox()
        }

        this.hitbox
            .copy(this.body.geometry.boundingBox)
            .applyMatrix4(this.body.matrixWorld)
    }

    onHit(damage = 1) {
        this.life -= damage

        if (this.life <= 0) 
            this.kill()
        else if (this.status != STATUS.ATTACK)
            this.status = STATUS.ATTACK

        return this.life <= 0
    }

    // calcula uma posição pra ir e muda o seu comportamento
    generateDestiny() {
        if(this.status == STATUS["STILL"]) {
            this.destiny = this.movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
            this.status = STATUS["WALKING"]
        }
    }      

    // a chave tem a exata cor do inimigo
    getKey() {
        return this.key
    }

    getPosition() {
        return this.position.clone()
    }

    move(deltaTime) {

        // calcula a direção que deve ir e a distancia que está
        const direction = new THREE.Vector3().subVectors(this.destiny, this.position).normalize()
        const distance = this.position.distanceTo(this.destiny);
        const movement = this.speed * deltaTime;

        const walkRotationAmplitude = 0.02

        // se tiver chegado, vai pro comportamento de outro lugar
        if (distance <= movement) {
            this.position.copy(this.destiny);
            this.body.position.copy(this.position);
   
            this.status = STATUS.STILL;
            this.timer = 0;
            this.walkTime = 0;
            
            // nao se movimenta e buga tudo
            return;
        } 

        // rotaciona na direção do movimento
        this.body.lookAt(this.position.clone().add(direction));
        
        // oscilação durante a caminhada
        this.walkTime += deltaTime;
        this.body.rotation.z += Math.sin(this.walkTime * 10) * walkRotationAmplitude;
        this.body.rotation.y += Math.sin(this.walkTime * 10) * walkRotationAmplitude;
        
        // se movimenta
        this.position.add(direction.multiplyScalar(movement));
        this.body.position.copy(this.position);
    }

    // quando o inimigo for walking ele vai ter uma distancia menor
    checkDistanceToCenter() {

        if(this.status != STATUS.ATTACK)
            return

        const maxWalkingDistance = 10
        const distance = this.position.distanceTo(this.center);
    
        // distancia máxima que pode sair do raio
        // da região 
        if(distance >= this.movementArea.maxDistance) {
            // mas na verdade voltaria pro centro
            this.status = STATUS.STILL
            this.destiny.copy(this.center)
        }

    }

    // persegue e olha pro jogador até certo ponto
    atack(deltaTime, playerPosition) {
        
        // olha pro jogador
        const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize()
        this.body.lookAt(playerPosition.x, this.body.position.y, playerPosition.z)

        // distancia que fica do jogador
        const distance = this.position.distanceTo(playerPosition);
        
        if(this.behavior == BEHAVIOR.WALKING) {
            
            const maxDistance = 25

            // desiste de atacar quando chega numa posição
            if(distance > maxDistance) {
                this.status = STATUS.STILL
            }
        }

        // se for voador sempre segue o player até ele sair da região
        if(this.behavior == BEHAVIOR.FLYING) {
            this.destiny.copy(this.position).add(
                direction.multiplyScalar(distance - 5)
            );
            this.move(deltaTime)
        }
    }

    kill(deltaTime) {
        const factor = 0.05
        this.scale -= factor
        this.body.scale.setScalar(this.scale);

        if(this.scale < 0) {
            this.timer = 0
            this.destroy()
            return
        }
    }

    // reinicia
    start(deltaTime) {
        this.position.copy(this.center)
        this.destiny.copy(this.center)
        this.body.position.copy(this.center)
        this.life = 3
        
        // depois de 2 segundos
        const stillTime = 1

        this.timer += deltaTime

        if(this.timer >= stillTime) {
            this.scale = 1
            this.body.scale.setScalar(this.scale)
            this.timer = 0
            this.status = STATUS.STILL
        } 
    }

    checkIsDead() {
        if(this.status == STATUS.DEAD)
            return

        if(this.life <= 0) {
            
            if(this.respawn) {
                this.status = STATUS.READY
                return
            }

            this.hudObject.visible = false
            this.status = STATUS.DEAD
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled
        this.mesh.visible = enabled
    }

    // recebe os ticks do jogo e coordena a logica
    update(deltaTime, playerPosition, isPlayerMoving) {
        if (!this.enabled) return
        
        // sempre roda, qualquer que seja o estado
        this.updateHitbox()
        this.attachModel()
        this.updateHud(deltaTime)
        
        this.body.scale.setScalar(this.scale);
        this.body.rotation.x += Math.sin(this.timer * 10) * 0.001;
        this.light.position.copy(this.position)

        // mostra a hud quando está proximo ou no estado de ataque
        // entra no modo de ataque pela proximidade da área
        // continua no modo de ataque até que saia por se afastar
        if(this.status == STATUS.ATTACK || (isPlayerMoving && this.detectPlayer(deltaTime, playerPosition, this.minProximity))) {
            this.status = STATUS.ATTACK
            this.hudObject.visible = true
        } 

        this.checkDistanceToCenter()
        this.checkIsDead()

        switch (this.status) {
            case STATUS.ATTACK:
                this.atack(deltaTime, playerPosition)
                break

            case STATUS.STILL:
                this.moveToAnotherPlace(deltaTime)
                break

            case STATUS.WALKING:
                this.move(deltaTime)
                break

            case STATUS.DEAD:
                this.kill(deltaTime)
                break

            case STATUS.READY:
                this.start(deltaTime)
                break
        }
    }

    attachModel() {
        if (this.ghost || !this.model || !this.model.loaded) return

        this.ghost = SkeletonUtils.clone(this.model.object)

        const box = new THREE.Box3().setFromObject(this.ghost)
        const size = new THREE.Vector3()
        box.getSize(size)
        const fator = this.enemyDimensions.height / size.y
        this.ghost.scale.multiplyScalar(fator)

        box.setFromObject(this.ghost)
        this.ghost.position.y = -this.enemyDimensions.height / 2 - box.min.y

        this.body.add(this.ghost)
    }
}
