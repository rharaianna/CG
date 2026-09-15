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

        const MAIN_CUBE_WIDTH = width / 3
        const MAIN_CUBE_DEPTH = depth
        const MAIN_CUBE_HEIGHT = height

        const MERLON_WIDTH = 0.35 * MAIN_CUBE_WIDTH
        const MERLON_HEIGHT = 0.05 * height
        const MERLON_DEPTH = 0.1 * MAIN_CUBE_DEPTH

        const mainCube = new THREE.BoxGeometry(MAIN_CUBE_WIDTH, MAIN_CUBE_HEIGHT, MAIN_CUBE_DEPTH)
        const mainLateralCube = new THREE.BoxGeometry(MAIN_CUBE_WIDTH, MAIN_CUBE_HEIGHT, MAIN_CUBE_DEPTH)

        const merlonGeometry = new THREE.BoxGeometry(MERLON_WIDTH, MERLON_HEIGHT, MERLON_DEPTH);

        let cube0 = new THREE.Mesh(mainCube, this.material)
        cube0 = this.renderWindows(doorConfig, cube0, width / 3, height, depth)
        cube0.translateZ(-depth / 3)

        let cube1 = new THREE.Mesh(mainLateralCube, this.material)
        cube1.translateX(width / 3)

        let cube2 = new THREE.Mesh(mainLateralCube, this.material)
        cube2.translateX(-width / 3)

        // detalhes
        const FRONTAL_CUBE_DEPTH = depth / 3
        const frontalCube = new THREE.BoxGeometry(width / 5, height, FRONTAL_CUBE_DEPTH)

        let cube3 = new THREE.Mesh(frontalCube, this.material)
        cube3.translateX(width / 3)
        cube3.translateZ(depth / 2 + depth / 6)

        let cube4 = new THREE.Mesh(frontalCube, this.material)
        cube4.translateX(-width / 3)
        cube4.translateZ(depth / 2 + FRONTAL_CUBE_DEPTH / 2)

        const cubes = [
            cube0,
            cube1,
            cube2
        ];


        addMerlonsX(
            cube0,
            [-1, -2 / 3, 1],
            [-1, 1]
        );

        addMerlonsZ(
            cube0,
            [-1, 1],
            [-1, 1]
        );

        addMerlonsX(
            cube1,
            [-1, 2 / 3, 1],
            [-1, 1]
        );

        addMerlonsZ(
            cube1,
            [1],
            [-1, 0, 1]
        );

        addMerlonsX(
            cube2,
            [-1, -2 / 3, 2 / 3, 1],
            [-1, 1]
        );

        addMerlonsZ(
            cube2,
            [-1, 1],
            [1, -1]
        );

        function addMerlonsX(cube, positionsX, positionsZ) {

            positionsX.forEach(xSide => {
                positionsZ.forEach(zSide => {

                    const merlon = new THREE.Mesh(
                        merlonGeometry,
                        material
                    );

                    merlon.position.set(
                        xSide * (
                            MAIN_CUBE_WIDTH / 2
                            - MERLON_WIDTH / 2
                        ),
                        MAIN_CUBE_HEIGHT / 2 +
                        MERLON_HEIGHT / 2,
                        zSide * (
                            MAIN_CUBE_DEPTH / 2
                            - MERLON_DEPTH / 2
                        )
                    );

                    cube.add(merlon);
                });
            });
        }

        function addMerlonsZ(cube, positionsX, positionsZ) {

            positionsX.forEach(xSide => {
                positionsZ.forEach(zSide => {

                    const merlon = new THREE.Mesh(
                        merlonGeometry,
                        material
                    );

                    merlon.position.set(
                        xSide * (
                            MAIN_CUBE_WIDTH / 2
                            - MERLON_DEPTH / 2
                        ),
                        MAIN_CUBE_HEIGHT / 2 +
                        MERLON_HEIGHT / 2,
                        zSide * (
                            MAIN_CUBE_DEPTH / 2
                            - MERLON_WIDTH / 2
                        )
                    );

                    merlon.rotation.y = Math.PI / 2;

                    cube.add(merlon);
                });
            });
        }

        mesh.add(cube0)
        mesh.add(cube1)
        mesh.add(cube2)
        mesh.add(cube3)
        mesh.add(cube4)

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
