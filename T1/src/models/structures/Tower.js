import * as THREE from "three"
import { Model } from "../Model.js"
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToTower } from "../../utils/CSGModifiers.js";

const evaluator = new Evaluator();

export class Tower extends Model {
    constructor(x, y, z, material, height, radius, innerRadius, radialSegments, brickHeight, config) {
        super(x, y, z, material)

        const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments)
        let cylinder = new THREE.Mesh(geometry, this.material)

        const brickWidth = 0.2 * radius
        const brickDepth = 0.6 * radius
        const merlonsNumber = 8
    
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
            
        if(!!config) {
            // Cilindro externo
            const outerGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
            let towerBrush = new Brush(geometry, this.material);
            
            // Se houver innerRadius válido, oca a torre diretamente
            if (innerRadius > 0) {
                const safeInnerRadius = Math.min(innerRadius, radius - 0.1);
                
                if (safeInnerRadius > 0) {
                    const innerGeo = new THREE.CylinderGeometry(safeInnerRadius, safeInnerRadius, height + 0.1, radialSegments);
                    const innerBrush = new Brush(innerGeo);
                    
                    towerBrush = evaluator.evaluate(towerBrush, innerBrush, SUBTRACTION);
                }
            }
            
            if(!!config) 
                cylinder = applyHolesToTower(towerBrush, radius, innerRadius > 0 ? innerRadius : 0, height, config);
            
        }        
        
        this.object.add(cylinder)
    }
}
