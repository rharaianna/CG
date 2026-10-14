import { FBXLoader } from "../../../build/jsm/loaders/FBXLoader.js"
import { OBJLoader } from "../../../build/jsm/loaders/OBJLoader.js"
import * as THREE from "three";

const SHY_GHOST_PATH = new URL("../assets/shy_ghost.fbx", import.meta.url).href
const HAPPY_GHOST_PATH = new URL("../assets/happy_ghost.fbx", import.meta.url).href
const CROSSBOW_PATH = new URL("../assets/crossbow.fbx", import.meta.url).href
const ARROW_PATH = new URL("../assets/arrow.obj", import.meta.url).href

export class Objects3D {
    constructor(scene) {
        this.scene = scene
    }

    loadObject(loader, path, scale = 1, addToScene = true) {
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

                        child.material = new THREE.MeshStandardMaterial({
                            color: 0xdde6ff,
                            transparent: !true,
                            opacity: 0.75,
                            emissive: 0x8899cc,   
                            emissiveIntensity: 0.4,
                            roughness: 0.5,
                        })
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

    loadFBX(path, scale = 1, addToScene = false) {
        return this.loadObject(new FBXLoader(), path, scale, addToScene)
    }

    loadOBJ(path, scale = 1, addToScene = true) {
        return this.loadObject(new OBJLoader(), path, scale, addToScene)
    }

    loadShyGhost() {
        return this.loadFBX(SHY_GHOST_PATH, 0.5)
    }

    loadHappyGhost() {
        return this.loadFBX(HAPPY_GHOST_PATH, 0.5)
    }

    loadCrossbow() {
        return this.loadFBX(CROSSBOW_PATH, 2)
    }

    loadArrow() {
        return this.loadOBJ(ARROW_PATH, 1, false)  // não entra na cena agora
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