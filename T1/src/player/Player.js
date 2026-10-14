import * as THREE from 'three';
import { PlayerController } from "./PlayerController.js";
import { PlayerPhysics } from "./PlayerPhysics.js";

export class Player {

    constructor(worldOctree, camera, inicialPosition) {

      this.playerHeight = 2
      this.camera = camera
      this.controller = new PlayerController();
      this.physics = new PlayerPhysics(worldOctree, inicialPosition, this.playerHeight);
      this.isMoving = false
      this.speed = 1.8

    }

    moveControls(deltaTime) {
      let speedDelta = deltaTime

      if(this.physics.playerOnFloor){
        if(this.controller.moveFaster){
          speedDelta *= 200
        } else {
          speedDelta *= 100
        }
      } else {
        speedDelta *= 50
      }
    
      if (this.controller.moveForward) {
        this.physics.playerVelocity.add(this.physics.getForwardVector(this.camera).multiplyScalar(speedDelta))
      }
      if (this.controller.moveBackward) {
        this.physics.playerVelocity.add(this.physics.getForwardVector(this.camera).multiplyScalar(-speedDelta))
      }
    
      if (this.controller.moveLeft) {
        this.physics.playerVelocity.add(this.physics.getSideVector(this.camera).multiplyScalar(-speedDelta))
      }
      if (this.controller.moveRight) {
        this.physics.playerVelocity.add(this.physics.getSideVector(this.camera).multiplyScalar(speedDelta))
      }
    
      if (this.physics.playerOnFloor) {
        if (this.controller.moveUp)
          this.physics.playerVelocity.y = 25;
      }
    }

    update(deltaTime) {
      
      this.moveControls(deltaTime)
      this.physics.updatePlayer(deltaTime)
      this.isMoving = this.getIsPlayerMoving()
      
      this.camera.position.copy(this.physics.playerCollider.end);
      this.physics.teleportPlayerIfOob(this.camera);

    }

    getPosition() {
      return this.camera.position.clone()
    }

    getIsPlayerMoving() {
      const velocity = this.physics.playerVelocity;
      return Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1
    }
}

