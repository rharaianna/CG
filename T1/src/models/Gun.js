import * as THREE from "three"

export class Gun{
    constructor (){
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 32);
        const gunMaterial = new THREE.MeshStandardMaterial({
            color:'#bebebe',
            roughness: 0.8,
            metalness: 0.5
        });
        
        this.object = new THREE.Mesh(gunGeometry, gunMaterial);
        this.object.rotation.x = Math.PI / 2;
        this.object.position.set(0, -0.12, -0.2)
    }

    getPontaCilindro() {
        // Ponta do cilindro no espaço local: metade do comprimento, no eixo Z (após a rotação aplicada)
        const pontaLocal = new THREE.Vector3(0, 0.1, 0); // -0.25 (metade do cilindro) - 0.25 offset, ajuste conforme seu tamanho
        return this.object.localToWorld(pontaLocal.clone());
    }
}