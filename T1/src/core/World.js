import * as THREE from 'three';
import { Castle } from '../models/castle/Castle.js';
import { createGroundPlaneXZ } from '../../../libs/util/util.js';
import { House } from '../models/buildings/House.js';
import { materials } from '../models/material.configs.js';
import { Floor } from '../models/structures/Floor.js';
import { config as houseConfig } from '../models/buildings/house.config.js';

export class World {
    constructor(scene) {

        this.collisionEnabledGroup = new THREE.Group();
        this.collisionDisabledGroup = new THREE.Group();

        // Show axes (parameter is size of each axis)
        let axesHelper = new THREE.AxesHelper(100);
        //scene.add(axesHelper);
        
        // create the ground plane
        let plane = createGroundPlaneXZ(300, 300)
        this.collisionEnabledGroup.add(plane);
        
        // tamanhos aproximados do castelo
        this.CASTLE_WIDTH = 70
        this.CASTLE_DEPTH = 92
        this.SCALE = 1
 
        this.FLOOR_HEIGHT = 1  * this.SCALE;
        this.FLOOR_WIDTH  = this.CASTLE_WIDTH * 1.1;
        this.FLOOR_DEPTH  = this.CASTLE_DEPTH * 1.1;

        // para os objetos posicionados acima dele
        this.FLOOR_Y = this.FLOOR_HEIGHT

        this.floor = new Floor(0, this.FLOOR_HEIGHT/2 + 0.01, 0, materials.grass, this.FLOOR_WIDTH, this.FLOOR_HEIGHT, this.FLOOR_DEPTH);
        this.castle = new Castle(scene, 0, this.FLOOR_Y, 0, null, this.CASTLE_WIDTH, this.CASTLE_DEPTH, this.SCALE)
        
        this.house1 = new House(
            scene, 
            -20, 
            this.FLOOR_Y, 
            -20, 
            houseConfig.MAIN_HOUSE
        )
        
        this.house2 = new House(
            scene, 
            20, 
            this.FLOOR_Y, 
            20,
            houseConfig.SECOND_HOUSE
        )
        
        // grupo de colisão
        this.collisionEnabledGroup.add(this.castle.object)
        this.collisionEnabledGroup.add(this.house1.object)
        this.collisionEnabledGroup.add(this.house2.object)
        this.collisionEnabledGroup.add(this.floor.object)

        // grupo que so tem a vista mas não tem colisão
        this.collisionDisabledGroup.add(this.castle.collisionDisabledGroup)

        scene.add(this.collisionEnabledGroup)
        scene.add(this.collisionDisabledGroup)    
    }

    update(deltaTime, playerPosition, isPlayerMoving) {
        this.castle.update(deltaTime, playerPosition, isPlayerMoving)
    }

    getInicialPosition() {
        return new THREE.Vector3(0, this.FLOOR_Y, 0)
    }
}
