import * as THREE from "three";
import { Model } from "../Model.js";
import { Receptacle } from "./Receptacle.js";
import { Portal } from "./Portal.js";
import { KEYS } from "../../entity/key.config.js";

export class Pedestal extends Model {
    constructor(scene, x, y, z, material, config = {}) {
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

        this.active = false

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

        // na ordem para ficar condizente com o portal
        const receptaclesConfigs = [
            { x:  dist, z:  dist, rot: Math.PI * 0.5, key: KEYS.SECOND },  // 45°
            { x: -dist, z:  dist, rot: Math.PI, key: KEYS.THIRD},        // 135°
            { x: -dist, z: -dist, rot: Math.PI * 1.5, key: KEYS.FIRST},  // 225°
            { x:  dist, z: -dist, rot: 0, key: KEYS.FOURTH}               // 315°
        ];

        this.receptacles = [];

        for (const { x, z, rot, key} of receptaclesConfigs) {
            const item = new Receptacle(scene, x, ry, z, this.material, receptacle, key);
            item.object.rotation.y = rot;
            
            this.add(item);
            this.receptacles.push(item);
        };
        this.portal = new Portal(0, height / 2 + portal.height / 2, 0, this.material, portal);
        this.add(this.portal);
    }

    update(deltaTime, playerPosition, handleEvent) {
        this.receptacles.forEach(receptacle => receptacle.update(deltaTime, playerPosition, handleEvent))
        this.active = this.receptacles.every(receptacle => receptacle.active)
    
        if(this.active)
            this.portal.setActive()
    }
}
