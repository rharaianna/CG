import * as THREE from "three"
import { Model } from "../Model.js";

export class Stair extends Model {
    constructor(x, y, z, material, stepWidth, stepHeight, stepDepth, stepNumber) {
        super(x, y, z, material);

        const stair = new THREE.Group()
        
        for(let i=0; i<stepNumber; i++) {

            const step = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth)
            const mesh = new THREE.Mesh(step, this.material)

            mesh.position.set(0, i*stepHeight, i*stepDepth)
            stair.add(mesh)
        }
 
        this.add(stair)
    }
}