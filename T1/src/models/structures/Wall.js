import * as THREE from "three";
import { Model } from "../Model.js";

export class Wall extends Model {
    constructor(x, y, z, material, width, height, depth, rotations) {
        super(x, y, z, material);

        const geometry = new THREE.BoxGeometry(width, height, depth)
        const mesh = new THREE.Mesh(geometry, this.material)

        if(!!rotations)
            this.rotate(rotations)

        this.object.add(mesh)
    }
}