import * as THREE from 'three';
import { STATUS, BEHAVIOR } from './enemy.enums.js';

export class MovementArea {

    constructor(scene, position, dimensions) {
        this.position = position
        this.width = dimensions.width
        this.height = dimensions.height
        this.depth = dimensions.depth

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth), 
            new THREE.MeshBasicMaterial({ wireframe: true })
        )
        
        this.box.position.copy(this.position);
        scene.add(this.box)
        
    }

    getRandomPosition(enemyDimensions, behavior) {

        // pequena limitação de cobertura da área 
        const coverage = 0.8
        const { width, depth, height } = enemyDimensions

        const minX = this.position.x - this.width / 2 + width / 2;
        const maxX = this.position.x + this.width / 2 - width / 2;

        const minZ = this.position.z - this.depth / 2 + depth / 2;
        const maxZ = this.position.z + this.depth / 2 - depth / 2;

        const x = minX + Math.random() * (maxX - minX) * coverage;
        const z = minZ + Math.random() * (maxZ - minZ) * coverage;

        // base do cubo ou chão dele 
        const baseY = this.position.y - this.height / 2;
        
        let y
        if(behavior == BEHAVIOR["FLYING"]) {

            // topo do cubo 
            const maxY = this.position.y + this.height/2;
            y = baseY + height/2 + Math.random() * (maxY - baseY - height) * coverage;
        
        } else {
            y = baseY + height / 2;
        }

        // retorna a posição do mundo, que é onde está posicionado 
        // a area com a adição desse deslocamento 
        return new THREE.Vector3(
            x,
            y,
            z
        );
    }

    // retorna a base da area de movimento com o ajuste em y
    getStartPosition(enemyHeight) {

        const position = this.position.clone();
        const baseY = this.position.y - this.height / 2;

        position.y = baseY + enemyHeight / 2;
        return position;
    }
}