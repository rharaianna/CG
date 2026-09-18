import * as THREE from "three";

export const materials = {
    grass: new THREE.MeshStandardMaterial({
        color: "#4f922f",
        roughness: 0.8,
    }),
    bricks: new THREE.MeshStandardMaterial({
        color: "#a8987e",
        roughness: 1,
    }),
    rotten_wood: new THREE.MeshStandardMaterial({
        color: "#312921",
        roughness: 1,
    }),
    water: new THREE.MeshStandardMaterial({
        color: "#2a5a85",
        roughness: 0.1,
    })
}