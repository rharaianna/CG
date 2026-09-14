import * as THREE from 'three';

const BULLET_RADIUS = 0.2
const BULLET_VELOCITY = 50

export class Bullet {
    constructor(scene, posicaoInicial, direction) {
        const bulletGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const bulletMaterial = new THREE.MeshBasicMaterial({color: '#D70413'});

        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.mesh.position.copy(posicaoInicial);
        scene.add(this.mesh)

        this.velocity = direction.clone().normalize().multiplyScalar(BULLET_VELOCITY);
        this.alive = true;
        this.tempoVida = 2; // segundos até desaparecer, caso não bata em nada
  }

    update(deltaTime, worldOctree, scene) {

        this.mesh.position.addScaledVector(this.velocity, deltaTime);
        this.tempoVida -= deltaTime;

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

        if(this.tempoVida <= 0){
            this.alive = false;
            scene.remove(this.mesh);
        }
    }
}