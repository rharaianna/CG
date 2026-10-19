import * as THREE from "three";
import { Model } from "../Model.js";

export class Receptacle extends Model {
    constructor(x, y, z, material, config = {}) {
        super(x, y, z, material);
    
        const { width = 3, height = 10, depth = 3 } = config;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            this.material
        );

        this.add(this.mesh)
    }
}
