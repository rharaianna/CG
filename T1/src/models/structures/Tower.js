import * as THREE from "three"
import { Model } from "../Model.js"

export class Tower extends Model {
    constructor(x, y, z, material, height, radius, radialSegments, brickHeight) {
        super(x, y, z, material)
        const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments)
        const cylinder = new THREE.Mesh(geometry, this.material)

        const brickWidth = 0.2 * radius
        const brickDepth = 0.3 * radius
        const merlonsNumber = 15
    
        // adiciona os merloes no c
        for (let i=0; i< merlonsNumber; i++) {
            const angle = (i / merlonsNumber) * Math.PI * 2

            const merlon = new THREE.Mesh(new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth), this.material)

            merlon.position.set(
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
            )

            merlon.rotation.y = -angle

            this.object.add(merlon)
        }
            

        this.object.add(cylinder)
    }
}