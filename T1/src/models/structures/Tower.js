import * as THREE from "three";
import { Model } from "../Model.js";

export class Tower extends Model {
    constructor(x, y, z, material, config) {
        super(x, y, z, material);

        const { height, radius, radialSegments } = config

        const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
        const cylinder = new THREE.Mesh(geometry, this.material);

        /* const radius = 5;
        const brickWidth = 1;
        const brickHeight = 0.8;

        for (let y = 0; y < 12; y++) {

            for (let i = 0; i < 20; i++) {

                const angle = (i / 20) * Math.PI * 2;

                const brick = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, brickHeight, 0.8),
                    this.material
                );

                brick.position.set(
                    Math.cos(angle) * radius,
                    y * brickHeight,
                    Math.sin(angle) * radius
                );

                brick.rotation.y = -angle;

                this.object.add(brick);
            }
        } */

        this.object.add(cylinder);
    }
}