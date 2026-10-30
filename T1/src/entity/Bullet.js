import * as THREE from 'three';
import { Entity } from './Entity.js';

const hiddenMaterial = new THREE.MeshBasicMaterial({ visible: false })
const ARROW_LENGTH = 0.8
const BULLET_VELOCITY = 100
const BULLET_Y_VELOCITY_DECAY = 0.001
const MAX_DISTANCE = 150

const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const bulletMaterial = new THREE.MeshStandardMaterial({
    color: '#D70413',
    roughness: 0.8,
    metalness: 0.1
});

export class Bullet extends Entity {
    constructor(scene, posicaoInicial, direction, model) {
        super(scene)

        this.scene = scene
        this.model = model

        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.mesh.position.copy(posicaoInicial);

        this.origin = posicaoInicial.clone();
        this.prevPosition = posicaoInicial.clone();

        this.direction = direction.clone().normalize()

        this.velocity = direction.clone().setY(direction.y - BULLET_Y_VELOCITY_DECAY).normalize().multiplyScalar(BULLET_VELOCITY);

        //this.alive = true;
        this.damage = 1

        this.attachModel()
        this.mesh.lookAt(posicaoInicial.clone().add(this.direction))

        this.scene.add(this.mesh)
    }

    update(deltaTime) {

        this.prevPosition.copy(this.mesh.position)
        this.mesh.position.addScaledVector(this.velocity, deltaTime)

        // cuida do caso de sair da distancia máxima
        if (this.mesh.position.distanceTo(this.origin) >= MAX_DISTANCE)
            this.destroy()
    }

    // raio e a distance percorrido no último update pra detectar se 
    // teve hit com alguma coisa
    getSweep() {
        return {
            ray: new THREE.Ray(this.prevPosition.clone(), this.direction),
            distance: this.prevPosition.distanceTo(this.mesh.position),
        }
    }

    /* update(deltaTime, worldOctree, scene) {

        this.mesh.position.addScaledVector(this.velocity, deltaTime);

        const ray = new THREE.Ray(
            this.mesh.position.clone().addScaledVector(this.velocity, -deltaTime),
            this.velocity.clone().normalize()
        );

        const distance = this.velocity.length() * deltaTime;
        const result = worldOctree.rayIntersect(ray);

        if (result && result.distance <= distance) {
            this.alive = false;
            scene.remove(this.mesh);
            return;
        }

        const distanciaPercorrida = this.mesh.position.distanceTo(this.origin);
        if (distanciaPercorrida >= MAX_DISTANCE) {
            this.alive = false;
            scene.remove(this.mesh);
        }
    } */

    attachModel() {
        if (!this.model || !this.model.loaded) return   // sem modelo, a bala continua sendo a esfera

        // clone() simples basta: o OBJ não tem esqueleto e compartilha geometria e material
        const arrow = this.model.object.clone()

        // escala: ajusta o maior lado para ARROW_LENGTH
        const box = new THREE.Box3().setFromObject(arrow)
        const size = box.getSize(new THREE.Vector3())
        arrow.scale.multiplyScalar(ARROW_LENGTH / Math.max(size.x, size.y, size.z))

        // centraliza na origem
        box.setFromObject(arrow)
        arrow.position.sub(box.getCenter(new THREE.Vector3()))

        // pivô: alinha o comprimento da flecha com o eixo +Z
        this.pivot = new THREE.Group()
        this.pivot.add(arrow)

        //alinha ponta pra frente
        this.pivot.rotateY(THREE.MathUtils.degToRad(53))

        this.mesh.add(this.pivot)
        this.mesh.material = hiddenMaterial
    }
}