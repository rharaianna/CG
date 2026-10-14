import { materials } from "../material.configs.js";
import { Model } from "../Model.js";
import { Wall } from "../structures/Wall.js";

export class House extends Model {
    constructor(scene, x, y, z, material, WIDTH, HEIGHT, DEPTH, SCALE) {
        super(x, y, z, material);

        this.scene = scene
        this.material = material



        this.backWall = new Wall(0, HEIGHT/2, 0, this.material, WIDTH, HEIGHT, 1);

        //this.showBoundingBox()

        //this.add(this.backWall)

        //this.showBoundingBox(scene)
    }
}