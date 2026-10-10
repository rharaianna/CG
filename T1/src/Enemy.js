import * as THREE from 'three';
import { materials } from './models/material.configs.js';
import { STATUS, BEHAVIOR } from './enemy.enums.js';

export class Enemy {
    constructor(scene, movementArea, behavior) {

        this.enemyDimensions = {
            width: 2,
            height: 2,
            depth: 2,
        }

        this.life = 3

        this.respawn = true

        // inicia parado
        this.status = STATUS["STILL"]

        // define area onde vai ter movimento
        this.behavior = behavior
        
        this.movementArea = movementArea
        this.center = movementArea.getStartPosition(this.enemyDimensions)
        this.position = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        this.destiny = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        this.timer = 0
        this.speed = 10
        this.scale = 1
    
        this.body = new THREE.Mesh(
            new THREE.BoxGeometry(this.enemyDimensions.width, this.enemyDimensions.height, this.enemyDimensions.depth), 
            materials.rotten_wood
        )
        this.body.position.copy(this.position)
        scene.add(this.body)
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

    // calcula uma posição pra ir e muda o seu comportamento
    generateDestiny() {
        if(this.status == STATUS["STILL"]) {
            this.destiny = this.movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
            this.status = STATUS["WALKING"]
        }
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

    checkDistanceToCenter() {

        if(this.status != STATUS.ATTACK)
            return

        const distance = this.position.distanceTo(this.center);
        
        // distancia máxima que pode sair do raio
        if(distance >= this.movementArea.maxDistance) {

            // teste para morrer dps de sair da regiao
            this.status = STATUS.DEAD
            return

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

        const distance = this.position.distanceTo(playerPosition);

        // distancia que fica do jogador
        const maxDistance = 10
      
        if(distance >= maxDistance) {
            this.destiny.copy(this.position).add(
                direction.multiplyScalar(distance - maxDistance)
            );
        } 
    }

    // vai detectar se o jogador ta proximo do inimigo
    detectPlayer(deltaTime, playerPosition) {

        // distancia mínima de detecção do jogador
        const isNear = playerPosition.distanceTo(this.position) <= this.movementArea.detectionRange

        if (isNear) {
            if (this.status !== STATUS.ATTACK) {
                this.status = STATUS.ATTACK
            }
            return;
        }
    }

    kill(deltaTime) {

        const factor = 0.05
        this.scale -= factor
        
        if(this.scale < 0) {
            this.scale = 0;
            this.body.scale.setScalar(0);
            this.timer = 0

            if(this.respawn)
                this.status = STATUS.READY

            return
        }

        this.body.scale.setScalar(this.scale);
    }

    // reinicia
    start(deltaTime) {

        
        this.position.copy(this.center)
        this.destiny.copy(this.center)
        this.body.position.copy(this.center)
        
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

    // recebe os ticks do jogo e coordena a logica
    update(deltaTime, playerPosition) {

        // ve se o jogador ta num raio do inimigo
        this.detectPlayer(deltaTime, playerPosition)

        // ve se ele ta mt longe do centro da caixa dele
        this.checkDistanceToCenter()
        
        if(this.status === STATUS.ATTACK) {
            this.atack(deltaTime, playerPosition)
            this.move(deltaTime);
            return
        }

        if (this.status === STATUS.STILL) {
            this.moveToAnotherPlace(deltaTime);
            return;
        }

        if (this.status === STATUS.WALKING) {
            this.move(deltaTime);
            return
        }

        if(this.status === STATUS.DEAD) {
            this.kill(deltaTime);
            return
        }

        if(this.status === STATUS.READY) {
            this.start(deltaTime);
            return
        }
    }
}