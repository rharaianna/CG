import * as THREE from "three";
import { Wall } from "./Wall.js";

export class DetailedWall extends Wall {
    constructor(x, y, z, material, width, height, depth, towerWidth, towerDepth, radius, windowsConfig){

        // tamanho da metade da parede com os descontos
        const availableWidth = width - towerWidth/2 -radius
        const mainWidth = 0.85*availableWidth
        
        // total disponível relativo
        const availableRemaining = availableWidth - mainWidth 
        
        // total real considerando o tamanho esperado da parede
        const remaining = width - mainWidth -radius - depth
        const denteWidth = towerDepth/2 - depth/2
        
        //// cria a parede base
        super(x, y, z, material, mainWidth, height, depth, windowsConfig);

        // volta para trás o que foi tirado
        this.object.translateZ(-availableRemaining/2)

        // anda um espaço para entrar o desvio
        this.object.translateX(-denteWidth)  

        // dente da parede
        let dente = new THREE.Mesh(
            new THREE.BoxGeometry(denteWidth, height, depth), 
            this.material
        );
        dente.translateZ(denteWidth/2 - depth/2)
        dente.translateX(-mainWidth/2)
        dente.rotateY(THREE.MathUtils.degToRad(90))
        this.add(dente)
        
        // parede restante 
        let remainingWall = new THREE.Mesh(
            new THREE.BoxGeometry(remaining, height, depth), 
            this.material
        );
        remainingWall.translateX(-mainWidth/2 -remaining/2 +depth/2)
        remainingWall.translateZ(denteWidth)
        this.add(remainingWall)
        
        let floor = new THREE.Mesh(
            new THREE.BoxGeometry(mainWidth - 2*depth, height, denteWidth), 
            this.material
        );
        floor.translateZ(denteWidth/2 + depth/2)
        floor.translateX(-depth/2)
        //this.add(floor)
    }   
}
