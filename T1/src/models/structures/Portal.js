
import * as THREE from "three";
import { Model } from "../Model.js";
import { enemiesConfig } from "../../entity/enemy.config.js";
import { KEYS_CONFIG } from "../../entity/key.config.js";

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
            8,
            1,
            true
        );

        this.active = false
        this.activeTime = 0

        const body = new THREE.Mesh(bodyGeometry, this.material);
        body.position.y = -height / 2;
        this.object.add(body);
        
        const lightPositions = [
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(-1, 0, 1),
        ];

        const enemyConfigs = [
            enemiesConfig.FLYING_FIRST,
            enemiesConfig.WALKING_SECOND,
            enemiesConfig.FLYING_SECOND,
            enemiesConfig.WALKING_FIRST,
        ];

        this.lights = enemyConfigs.map((config, index) => {
            const color = KEYS_CONFIG[config.key].color;
            const light = new THREE.PointLight(color, 50, 5, 0.5);

            light.position.copy(lightPositions[index]);

            return light;
        });
        
        // Aro fixo ao redor da abertura.
        const rimGeometry = new THREE.TorusGeometry(
            radius,
            Math.max(radius * 0.04, 0.08),
            8,
            8
        );

        const rim = new THREE.Mesh(rimGeometry, this.material);
        rim.rotation.x = -Math.PI / 2;
        rim.position.y = 0.015;
        this.object.add(rim);

        // Tampa circular que será redimensionada.
        this.lidGeometry = new THREE.CircleGeometry(radius, 8);
        this.lid = new THREE.Mesh(this.lidGeometry, this.material);

        this.lid.rotation.x = -Math.PI / 2;
        this.lid.position.y = 0.002;

        this.object.add(this.lid);
    }

    update(deltaTime, playerPosition) {
        if (!this.active) return;
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

        if (this.active) {

            const velocity = 1.2;
            this.activeTime += deltaTime;

            // para nao ficar somando valores infinitamente 
            // e em algum momento dar ruim por estourar memoria
            this.activeTime %= (2 * Math.PI) / velocity;

            
            this.lights.forEach((light, index) => {
                const angle = this.activeTime * velocity + index * (Math.PI / 2);

                light.position.x = Math.sin(angle) * this.radius;
                light.position.z = Math.cos(angle) * this.radius;
            });
        }
    }

    // permite portal abrir e adiciona as luzes
    setActive() {
        if (this.active) 
            return;

        this.active = true;

        this.lights.forEach(light => {
            this.object.add(light);
        });

        this.object.add(this.lightBase);
    }
}
