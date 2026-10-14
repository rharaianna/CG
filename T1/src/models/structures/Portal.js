
import * as THREE from "three";
import { Model } from "../Model.js";
import { enemiesConfig } from "../../entity/enemy.config.js";

export class Portal extends Model {
    constructor(x, y, z, material, config = {}) {
        super(x, y, z, material);

        const {
            radius = 2,
            height = 0.5,
            interactionDistance = 5,
            animationSpeed = 5,
        } = config;

        this.radius = radius;
        this.interactionDistance = interactionDistance;
        this.animationSpeed = animationSpeed;

        this.currentRadius = radius;
        this.worldPosition = new THREE.Vector3();

        // Corpo cilíndrico aberto em cima e embaixo.
        const bodyGeometry = new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            48,
            1,
            true
        );

        
        const body = new THREE.Mesh(bodyGeometry, this.material);
        body.position.y = -height / 2;
        this.object.add(body);
        
        this.lightRed = new THREE.PointLight(enemiesConfig.FLYING_RED.color, 50, 5,0.5)
        this.object.add(this.lightRed)
        this.lightRed.position.set(-1,0,-1)

        this.lightPurple = new THREE.PointLight(enemiesConfig.WALKING_PURPLE.color, 50, 5, 0.5)
        this.object.add(this.lightPurple)
        this.lightPurple.position.set(1,0,-1)

        this.lightBlue = new THREE.PointLight(enemiesConfig.FLYING_BLUE.color, 50, 5,0.5)
        this.object.add(this.lightBlue)
        this.lightBlue.position.set(1,0,1)

        this.lightOrange = new THREE.PointLight(enemiesConfig.WALKING_ORANGE.color, 50, 5,0.5)
        this.object.add(this.lightOrange)
        this.lightOrange.position.set(-1,0,1)

        this.lightBase = new THREE.PointLight('white', 10, 5,0.5)
        this.object.add(this.lightBase)
        this.lightBase.position.set(0,0,0)
        
        // Aro fixo ao redor da abertura.
        const rimGeometry = new THREE.TorusGeometry(
            radius,
            Math.max(radius * 0.04, 0.08),
            8,
            48
        );

        const rim = new THREE.Mesh(rimGeometry, this.material);
        rim.rotation.x = -Math.PI / 2;
        rim.position.y = 0.015;
        this.object.add(rim);

        // Tampa circular que será redimensionada.
        this.lidGeometry = new THREE.CircleGeometry(radius, 48);
        this.lid = new THREE.Mesh(this.lidGeometry, this.material);

        this.lid.rotation.x = -Math.PI / 2;
        this.lid.position.y = 0.002;

        this.object.add(this.lid);
    }

    update(deltaTime, playerPosition) {
        if (!playerPosition) return;

        // Obtém a posição global do portal.
        this.object.getWorldPosition(this.worldPosition);

        // Verifica a distância entre o jogador e o portal.
        const distance = playerPosition.distanceTo(
            this.worldPosition
        );

        // Perto: tampa desaparece.
        // Longe: tampa volta ao tamanho original.
        const targetRadius =
            distance <= this.interactionDistance
                ? 0
                : this.radius;

        // Suaviza a transição.
        const factor =
            1 - Math.exp(-this.animationSpeed * deltaTime);

        this.currentRadius = THREE.MathUtils.lerp(
            this.currentRadius,
            targetRadius,
            factor
        );

        const lidScale = Math.max(this.currentRadius / this.radius, 0.001);
        this.lid.scale.set(lidScale, lidScale, 1);

    }
}
