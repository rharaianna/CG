import * as THREE from "three";
import { Model } from "./Model.js";
import { materials } from "./material.configs.js";

export class Bridge extends Model {
    constructor(x, y, z, material, width, height, depth) {
        super(x, y, z, material)

        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        this.width = width;
        this.height = height;
        this.depth = depth;


        const entrence_depth = this.depth / 4
        const corridor_depth = this.depth
        const platform_depth = this.depth
        const gap_depth = this.depth / 6
        const walkway_depth = entrence_depth + corridor_depth + platform_depth + 2 * gap_depth


        const entrence_geometry = new THREE.BoxGeometry(this.width, this.height, entrence_depth)
        const entrence = new THREE.Mesh(entrence_geometry, this.material);

        const corridor_geometry = new THREE.BoxGeometry(this.width, this.height, corridor_depth);
        const corridor = new THREE.Mesh(corridor_geometry, this.material);

        const platform_geometry = new THREE.BoxGeometry(platform_depth, this.height, platform_depth)
        const platform = new THREE.Mesh(platform_geometry, this.material)

        const walkway_geometry = new THREE.BoxGeometry(this.width / 3, this.height / 3, walkway_depth)
        const walkway = new THREE.Mesh(walkway_geometry, materials.bricks)

        this.add(entrence)
        this.add(corridor)
        this.add(platform)
        this.add(walkway)

        entrence.translateZ(-(corridor_depth / 2 + gap_depth + entrence_depth / 2))
        platform.translateZ(corridor_depth / 2 + gap_depth + platform_depth / 2)
        walkway.translateZ((3*this.depth)/8)
        walkway.translateY(0.01 + this.height / 3)


    }




}