import * as THREE from 'three';
import { Capsule } from '../../../build/jsm/math/Capsule.js';


const GRAVITY = 98

export class PlayerPhysics {
    constructor(worldOctree) {
        this.worldOctree = worldOctree;
        this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.playerOnFloor = false;
    }

    playerCollisions() {
        this.playerOnFloor = false;
        const result = this.worldOctree.capsuleIntersect(this.playerCollider);

        if (result) {
            this.playerOnFloor = result.normal.y >= 0.15;

            if (!this.playerOnFloor) {
                this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
            }

            if (result.depth >= 1e-10) {
                this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
            }
        }

    }

    updatePlayer(deltaTime) {
        let damping = Math.exp(-4 * deltaTime) - 1;

        if (!this.playerOnFloor) {
            this.playerVelocity.y -= GRAVITY * deltaTime;
            damping *= 0.1 //resitencia ao ar
        }

        this.playerVelocity.addScaledVector(this.playerVelocity, damping);

        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        this.playerCollider.translate(deltaPosition);

        this.playerCollisions();

        //camera.position.copy(playerCollider.end);

    }

    getForwardVector(camera) {
        camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0
        this.playerDirection.normalize();

        return this.playerDirection;
    }

    getSideVector(camera) {
        camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0
        this.playerDirection.normalize();
        this.playerDirection.cross(camera.up)

        return this.playerDirection;
    }

    teleportPlayerIfOob(camera) {
        if (camera.position.y <= - 25) {
            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35;
            camera.position.copy(this.playerCollider.end);
            camera.rotation.set(0, 0, 0);
        }
    }
}