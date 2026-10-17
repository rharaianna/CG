import { materials } from "../material.configs.js";
import { Model } from "../Model.js";
import { Ceil } from "../structures/Ceil.js";
import { Wall } from "../structures/Wall.js";
import * as THREE from 'three';

export class House extends Model {
    constructor(scene, x, y, z, config) {
        super(x, y, z);
        this.scene = scene

        const {
            WIDTH,
            DEPTH,
            HEIGHT,
            floor_material,
            wall_material,
            roof_material,
            roofHeight, 
            roofSides,
            roofRotation,
            doors,
            windows,
        } = config

        const wallDepth = 0.5
        const wallX = WIDTH/2 - wallDepth/2
        const wallZ = DEPTH/2 - wallDepth/2

        // frontal e traseira: comprimento total em X
        const backWall = new Wall(0, HEIGHT/2, -wallZ, wall_material, WIDTH, HEIGHT, wallDepth, doors);
        const frontalWall = new Wall(0, HEIGHT/2, wallZ, wall_material, WIDTH, HEIGHT, wallDepth, doors);

        // laterais: comprimento em Z, descontando as espessuras das paredes frontal/traseira
        const sideLength = DEPTH - wallDepth * 2
        const leftWall = new Wall(-wallX, HEIGHT/2, 0, wall_material, sideLength, HEIGHT, wallDepth, windows);
        const rightWall = new Wall(wallX, HEIGHT/2, 0, wall_material, sideLength, HEIGHT, wallDepth, windows);

        leftWall.object.rotateY(THREE.MathUtils.degToRad(90))
        rightWall.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(backWall)
        this.add(frontalWall)
        this.add(leftWall)
        this.add(rightWall)

        const floorDepth = 0.1
        const floor = new Ceil(0, floorDepth/2, 0, floor_material, WIDTH, floorDepth, DEPTH)
        const ceil = new Ceil(0, HEIGHT - floorDepth/2, 0, floor_material, WIDTH, floorDepth, DEPTH)

        this.add(ceil)
        this.add(floor)
        
        // piramide
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(0.9*WIDTH, roofHeight, roofSides),
            roof_material
        );
        
        roof.position.y = HEIGHT + (roofHeight / 2); 
        roof.rotateY(roofRotation);

        this.add(roof)


        this.light = new THREE.PointLight("#ff9e1f", 80, HEIGHT*3)
        this.light.position.set(0, HEIGHT-floorDepth*3, 0)
        this.add(this.light)
    }
}