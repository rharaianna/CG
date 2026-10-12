import * as THREE from "three";
import { Model } from "../Model.js";

export class Portal extends Model {
    constructor(x, y, z, material, config = {}) {
        super(x, y, z, material);

        const {
            radius = 3,
            height = 2,
        } = config;

        const externalRadius = radius + 2


        this.material.side = THREE.DoubleSide;

        const heightGeometry = new THREE.CylinderGeometry(
            externalRadius, // radiusTop
            externalRadius, // radiusBottom
            height,      // height (altura do cilindro)
            64,          // radialSegments (divisões do círculo)
            1,           // heightSegments
            true         // openEnded (sem tampas)
        );

        const heightMesh = new THREE.Mesh(heightGeometry, this.material);

        const frameGeometry = new THREE.RingGeometry(externalRadius-1, externalRadius, 64);
        const frame = new THREE.Mesh(frameGeometry, this.material);
        
        this.object.add(frame);
        this.object.add(heightMesh);

        heightMesh.position.y = -(height/2);
        frame.rotateX(THREE.MathUtils.degToRad(90))
        
    }


}
