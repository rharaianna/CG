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
        const halfDiag = Math.hypot(receptacleWidth, receptacleDepth) / 2;

        // Os vértices do octógono (cilindro com 8 lados) ficam a `radius` do centro.
        // Posicionamos o receptáculo para que a quina externa fique um pouco
        // recuada em relação ao vértice do octógono.
        const dist = radius - halfDiag - 0.5;

        const angles = [45, 135, 225, 315].map(a => THREE.MathUtils.degToRad(a));

        this.receptacles = angles.map((a) => {
            const rx = Math.sin(a) * dist;
            const rz = Math.cos(a) * dist;

            const item = new Receptacle(
                rx,
                height / 2 + receptacleHeight / 2,
                rz,
                this.material,
                receptacle
            );
            // Vértice (quina) voltado para o centro: gira 45° em relação à face
            item.object.rotation.y = a + Math.PI / 4;
            this.add(item);
            return item;
        });
        this.portal = new Portal(0, height / 2 + portal.height / 2, 0, this.material, portal);
        this.add(this.portal);


    }
}
