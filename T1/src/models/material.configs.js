import * as THREE from "three";

export const materials = {
    grass: new THREE.MeshLambertMaterial({
        color: "#4b6c41",

    }),
    bricks: new THREE.MeshLambertMaterial({
        color: "#a8987e",

    }),
    rotten_wood: new THREE.MeshLambertMaterial({
        color: "#312921",

    }),
    water: new THREE.MeshLambertMaterial({
        color: "#2a5a85",

    }),
    ghost: new THREE.MeshLambertMaterial({
        color: "#dde6ff",
        transparent: !true,
        opacity: 0.75,
        emissive: "#8899cc",
        emissiveIntensity: 0.4,
        roughness: 0.5,
    }),
    tree: new THREE.MeshLambertMaterial({
        color: "#EB5E28"
    })
}
