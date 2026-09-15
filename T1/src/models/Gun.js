import * as THREE from "three"

export class Gun{
    constructor (){
        const gunGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12);
        const gunMaterial = new THREE.MeshBasicMaterial({color:'#bebebe'});
        this.object = new THREE.Mesh(gunGeometry, gunMaterial);
    }
}