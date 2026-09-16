import * as THREE from "three"

export class Gun {
    constructor() {
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 32);
        const gunMaterial = new THREE.MeshStandardMaterial({
            color: '#bebebe',
            roughness: 0.8,
            metalness: 0.5
        });

        this.object = new THREE.Mesh(gunGeometry, gunMaterial);
        this.object.rotation.x = Math.PI / 2;
        this.object.position.set(0, -0.12, -0.2)

        this.muzzle = new THREE.Object3D();
        this.muzzle.position.set(0, -0.1, 0); // no espaço LOCAL do cilindro (cru)
        this.object.add(this.muzzle);
    }

    getPontaCilindro() {
        const posicaoMundo = new THREE.Vector3();
        this.muzzle.getWorldPosition(posicaoMundo); // já atualiza a matriz internamente
        return posicaoMundo;
    }
}