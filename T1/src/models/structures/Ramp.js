import * as THREE from "three";
import { Model } from "../Model.js";


export class Ramp extends Model {
    constructor(x, y, z, material, stepWidth, stepHeight, stepDepth, stepNumber) {
        super(x, y, z, material);
        const totalHeight = stepHeight * stepNumber; // altura total (cateto oposto)
        const totalDepth  = stepDepth  * stepNumber; // profundidade total (cateto adjacente)
        const slopeLen    = Math.sqrt(totalHeight ** 2 + totalDepth ** 2); // hipotenusa

        // Ângulo de inclinação em relação ao plano XZ
        const angle = -Math.atan2(totalHeight, totalDepth);

        // Espessura da caixa (suficiente para o Octree detectar colisão)
        const THICKNESS = 0.5;

        const geometry = new THREE.BoxGeometry(stepWidth, THICKNESS, slopeLen);
        const mesh = new THREE.Mesh(geometry, material);

        // Inclina a caixa no mesmo ângulo da escada, em torno do eixo X
        mesh.rotation.x = angle;

        // Centraliza a caixa no meio do percurso inclinado:
        //   • centro Z = metade da profundidade total
        //   • centro Y = metade da altura total,
        //     deslocado para baixo pela metade da espessura projetada
        mesh.position.set(
            0,
            totalHeight / 2 - (THICKNESS / 2) * Math.cos(angle),
            totalDepth  / 2 + (THICKNESS / 2) * Math.sin(angle)
        );

        // Invisível - apenas a escada visual é renderizada
        mesh.visible = false;

        // Marca para identificação externa (ex.: exclusão do Octree se necessário)
        mesh.userData.isCollisionRamp = true;

        // Expõe a malha para uso externo (ex.: Castle.js pode acessar ramp.collisionMesh)
        this.collisionMesh = mesh;

        this.object.position.set(x, y, z);
        this.add(mesh);
    }
}
