import * as THREE from "three";
import { Model } from "./Model.js";
import { materials } from "./material.configs.js";
import { createArchGeometry } from "../utils/ArchGeometry.js";

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
        const platform_depth = this.depth / 3
        const gap_depth = this.depth / 6
        const walkway_depth = entrence_depth + (3 * corridor_depth) / 2 + platform_depth / 2 + gap_depth


        const entrence_geometry = new THREE.BoxGeometry(this.width, this.height, entrence_depth)
        const entrence = new THREE.Mesh(entrence_geometry, this.material);

        const corridor_geometry = new THREE.BoxGeometry(this.width, this.height, corridor_depth);
        const corridor = new THREE.Mesh(corridor_geometry, this.material);

        //const platform_geometry = new THREE.BoxGeometry(platform_depth, this.height, platform_depth)

        const platform_geometry = new THREE.CylinderGeometry(platform_depth, platform_depth, this.height, 6);
        const platform = new THREE.Mesh(platform_geometry, this.material)

        const walkway_geometry = new THREE.BoxGeometry(this.width / 3, this.height / 3, walkway_depth)
        const walkway = new THREE.Mesh(walkway_geometry, materials.bricks)

        const forma = new THREE.Shape();

        forma.moveTo(-this.width / 2, entrence_depth / 2);
        forma.lineTo(this.width / 2, entrence_depth / 2);
        forma.lineTo(this.width / 6, -entrence_depth / 2);
        forma.lineTo(-this.width / 6, -entrence_depth / 2);
        forma.closePath();

        const geometria = new THREE.ExtrudeGeometry(forma, { depth: this.height / 3, bevelEnabled: false });

        const funil = new THREE.Mesh(geometria, materials.bricks);
        funil.rotateX(-Math.PI / 2)
        funil.translateY(walkway_depth / 2)
        funil.translateZ(0.0002 - this.height / 6)

        walkway.add(funil);


        const arc_height = 7
        const arc_depth = (this.width / 3) - 0.02
        const arc_width = this.depth / 5

        const corridor_arc_geometry = createArchGeometry(arc_width, arc_height, arc_depth)
        const corridor_arc = new THREE.Mesh(corridor_arc_geometry, materials.bricks)

        corridor.add(corridor_arc)
        corridor_arc.rotateY(Math.PI / 2)
        corridor_arc.translateX(2 - 2 * arc_width)
        corridor_arc.translateY(this.height / 2 + arc_height / 2)
        corridor_arc.translateZ(arc_depth)

        this.add(entrence)
        this.add(corridor)
        this.add(platform)
        this.add(walkway)

        entrence.translateZ(-(corridor_depth / 2 + gap_depth + entrence_depth / 2))
        platform.translateZ(corridor_depth)
        platform.rotateY(Math.PI / 2)
        walkway.translateZ((9.89 * this.depth) / 40)
        walkway.translateY(0.05 + this.height / 3)


    }




}