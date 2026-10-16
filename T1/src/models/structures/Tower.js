import * as THREE from "three"
import { Model } from "../Model.js"
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToTower } from "../../utils/CSGModifiers.js";
import { materials } from "../material.configs.js";

const evaluator = new Evaluator();

export class Tower extends Model {
    constructor(x, y, z, material, height, radius, innerRadius, radialSegments, brickHeight, config, pocketDepth = height / 3, ceilY, ceilHeight) {
        super(x, y, z, material)

        const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments)
        const innerGeometry = new THREE.CylinderGeometry(innerRadius + (radius - innerRadius)/2, innerRadius + (radius - innerRadius)/2, ceilHeight, radialSegments)
        
        let cylinder = new THREE.Mesh(geometry, material)
        let floor = new THREE.Mesh(innerGeometry, materials.rotten_wood)
        let ceil = new THREE.Mesh(innerGeometry, materials.bricks)

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

            let towerBrush = new Brush(geometry, material);
            
            // Se houver innerRadius válido, oca a torre diretamente
            if (innerRadius > 0) {
                const safeInnerRadius = Math.min(innerRadius, radius - 0.1);
                
                if (safeInnerRadius > 0) {
                    const overshoot = 1;              // quanto passa do topo (garante corte limpo)
                    const cutHeight = pocketDepth + overshoot;

                    const innerGeo = new THREE.CylinderGeometry(
                        safeInnerRadius, safeInnerRadius, cutHeight, radialSegments
                    );
                    const innerBrush = new Brush(innerGeo);

                    // base do corte em (height/2 - pocketDepth), topo acima da face superior da torre
                    innerBrush.position.y = height / 2 - pocketDepth + cutHeight / 2;
                    innerBrush.updateMatrixWorld();   // necessário para o CSG enxergar a posição

                    floor.position.y = ceilY - y;
                    ceil.position.y = height - y;

                    towerBrush = evaluator.evaluate(towerBrush, innerBrush, SUBTRACTION);
                }
            }
            
            if(!!config) 
                 cylinder = applyHolesToTower(towerBrush, radius, innerRadius > 0 ? innerRadius : 0, height, config);
            
        }        
        
        this.object.add(cylinder)
        this.object.add(floor)
        this.object.add(ceil)
    }
}
