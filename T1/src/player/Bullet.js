import * as THREE from 'three';

const BULLET_RADIUS = 0.2
const BULLET_VELOCITY = 100
const MAX_DISTANCE = 50

export class Bullet {
    constructor(scene, posicaoInicial, direction) {
        const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const bulletMaterial = new THREE.MeshStandardMaterial({
            color: '#D70413', 
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.mesh.position.copy(posicaoInicial);
        scene.add(this.mesh)

        this.origin = posicaoInicial.clone();

        this.velocity = direction.clone().normalize().multiplyScalar(BULLET_VELOCITY);
        this.alive = true;
  }

    update(deltaTime, worldOctree, scene) {

        this.mesh.position.addScaledVector(this.velocity, deltaTime);

        const ray = new THREE.Ray(
            this.mesh.position.clone().addScaledVector(this.velocity, -deltaTime),
            this.velocity.clone().normalize()
        );
        
        const distance = this.velocity.length() * deltaTime;
        const result = worldOctree.rayIntersect(ray);

        if(result && result.distance <= distance){
            this.alive = false;
            scene.remove(this.mesh);
            return;
        }

        const distanciaPercorrida = this.mesh.position.distanceTo(this.origin);
        if (distanciaPercorrida >= MAX_DISTANCE) {
            this.alive = false;
            scene.remove(this.mesh);
        }
    }
}