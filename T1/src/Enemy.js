import * as THREE from 'three';
import { materials } from './models/material.configs.js';
import { STATUS, BEHAVIOR } from './enemy.enums.js';

export class Enemy {
    constructor(scene, movementArea) {

        this.enemyDimensions = {
            width: 5,
            height: 5,
            depth: 5,
        }

        // inicia parado
        this.status = STATUS["STILL"]

        // define area onde vai ter movimento
        this.behavior = BEHAVIOR["WALKING"]
        
        this.movementArea = movementArea
        this.position = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        this.destiny = movementArea.getRandomPosition(this.enemyDimensions, this.behavior)
        this.timer = 0
        this.speed = 10
    
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
        const stillTime = 2
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

    // recebe os ticks do jogo e coordena a logica
    update(deltaTime, playerPosition) {

        this.detectPlayer(deltaTime, playerPosition)
        
        if (this.status === STATUS.STILL || this.status === STATUS.READY) {
            this.moveToAnotherPlace(deltaTime);
            return;
        }

        if ([STATUS.WALKING, STATUS.ATTACK].includes(this.status)) {
            this.move(deltaTime);
        }
    }

    changeToAttackMode(deltaTime, playerPosition) {

        console.log("ATTACK");
        this.status = STATUS["ATTACK"]

        // olha pro jogador
        const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize()
        this.body.lookAt(this.position.clone().add(direction));

        const distance = this.position.distanceTo(playerPosition);

        // nunca ultrapassar essa distancia 
        const maxDistance = 10
        const chasingTime = 3

        if(distance >= maxDistance) {
            this.destiny.copy(this.position).add(
                direction.multiplyScalar(distance - maxDistance)
            );
        } 
    }

    // vai detectar se o jogador ta proximo do inimigo
    detectPlayer(deltaTime, playerPosition) {

        if(this.status == STATUS["READY"])
            return

        const distance = 15
        const isNear = playerPosition.distanceTo(this.position) <= distance

        if (isNear) {
            if (this.status !== STATUS.ATTACK) {
                this.changeToAttackMode(deltaTime, playerPosition);
            }
            return;
        }

        
        // Só muda de ATTACK quando o jogador se afastar
        if (this.status === STATUS.ATTACK) {
            this.status = STATUS.STILL;
            this.timer = 0;
        }
    }
}