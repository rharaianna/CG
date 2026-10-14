import * as THREE from "three"
import { Model } from "../Model.js";
import { Scene } from "../../../../build/three.core.js";

export class Stair extends Model {
    constructor(x, y, z, material, stepWidth, stepHeight, stepDepth, stepNumber) {
        super(x, y, z, material);

        for(let i=0; i<stepNumber; i++) {

            const step = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth)
            const mesh = new THREE.Mesh(step, this.material)

            mesh.position.set(0, i * stepHeight, i * stepDepth);
            // Marca como visual: será excluído da malha de colisão (Octree)
            mesh.userData.stairVisual = false;

            this.add(mesh);
        }

    }
}
