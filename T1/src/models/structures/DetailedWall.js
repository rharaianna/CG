import * as THREE from "three";
import { applyHolesToWall } from "../../utils/CSGModifiers.js";
import { Wall } from "./Wall.js";

export class DetailedWall extends Wall {
    constructor(x, y, z, material, width, height, depth, towerWidth, towerDepth, windowsConfig){

        const availableWidth = width-towerWidth/2
        const mainWidth = 0.8*availableWidth

        // total disponível relativo
        const availableRemaining = availableWidth - mainWidth
        
        // total real considerando o tamanho esperado da parede
        const remaining = width - mainWidth
        const dente = towerDepth/2 - depth/2

        super(x, y, z, material, mainWidth, height, depth, windowsConfig);

        // volta para trás o que foi tirado
        this.object.translateZ(-availableRemaining/2)

        // anda um espaço para entrar o desvio
        this.object.translateX(-dente)  
    
        const geometry = new THREE.BoxGeometry(dente, height, depth);
        let wall = new THREE.Mesh(geometry, this.material);
        wall.translateZ(dente/2 - depth/2)
        wall.translateX(-mainWidth/2)

        wall.rotateY(THREE.MathUtils.degToRad(90))

        const geometry1 = new THREE.BoxGeometry(remaining, height, depth);
        let wall1 = new THREE.Mesh(geometry1, this.material);
        wall1.translateX(-mainWidth/2 -remaining/2 + depth/2)
        wall1.translateZ(dente)

        this.add(wall)
        this.add(wall1)

        const floor = new THREE.BoxGeometry(mainWidth - 2*depth, height, dente);
        let floor1 = new THREE.Mesh(floor, this.material);
        floor1.translateZ(dente/2 + depth/2)
        floor1.translateX(-depth/2)
        this.add(floor1)
        
    }   
}
