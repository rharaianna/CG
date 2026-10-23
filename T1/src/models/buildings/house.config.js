import { materials } from "../material.configs.js"

export const config = {
    
    MAIN_HOUSE: {
        floor_material: materials.light_wood,
        wall_material: materials.light_wood,
        roof_material: materials.roof_brick,
        WIDTH: 10,
        DEPTH: 10,
        HEIGHT: 5,
        roofSides: 6,
        roofHeight: 4,
        doors: {
            portao: true,
            alturaPortao: 4,
            larguraPortao: 2,
            material: materials.orange
        },
        windows: {
            linhas: 1,
            colunas: 1,
            altura: 2,
            largura: 2,
            material: materials.orange
        },
        roofRotation: 0
    },
    SECOND_HOUSE: {
        floor_material: materials.light_wood,
        wall_material: materials.moss_brick,
        roof_material: materials.blue,
        WIDTH: 7,
        DEPTH: 7,
        HEIGHT: 20,
        roofSides: 8,
        roofHeight: 12,
        doors: {
            portao: true,
            alturaPortao: 5,
            larguraPortao: 2,
            material: materials.moss_brick
        },
        windows: {
            linhas: 3,
            colunas: 1,
            altura: 1,
            largura: 2,
            material: materials.moss_brick
        },
        roofRotation: Math.PI / 4
    }
}