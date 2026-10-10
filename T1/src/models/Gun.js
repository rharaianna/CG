import * as THREE from "three"
import { Bullet } from "../player/Bullet.js";

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

        this.helper = new THREE.Object3D();
        this.helper.position.set(0, -0.1, 0); // no espaço LOCAL do cilindro (cru)
        this.object.add(this.helper);

        this.podeAtirar = true
    }

    getPontaCilindro() {
        const posicaoMundo = new THREE.Vector3();
        this.helper.getWorldPosition(posicaoMundo); // já atualiza a matriz internamente
        return posicaoMundo;
    }

    shoot(scene, camera, bullets, worldOctree) {
    
        const raio = new THREE.Ray();
        const pontoAlvo = new THREE.Vector3();
        const camDir = new THREE.Vector3();
        const AIM_RANGE = 200;
            
        // garante matrizes atualizadas (câmera e arma)
        camera.updateMatrixWorld(true);
    
        // raio saindo do centro da câmera
        camera.getWorldPosition(raio.origin);
        camera.getWorldDirection(camDir);

        raio.direction.copy(camDir);
    
        // ponto que a crosshair ta vendo
        const disparo = worldOctree.rayIntersect(raio);
        const dist = disparo ? disparo.distance : AIM_RANGE;
        pontoAlvo.copy(raio.origin).addScaledVector(camDir, dist);
    
        // direção do cano ate esse ponto
        const origin = this.getPontaCilindro();
        const direction = pontoAlvo.clone().sub(origin);
    
        // previne caso que se a parede ta mais perto que o cano, a direção inverteria
        if (direction.dot(camDir) <= 0) direction.copy(camDir);
        direction.normalize();
    
        bullets.push(new Bullet(scene, origin, direction));
          
    }
}