import * as THREE from "three"
import { Model } from "../Model.js"
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToTower } from "../../utils/CSGModifiers.js";
import { applyHolesToWall } from "../../utils/CSGModifiers.js";

const evaluator = new Evaluator();

export class MidTower extends Model {
    constructor(x, y, z, material, width, height, depth, brickHeight, doorConfig) {
        super(x, y, z, material)

        const geometry = new THREE.BoxGeometry(width, height, depth)
        let mesh = new THREE.Mesh(geometry, this.material)

        const radius = 1;
        const brickWidth = 0.3 * radius
        const brickDepth = 0.6 * radius
        const merlonsNumber = 8

        const miniTowers = new THREE.Group()

        // adiciona os merloes no c
        for (let i = 0; i < merlonsNumber; i++) {

            const angle = (i / merlonsNumber) * Math.PI * 2
            const merlon = new THREE.Mesh(new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth), this.material)

            merlon.position.set(
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
            )

            merlon.rotation.y = -angle
            miniTowers.add(merlon)
        }

        mesh = this.renderWindows(doorConfig, mesh, width / 3, height, depth)
    
        miniTowers.position.set(width / 2 - radius, radius, 2)

        this.object.add(miniTowers)
        this.object.add(mesh)
    }

    renderWindows(doorConfig, mesh, wallWidth, wallHeight, wallDepth) {
        if (!doorConfig) {
            return mesh;
        }
        const {
            portao = true,
            alturaPortao = wallHeight / 2,
            larguraPortao = wallWidth / 2,
            holes: customHoles = [],
        } = doorConfig;

        //======== INICIO PARTE DAS JANELAS E PORTAO========

        const holes = [...customHoles];
        // 1. Adiciona o portão em arco (U invertido) se ativado
        if (portao && alturaPortao > 0 && larguraPortao > 0) {
            holes.push({
                x: (wallWidth / 2) - (larguraPortao / 2),
                y: 0,
                width: larguraPortao,
                height: alturaPortao,
                type: 'arch'
            });
        }
        return applyHolesToWall(
            mesh,
            wallWidth,
            wallHeight,
            wallDepth,
            holes
        );

    }
}
