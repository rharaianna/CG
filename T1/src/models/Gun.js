import * as THREE from "three"
import { Bullet } from "../entity/Bullet.js";

export class Gun {
    constructor(playerCamera, model) {

        this.model = model          // o asset { object, loaded }
        this.camera = playerCamera
        this.crossbow = null

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
        this.helper.position.set(0, -0.1, 0);
        this.object.add(this.helper);

        playerCamera.add(this.object)

        this.podeAtirar = true
    }

    update() {
        this.attachModel()   // só age uma vez, quando o modelo estiver pronto
    }

    getPontaCilindro() {
        const posicaoMundo = new THREE.Vector3();
        this.helper.getWorldPosition(posicaoMundo);
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

    attachModel() {
        if (this.crossbow || !this.model || !this.model.loaded) return

        const obj = this.model.object

        // 1. escala: ajusta o maior lado para um tamanho bom em primeira pessoa
        const TAMANHO = 0.2
        const box = new THREE.Box3().setFromObject(obj)
        const size = box.getSize(new THREE.Vector3())
        obj.scale.multiplyScalar(TAMANHO / Math.max(size.x, size.y, size.z))

        // 2. centraliza o modelo na origem do pivô
        box.setFromObject(obj)
        obj.position.sub(box.getCenter(new THREE.Vector3()))

        // 3. pivô: é ele que você posiciona e gira na tela
        this.crossbow = new THREE.Group()
        this.crossbow.add(obj)
        this.crossbow.position.set(0, -0.05, -0.15)   // direita, abaixo, à frente

        this.camera.add(this.crossbow)

        // 4. esconde só o cilindro, mantendo o helper funcionando
        this.object.material.visible = false
    }
}