import * as THREE from 'three';
import { Castle } from './models/castle/Castle.js';
import { createGroundPlaneXZ } from '../../libs/util/util.js';

export class World {
    constructor(scene) {

        // Show axes (parameter is size of each axis)
        let axesHelper = new THREE.AxesHelper(100);
        //scene.add(axesHelper);
        
        // create the ground plane
        let plane = createGroundPlaneXZ(300, 300,)
        scene.add(plane);
        
        // tamanhos aproximados do castelo
        const CASTLE_WIDTH = 70
        const CASTLE_DEPTH = 92
        const SCALE = 1
        const CASTLE_X = 0
        const CASTLE_Y = 0
        const CASTLE_Z = 0

        let castle = new Castle(CASTLE_X, CASTLE_Y, CASTLE_Z, null, CASTLE_WIDTH, CASTLE_DEPTH, SCALE)
        scene.add(castle.object)
        castle.hideBoundingBox()

    }

    update(deltaTime) {
    }
}
