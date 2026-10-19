import * as THREE from "three";
import { Model } from "../Model.js";
import { Receptacle } from "./Receptacle.js";
import { Portal } from "./Portal.js";

export class Pedestal extends Model {
    constructor(x, y, z, material, config = {}) {
        super(x, y, z, material);

        const {
            radius = 10,
            height = 0.5,
            baseThickness = 0.25,
            receptacle = {},
            portal = {},
        } = config;

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 8),
            this.material
        );
        this.add(base);

        const lowerBase = new THREE.Mesh(
            new THREE.CylinderGeometry(radius + 0.5, radius + 0.5, baseThickness, 8),
            this.material
        );
        lowerBase.position.y = -(height + baseThickness) / 2;
        this.add(lowerBase);


        const receptacleWidth = receptacle.width ?? 3;
        const receptacleDepth = receptacle.depth ?? 3;
        const receptacleHeight = receptacle.height ?? 10;

        // Meia-diagonal do receptáculo (distância do centro dele até a quina)
        const Diag = Math.hypot(receptacleWidth, receptacleDepth);

        // Os vértices do octógono (cilindro com 8 lados) ficam a `radius` do centro.
        // Posicionamos o receptáculo para que a quina externa fique um pouco
        // recuada em relação ao vértice do octógono.
        const dist = radius - (2*Diag) ;

        const ry = height / 2 + receptacleHeight / 2;
        const offsets = [
            { x:  dist, z:  dist, rot: Math.PI * 0.5 },  // 45°
            { x: -dist, z:  dist, rot: Math.PI },        // 135°
            { x: -dist, z: -dist, rot: Math.PI * 1.5 },  // 225°
            { x:  dist, z: -dist, rot: 0 }               // 315°
        ];

        this.receptacles = [];

        for (const { x, z, rot } of offsets) {
            const item = new Receptacle(x, ry, z, this.material, receptacle);
            item.object.rotation.y = rot;
            
            this.add(item);
            this.receptacles.push(item);
        };
        this.portal = new Portal(0, height / 2 + portal.height / 2, 0, this.material, portal);
        this.add(this.portal);


    }
}
