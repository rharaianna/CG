import * as THREE from "three";
import { Model } from "../Model.js";
import { Tower } from "../structures/Tower.js";
import { Floor } from "../structures/Floor.js";

import { materials } from "../material.configs.js"
import { Wall } from "../structures/Wall.js";
import { CastleWall } from "../structures/CastleWall.js";

export class Castle extends Model {
    constructor(x, y, z, material, WIDTH, DEPTH, SCALE) {
        super(x, y, z, materials.bricks);

        // parâmetros ajustáveis do castelo
        // são atualizados conforme a escala e alteraram todas as paredes e torres
        
        // largura -> eixo X (vermelho)
        WIDTH *= SCALE

        // profundidade -> eixo Z (azul)
        DEPTH *= SCALE
         
        // chão tem as mesmas dimensões do castelo
        const FLOOR_WIDTH = WIDTH
        const FLOOR_DEPTH = DEPTH
        const FLOOR_HEIGHT = 0.1 * SCALE
        
        // paredes
        const WALL_HEIGHT = 15 * SCALE
        const WALL_DEPTH = 3 * SCALE
        
        // posicionamento das paredes
        const wallY = WALL_HEIGHT/2 
        
        // as posicionadas no X, paralelas ao Z (azul), usam a largura do castelo 
        const wallX = WIDTH/2 + WALL_DEPTH/2
        
        // as posicionadas no Z usam a profundidade do castelo
        const wallZ = DEPTH/2 + WALL_DEPTH/2

        // torres
        const TOWER_HEIGHT = 28 * SCALE
        const TOWER_RADIUS = 9 * SCALE
        const TOWER_RADIAL_SEGMENTS = 6
        const TOWER_BRICKS = 0.25 * TOWER_HEIGHT
        
        // posicionamento das torres
        const towerY = TOWER_HEIGHT/2 

        // posicionadas conforme as paredes
        const towerX = wallX
        const towerZ = wallZ
        
        // torres intermediárias
        const MID_TOWER_HEIGHT = TOWER_HEIGHT * 0.9
        const MID_TOWER_BRICKS = 0.15 * TOWER_HEIGHT

        // posicionamento das torres intermediárias
        const midTowerX = wallX
        const midTowerZ = wallZ
        const midTowerY = MID_TOWER_HEIGHT/2

        // elementos
        const floorY = FLOOR_HEIGHT/2
        const floor = new Floor(0, floorY, 0, materials.grass, FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_DEPTH);
        
        this.add(floor)

        // paredes posicionadas no Z, paralelas ao X (vermelho)
        // largura delas é a mesma largura do terreno 
        const wall1 = new CastleWall(0, wallY, -wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS)
        const wall2 = new CastleWall(0, wallY, wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS)

        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS)
        const wall4 = new CastleWall(-wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS)

        wall3.object.rotateY(THREE.MathUtils.degToRad(90))
        wall4.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(wall1)
        this.add(wall2)
        this.add(wall3)
        this.add(wall4)
        
        // posicionadas nas extremidades das paredes
        const tower1 = new Tower(towerX, towerY, towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        const tower2 = new Tower(-towerX, towerY, towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        const tower3 = new Tower(towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        const tower4 = new Tower(-towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        
        this.add(tower1)
        this.add(tower2)
        this.add(tower3)
        this.add(tower4)
        
        //const midTower1 = new Tower(0, midTowerY, midTowerZ, this.material, towerConfig);
        const midTower2 = new Tower(0, midTowerY, -midTowerZ, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);
        const midTower3 = new Tower(midTowerX, midTowerY, 0, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);
        const midTower4 = new Tower(-midTowerX, midTowerY, 0, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);

        //this.add(midTower1)
        this.add(midTower2)
        this.add(midTower3)
        this.add(midTower4)

    }
}