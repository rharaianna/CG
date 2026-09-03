import * as THREE from "three";

export const materials = {
    grass: new THREE.MeshStandardMaterial({
        color: "#1bdb4b",
        roughness: 0.8,
    }),
    bricks: new THREE.MeshStandardMaterial({
        color: "#4c4948",
        roughness: 0.8,
    })
}