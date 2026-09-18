import * as THREE from "three";
import { Wall } from "./Wall.js";

/** 
  * geometria similar a Wall mas tem os merlões posicionados em cima, precisa de receber o raio da torre para posicionar corretamente
**/
export class CastleWall extends Wall {
    constructor(x, y, z, material, width, height, depth, towerRadius, windowsConfig) {
        super(x, y, z, material, width, height, depth, windowsConfig);
        this.towerRadius = towerRadius
        this.drawMerlons(width, depth)
    }

    drawMerlons(width, depth) {
        const brickSpacing = 0.3 * depth
        const brickWidth = 0.8 * depth
        const brickHeight = 0.5 * depth
        const brickDepth = depth

        // numeros de tijolo para cada metade de parede
        const availableWidth = (width / 2 - 2 * this.towerRadius)
        const brickNumber = Math.ceil(availableWidth / (brickWidth + brickSpacing))

        const spacing = (
            availableWidth - brickNumber * brickWidth
        ) / (brickNumber + 1);

        const brickStart = this.towerRadius + spacing + brickWidth;

        for (let i = 0; i < brickNumber; i++) {
            let merlon1 = new THREE.Mesh(
                new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth),
                this.material
            );

            merlon1.position.set(
                brickStart + i * (brickWidth + brickSpacing),
                this.y + brickHeight / 2,
                0
            );

            let merlon2 = new THREE.Mesh(
                new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth),
                this.material
            );

            merlon2.position.set(
                -(brickStart + i * (brickWidth + brickSpacing)),
                this.y + brickHeight / 2,
                0
            );

            this.object.add(merlon1);
            this.object.add(merlon2);
        }
    }
}