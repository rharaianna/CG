import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Key extends Entity {
    constructor(scene, config) {
        super(scene)

        const { color, position } = config;

        this.sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 32, 32), 
            new THREE.MeshPhongMaterial({ 
                color, 
                emissive: color,
                specular: "#bab0b0",
                vertexColors: true,
                flatShading: true,
                shininess: 100,
            })
        );

        this.key = color
        this.scene = scene
        this.speed = 0;
        this.gravity = 9.8;
        this.floating = false;

        this.floatTime = 0;
        this.initialY = 0;

        this.position = position.clone();
        this.sphere.position.copy(this.position);

        this.alive = true;
        this.mesh.add(this.sphere);

        this.light = new THREE.PointLight(color, 100, 5)
        this.mesh.add(this.light)
    
        this.scene.add(this.mesh)
    }

    update(deltaTime, worldOctree, playerPosition, isPlayerMoving) {

        const minDistance = 5

        // se o jogador estiver movendo e no range
        if(isPlayerMoving && this.detectPlayer(deltaTime, playerPosition, minDistance)) {
            this.destroy()
            return
        }

        const minHeight = 1
        const amplitude = 0.8 * minHeight
        const gravity = 0.98 * 0.9;
        
        const radius = this.sphere.geometry.parameters.radius;
        const direction = new THREE.Vector3(0, -1, 0);
        const movement = this.speed * deltaTime;

        const ray = new THREE.Ray(this.position.clone(), direction);

        const floor = worldOctree.rayIntersect(ray);
        if(!floor)
            return

        const floorY = floor.position.y;
        const distanceToFloor = floor.distance - radius;

        if (this.floating) {

            // sobe até atingir uma altura minima
            if(this.position.y < floorY + minHeight) {
                this.speed += gravity * 0.5 * deltaTime;
                this.position.add(direction.clone().multiplyScalar(-movement));
            } else {
                this.floatTime += deltaTime;
                this.position.y = floor.position.y + minHeight + amplitude * (1 - Math.cos(this.floatTime * 1.5)) / 2;
            }

        } else {

            // desce para o chão
            this.speed += gravity * deltaTime;
            this.position.add(direction.clone().multiplyScalar(movement));

            // se a distancia for menor que o raio começa a flutuar
            if (distanceToFloor < radius) {
                this.floating = true;
                this.speed = 0;
            }
        }

        this.sphere.position.copy(this.position)
        this.light.position.copy(this.position)
    }

    getKey() {
        return this.key
    }
}
