import * as THREE from "three";
import { Model } from "../Model.js";

export class Door extends Model {
    constructor(x, y, z, material, config) {
        super(x, y, z, material);

        const { width = 4, height = 6, depth = 0.2 } = config;
        const panelWidth = width / 2;

        // 1. Pivô da Folha Esquerda
        this.leftPivot = new THREE.Group();
        const leftGeo = new THREE.BoxGeometry(panelWidth, height, depth);
        leftGeo.translate(panelWidth / 2, 0, 0); 
        const leftMesh = new THREE.Mesh(leftGeo, this.material);
        this.leftPivot.add(leftMesh);
        this.leftPivot.position.set(-panelWidth, 0, 0);

        // 2. Pivô da Folha Direita
        this.rightPivot = new THREE.Group();
        const rightGeo = new THREE.BoxGeometry(panelWidth, height, depth);
        rightGeo.translate(-panelWidth / 2, 0, 0);
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
        const targetAngle = open ? Math.PI / 2 : 0;

        // Aplica a rotação diretamente nos grupos de pivô
        this.leftPivot.rotation.y = -targetAngle;
        this.rightPivot.rotation.y = targetAngle;
    }

}
