import * as THREE from 'three';

export class Entity {
    constructor(scene) {
        this.scene = scene
        this.alive = true
        this.mesh = new THREE.Group()
    }

    destroy() {
        this.scene.remove(this.mesh)
        this.alive = false
    }

    // vai detectar se o jogador ta proximo do inimigo
    detectPlayer(deltaTime, playerPosition, minDistance) {
        // distancia mínima de detecção do jogador
        const isNear = playerPosition.distanceTo(this.position) <= minDistance
        return isNear
    }
}
