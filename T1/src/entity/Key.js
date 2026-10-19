import * as THREE from 'three';
import { Entity } from './Entity.js';
import { KEYS_CONFIG } from './key.config.js';

export class Key extends Entity {
    constructor(scene, config) {
        super(scene)

        const { key, position, collectible = true } = config;
  
        this.key = key
        this.color = KEYS_CONFIG[key].color
        this.scene = scene
        this.speed = 0;
        this.gravity = 9.8;
        this.floating = false;
        
        this.floatTime = 0;
        this.initialY = 0;
        
        this.sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 32, 32), 
            new THREE.MeshPhongMaterial({ 
                color: this.color, 
                emissive: this.color,
                specular: "#bab0b0",
                vertexColors: true,
                flatShading: true,
                shininess: 100,
            })
        );

        this.position = position.clone();
        this.sphere.position.copy(this.position);
        
        this.collectible = true
        this.alive = true;
        this.mesh.add(this.sphere);
        
        this.light = new THREE.PointLight(this.color, 100, 5)
        this.mesh.add(this.light)
    
        this.scene.add(this.mesh)
    }

    update(deltaTime, worldOctree, playerPosition, isPlayerMoving) {

        const minDistance = 5

        // se o jogador estiver movendo e no range, e tbm ela for coletável
        if(this.collectible && isPlayerMoving && this.detectPlayer(deltaTime, playerPosition, minDistance)) {
            this.destroy()
            return
        }

        const gravity = 0.98 * 0.9;
        
        const radius = this.sphere.geometry.parameters.radius;
        const direction = new THREE.Vector3(0, -1, 0);
        const movement = this.speed * deltaTime;
        const minHeight = 1

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
            }
            else {
                // oscila e ja retorna para permitir o caso em que so animamos ela
                // oscilando
                this.animateFloating(deltaTime, floorY)
                return
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

    // pode dar erro se ficar muito tempo ligado????
    // inicia comportamento de flutuar
    animateFloating(deltaTime, floorY) {

        const minHeight = 1.5
        const amplitude = 0.8 * minHeight
        const velocity = 2;

        this.floatTime += deltaTime;
        
        // p nao dar ruim
        this.floatTime %= (2 * Math.PI) / velocity;

        this.position.y = floorY + minHeight + amplitude * (1 - Math.cos(this.floatTime * velocity)) / 2;
    
        this.sphere.position.copy(this.position)
        this.light.position.copy(this.position)
    } 

    getKey() {
        return this.key
    }
}
