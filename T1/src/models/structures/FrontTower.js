import * as THREE from "three"
import { Model } from "../Model.js"
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { applyHolesToWall } from "../../utils/CSGModifiers.js";

const evaluator = new Evaluator();

export class FrontTower extends Model {
    constructor(x, y, z, material, width, height, depth, brickHeight, doorConfig) {
        super(x, y, z, material)

        //const geometry = new THREE.BoxGeometry(width, height, depth)
        let mesh = new THREE.Group()
        
        this.width = width;
        this.height = height;
        this.depth = depth;


        const lateralCube = new THREE.BoxGeometry(width / 3, height, depth)

        let cube0 = new THREE.Mesh(lateralCube, material)
        cube0 = this.renderWindows(doorConfig, cube0, width / 3, height, depth)
        cube0.translateZ(-depth / 3)

        let cube1 = new THREE.Mesh(lateralCube, material)
        cube1.translateX(width / 3)

        let cube2 = new THREE.Mesh(lateralCube, material)
        cube2.translateX(-width / 3)


        mesh.add(cube0)
        mesh.add(cube1)
        mesh.add(cube2)

        this.object.add(mesh)




    }

    renderWindows(doorConfig, mesh, wallWidth, wallHeight, wallDepth) {
        if (!doorConfig) {
            return mesh;
        }
        const {
            portao = true,
            alturaPortao = wallHeight/2,
            larguraPortao = wallWidth/2,
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
