import * as THREE from "three"
import { materials } from "../material.configs.js"

export class Gun{
    constructor (){
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
        const gunMaterial = new THREE.setDefaultMaterial(materials.gun);
        this.object = new THREE.Mesh(gunGeometry, gunMaterial);
    }
}