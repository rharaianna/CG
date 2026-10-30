import * as THREE from "three"
import { Bullet } from "../entity/Bullet.js";

export class Gun {
    constructor(playerCamera, gunModel, bulletModel) {

        this.gunModel = gunModel
        this.bulletModel = bulletModel
        this.camera = playerCamera
        this.crossbow = null
        this.restArrow = null

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
    }

    update() {
        this.attachModel()
        this.attachRestArrow()
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

        this.restArrow.visible = false
        bullets.push(new Bullet(scene, origin, direction, this.bulletModel));
    }

    attachModel() {
        if (this.crossbow || !this.gunModel || !this.gunModel.loaded) return

        const obj = this.gunModel.object

        const TAMANHO = 0.2
        const box = new THREE.Box3().setFromObject(obj)
        const size = box.getSize(new THREE.Vector3())
        obj.scale.multiplyScalar(TAMANHO / Math.max(size.x, size.y, size.z))

        box.setFromObject(obj)
        obj.position.sub(box.getCenter(new THREE.Vector3()))

        this.crossbow = new THREE.Group()
        this.crossbow.add(obj)
        this.crossbow.position.set(0, -0.05, -0.15)   // direita, abaixo, frente
        //this.crossbow.translateX(Math.PI)

        this.camera.add(this.crossbow)

        this.object.material.visible = false
    }

    attachRestArrow() {
        if (this.restArrow || !this.crossbow) return
        if (!this.bulletModel || !this.bulletModel.loaded) return

        const arrow = this.bulletModel.object.clone()

        const ARROW_LENGTH = 0.12
        const box = new THREE.Box3().setFromObject(arrow)
        const size = box.getSize(new THREE.Vector3())
        arrow.scale.multiplyScalar(ARROW_LENGTH / Math.max(size.x, size.y, size.z))

        box.setFromObject(arrow)
        arrow.position.sub(box.getCenter(new THREE.Vector3()))

        this.restArrow = new THREE.Group()
        this.restArrow.add(arrow)

        //axes para ajuste de rotacao
        // const axes = new THREE.AxesHelper(0.2) // tamanho dos eixos (em unidades locais)
        // this.restArrow.add(axes)
        // this.restArrowAxes = axes // guarda a referência, se quiser remover depois

        this.restArrow.position.set(0, 0.02, 0)
        this.restArrow.rotateY(THREE.MathUtils.degToRad(233))
        // this.restArrow.rotateX(THREE.MathUtils.degToRad(-30)) //nao consegui ;-;

        this.crossbow.add(this.restArrow)
        this.restArrow.visible = true
    }

    setArrowVisible(visible) {
        if (this.restArrow) this.restArrow.visible = visible
    }
}