import * as THREE from 'three';

const BULLET_VELOCITY = 150
const BULLET_Y_VELOCITY_DECAY = 0.001
const MAX_DISTANCE = 150

const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const bulletMaterial = new THREE.MeshStandardMaterial({
    color: '#D70413',
    roughness: 0.8,
    metalness: 0.1
});

export class Bullet {
    constructor(scene, posicaoInicial, direction) {
        this.scene = scene
        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.mesh.position.copy(posicaoInicial);

        this.origin = posicaoInicial.clone();
        this.prevPosition = posicaoInicial.clone();
        
        this.direction = direction.clone().normalize()

        this.velocity = direction.clone().setY(direction.y - BULLET_Y_VELOCITY_DECAY).normalize().multiplyScalar(BULLET_VELOCITY);
        
        this.alive = true;
        this.damage = 1

        this.scene.add(this.mesh)
    }

    update(deltaTime) {

        this.prevPosition.copy(this.mesh.position)
        this.mesh.position.addScaledVector(this.velocity, deltaTime)

        // cuida do caso de sair da distancia máxima
        if (this.mesh.position.distanceTo(this.origin) >= MAX_DISTANCE) 
            this.destroy()
    }

    destroy() {
        this.scene.remove(this.mesh)
        this.alive = false
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
}