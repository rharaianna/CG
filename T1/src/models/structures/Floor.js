import * as THREE from "three"
import { Model } from "../Model.js";

export class Floor extends Model {
    constructor(x, y, z, material, width, height, depth) {
        super(x, y, z, material);

        const geometry = new THREE.BoxGeometry(width, height, depth)
        const mesh = new THREE.Mesh(geometry, this.material)

        this.object.add(mesh)
    }
}