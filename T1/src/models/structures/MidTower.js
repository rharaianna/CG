import * as THREE from "three"
import { Model } from "../Model.js"
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToTower } from "../../utils/CSGModifiers.js";

const evaluator = new Evaluator();

export class MidTower extends Model {
    constructor(x, y, z, material, width, height, depth, brickHeight, config) {
        super(x, y, z, material)

        const geometry = new THREE.BoxGeometry(width, height, depth)
        let mesh = new THREE.Mesh(geometry, this.material)

        const radius = 1;
        const brickWidth = 0.3 * radius
        const brickDepth = 0.6 * radius
        const merlonsNumber = 8
    
        const miniTowers = new THREE.Group()

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
            miniTowers.add(merlon)
        }
            
        miniTowers.position.set(width/2 - radius, radius, 2)
    
        this.object.add(miniTowers)

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
        
        this.object.add(mesh)
    }
}
