import * as THREE from "three";
import { Model } from "../Model.js";
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToTower } from "../../utils/CSGModifiers.js";

const evaluator = new Evaluator();

export class Tower extends Model {
    constructor(x, y, z, material, config) {
        super(x, y, z, material);

        const { height, radius, radialSegments, innerRadius = 0 } = config;

        // Cilindro externo
        const outerGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
        let towerBrush = new Brush(outerGeo, this.material);

        // Se houver innerRadius válido, oca a torre diretamente
        if (innerRadius > 0) {
            const safeInnerRadius = Math.min(innerRadius, radius - 0.1);

            if (safeInnerRadius > 0) {
                const innerGeo = new THREE.CylinderGeometry(safeInnerRadius, safeInnerRadius, height + 0.1, radialSegments);
                const innerBrush = new Brush(innerGeo);

                towerBrush = evaluator.evaluate(towerBrush, innerBrush, SUBTRACTION);
            }
        }

        let mesh = new THREE.Mesh(towerBrush.geometry, this.material);

        if (
            (config.janelaslinha > 0 && config.janelacoluna > 0) || 
            (config.holes && config.holes.length > 0)
        ) {
            mesh = applyHolesToTower(mesh, radius, innerRadius > 0 ? innerRadius : 0, height, config);
        }

        this.object.add(mesh);
    }
}
