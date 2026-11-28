import * as THREE from 'three';
import { Water } from '../core/shaders/Water.js';

export class WaterSurface {
    constructor(scene) {
        const normals = new THREE.TextureLoader().load(
            '../assets/textures/NormalMapping/waternormals.jpg'
        );
        normals.wrapS = THREE.RepeatWrapping;
        normals.wrapT = THREE.RepeatWrapping;

        this.mesh = new Water(
            new THREE.PlaneGeometry(300, 300),
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: normals,
                waterColor: 0x2a5a85,
                sunColor: 0xffffff,
                distortionScale: 3,
                alpha: 0.9,
            }
        );

        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.set(0, 0.5, 0);
        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.mesh.material.uniforms.time.value += deltaTime;
    }
}
