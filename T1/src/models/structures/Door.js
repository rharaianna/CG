import * as THREE from "three";
import { Model } from "../Model.js";
import { createArchDoorLeafGeometry } from "../../utils/ArchGeometry.js";

export class Door extends Model {
    constructor(x, y, z, material, config) {
        super(x, y, z, material);

        const { width = 4, height = 6, depth = 0.2 } = config;
        const panelWidth = width / 2;

        // 1. Pivô da Folha Esquerda
        this.leftPivot = new THREE.Group();
        const leftGeo = createArchDoorLeafGeometry(width, height, depth, "left");
        const leftMesh = new THREE.Mesh(leftGeo, this.material);
        this.leftPivot.add(leftMesh);
        this.leftPivot.position.set(-panelWidth, 0, 0);

        // 2. Pivô da Folha Direita
        this.rightPivot = new THREE.Group();
        const rightGeo = createArchDoorLeafGeometry(width, height, depth, "right");
        const rightMesh = new THREE.Mesh(rightGeo, this.material);
        this.rightPivot.add(rightMesh);
        this.rightPivot.position.set(panelWidth, 0, 0);

        // Adiciona ao objeto principal
        this.object.add(this.leftPivot);
        this.object.add(this.rightPivot);

        this.updateBoundingBox();

        this.isOpen = false;
    }

    toggleDoor(open = true) {
        this.isOpen = open;
        
        // Aplica a rotação diretamente nos grupos de pivo  
    }
    
    update(deltaTime) {
        
        let animationSpeed = 2
        const factor = 1 - Math.exp(-animationSpeed * deltaTime);
        const targetAngle = Math.PI / 2;
        
        // Incrementa o tempo a cada frame
        
        this.leftPivot.rotation.y =       
        THREE.MathUtils.lerp(
            this.leftPivot.rotation.y,
            -targetAngle,
            factor
        );
        this.rightPivot.rotation.y = THREE.MathUtils.lerp(
            this.rightPivot.rotation.y,
            targetAngle,
            factor
        );

    }



}
