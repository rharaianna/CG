import { PlayerController } from "./PlayerController.js";
import { PlayerPhysics } from "./PlayerPhysics.js";

export class Player {

    constructor(worldOctree, camera) {

        this.camera = camera
        this.controller = new PlayerController();
        this.physics = new PlayerPhysics(worldOctree);
    }

    moveControls(deltaTime) {
      const speedDelta = deltaTime * (this.controller.playerOnFloor ? 100 : 50)
    
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

        this.camera.position.copy(this.physics.playerCollider.end);
        this.physics.teleportPlayerIfOob(this.camera);
    }
}

