import * as THREE from 'three';
import { materials } from '../models/material.configs.js';
import { STATUS, BEHAVIOR } from './enemy.enums.js';
import { Entity } from './Entity.js';
import * as SkeletonUtils from "../../../build/jsm/utils/SkeletonUtils.js"

export class Enemy extends Entity {
    constructor(scene, movementArea, config) {
        super(scene)

        this.config = config

        const {
            dimensions, 
            color,
            life,
            behavior,
            speed,
            model,
            minProximity
        } = config

        this.scene = scene
        this.respawn = false
        this.enemyDimensions = dimensions
        this.speed = speed
        this.life = life
        this.color = color
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
        
        //this.light.castShadow = true
     
        this.scene.add(this.mesh)
    }

    // vai ser chamado quando chegar na direção
    // inimigo fica parado por um tempo e dps gera outro local
    moveToAnotherPlace(deltaTime) {

        // reseta velocidade
        this.speed = this.config.speed

        // um tempo de parada aleatório
        const stillTime = 2 + Math.random() * 3

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
        else this.status = STATUS.ATTACK

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
        return this.color
    }

    getPosition() {
        return this.position.clone()
    }

    move(deltaTime) {

        // calcula a direção que deve ir e a distancia que está
        const direction = new THREE.Vector3().subVectors(this.destiny, this.position).normalize()
        const distance = this.position.distanceTo(this.destiny);
        const movement = this.speed * deltaTime;

        // se tiver chegado, vai pro comportamento de outro lugar
        if (distance <= movement) {
            this.position.copy(this.destiny);
            this.body.position.copy(this.position);
   
            this.status = STATUS.STILL;
            this.timer = 0;

            // nao se movimenta e buga tudo
            return;
        } 

        // rotaciona na direção do movimento
        this.body.lookAt(this.position.clone().add(direction));

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
        if(distance >= this.movementArea.maxDistance 
            //|| (this.behavior == BEHAVIOR.WALKING && distance >= maxWalkingDistance) 
        ) {

            // teste para morrer dps de sair da regiao
            // this.status = STATUS.DEAD
            // return 

            // mas na verdade voltaria pro centro
            this.status = STATUS.STILL
            this.destiny.copy(this.center)
        }

    }

    // persegue e olha pro jogador até certo ponto
    atack(deltaTime, playerPosition) {
        
        // olha pro jogador
        const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize()
        this.body.lookAt(this.position.clone().add(direction));

        const factor = 0.005

        // distancia que fica do jogador
        const maxDistance = 20
        
        const distance = this.position.distanceTo(playerPosition);

        if(this.behavior == BEHAVIOR.WALKING) {

            this.speed = 1
            const maxScale = 2
            
            if(this.scale < maxScale) {
                this.scale += factor
            }    
            
            //this.position.y += factor

            // se for andante tem que chegar muito perto
            if(distance < 5) 
                this.destiny.copy(this.position).add(
                    direction.multiplyScalar(distance)
                );
        }

        // se for voador sempre segue
        if(this.behavior == BEHAVIOR.FLYING) {
            this.destiny.copy(this.position).add(
                direction.multiplyScalar(distance - 5)
            );
        }

    


        



        // desiste de atacar
        if(distance > maxDistance)
            this.status = STATUS.STILL
    }

    kill(deltaTime) {
        const factor = 0.05
        this.scale -= factor

        if(this.scale < 0) {
            //this.scale = 0;
            //this.body.scale.setScalar(0);
            this.timer = 0

            this.destroy()

            return
        }

        this.body.scale.setScalar(this.scale);
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

            this.status = STATUS.DEAD
        }
    }

    // recebe os ticks do jogo e coordena a logica
    update(deltaTime, playerPosition, isPlayerMoving) {

        //console.log(this.status);

        this.attachModel()
        
        this.light.position.copy(this.position)
        
        // entra no modo de ataque pela proximidade da área
        // continua no modo de ataque até que saia por se afastar
        if(this.status == STATUS.ATTACK || isPlayerMoving && this.detectPlayer(deltaTime, playerPosition, this.minProximity))
            this.status = STATUS.ATTACK

        this.checkDistanceToCenter()
        this.checkIsDead()

        switch (this.status) {
            case STATUS.ATTACK:
                this.atack(deltaTime, playerPosition)
                this.move(deltaTime)
                break

            case STATUS.STILL:
                this.resetScale()
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

        // sempre roda, qualquer que seja o estado
        this.updateHitbox()
        this.body.scale.setScalar(this.scale);
    }

    resetScale() {
        if(this.status == STATUS.ATTACK)
            return

        const factor = 0.05

        if(this.scale > 1)
            this.scale -= factor

    }

    attachModel() {
        if (this.ghost || !this.model || !this.model.loaded) return

        // clone() comum quebra modelos com esqueleto; SkeletonUtils.clone é seguro nos dois casos
        this.ghost = SkeletonUtils.clone(this.model.object)

        // ajusta o tamanho do fantasma para caber na caixa do inimigo
        const box = new THREE.Box3().setFromObject(this.ghost)
        const size = new THREE.Vector3()
        box.getSize(size)
        const fator = this.enemyDimensions.height / size.y
        this.ghost.scale.multiplyScalar(fator)

        // alinha os pés do fantasma com a base da caixa
        box.setFromObject(this.ghost)
        this.ghost.position.y = -this.enemyDimensions.height / 2 - box.min.y

        this.body.add(this.ghost)
    }
}