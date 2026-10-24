import { FBXLoader } from "../../../build/jsm/loaders/FBXLoader.js"
import { OBJLoader } from "../../../build/jsm/loaders/OBJLoader.js"
import { materials } from "./material.configs.js"
import * as THREE from "three";

const SHY_GHOST_PATH = new URL("../assets/shy_ghost.fbx", import.meta.url).href
const EVIL_TREE_PATH = new URL("../assets/evil_tree.fbx", import.meta.url).href
const CROSSBOW_PATH = new URL("../assets/crossbow.obj", import.meta.url).href
const ARROW_PATH = new URL("../assets/arrow.obj", import.meta.url).href

export class Objects3D {
    constructor(scene) {
        this.scene = scene
    }

    loadObject(loader, path, material, scale, addToScene) {
        const asset = {
            object: null,
            loaded: false,
        }

        loader.load(
            path,
            (obj) => {
                obj.scale.set(scale, scale, scale)

                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true

                        if(material != null)
                            child.material = material
                    }
                })

                obj.updateMatrixWorld(true)

                if (addToScene) {
                    this.scene.add(obj)
                }

                asset.object = obj
                asset.loaded = true
            },
            null,
            (error) => {
                console.error(`Erro ao carregar ${path}:`, error)
            }
        )

        return asset
    }

    loadFBX(path, scale, addToScene) {
        return this.loadObject(new FBXLoader(), path, scale, addToScene)
    }

    loadOBJ(path, scale, addToScene) {
        return this.loadObject(new OBJLoader(), path, scale, addToScene)
    }

    loadGhost() {
        return this.loadFBX(SHY_GHOST_PATH, materials.ghost, 0.5, false)
    }

    loadTree() {
        return this.loadFBX(EVIL_TREE_PATH, materials.tree, 5, false)
    }

    loadCrossbow() {
        return this.loadOBJ(CROSSBOW_PATH, null, 2, false)
    }

    loadArrow() {
        return this.loadOBJ(ARROW_PATH, null, 1, false)
    }
}

// _load(loader, path, scale = 1, addToScene = true, texturePath = null) {
//     const asset = { object: null, loaded: false }

//     loader.load(
//         path,
//         (obj) => {
//             obj.scale.set(scale, scale, scale)

//             let texture = null
//             if (texturePath) {
//                 texture = new THREE.TextureLoader().load(texturePath)
//                 texture.colorSpace = THREE.SRGBColorSpace
//                 texture.flipY = false
//             }

//             obj.traverse((child) => {
//                 if (child.isMesh) {
//                     child.castShadow = true

//                     if (texture) {
//                         child.material = new THREE.MeshStandardMaterial({
//                             map: texture,
//                             roughness: 0.6,
//                         })
//                     }
//                 }
//             })

//             obj.updateMatrixWorld(true)
//             if (addToScene) this.scene.add(obj)

//             asset.object = obj
//             asset.loaded = true
//         },
//         null,
//         (error) => console.error(`Erro ao carregar ${path}:`, error)
//     )

//     return asset
// }

// loadFBX(path, scale = 1, addToScene = true, texturePath = null) {
//     return this._load(new FBXLoader(), path, scale, addToScene, texturePath)
// }

// loadShyGhost() {
//     return this.loadFBX(SHY_GHOST_PATH, 2, true, GHOST_TEXTURE_PATH)
// }

// loadHappyGhost() {
//     return this.loadFBX(HAPPY_GHOST_PATH, 2, true, GHOST_TEXTURE_PATH)
// }