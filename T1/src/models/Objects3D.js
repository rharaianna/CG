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
        return this.loadOBJ(CROSSBOW_PATH, materials.crossbow, 2, false)
    }

    loadArrow() {
        return this.loadOBJ(ARROW_PATH, materials.arrow, 1, false)
    }
}