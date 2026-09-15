import * as THREE from "three";
import { Model } from "../Model.js";
import { Tower } from "../structures/Tower.js";
import { Floor } from "../structures/Floor.js";
import { Door } from "../structures/Door.js";

import { materials } from "../material.configs.js"
import { Wall } from "../structures/Wall.js";
import { CastleWall } from "../structures/CastleWall.js";

import { MidTower } from "../structures/MidTower.js";
import { FrontTower } from "../structures/FrontTower.js";
import { Stair } from "../structures/Stair.js";

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
        const WALL_HEIGHT = 14 * SCALE
        const WALL_DEPTH = 4 * SCALE
        
        // posicionamento das paredes
        const wallY = WALL_HEIGHT/2 
        
        // as posicionadas no X, paralelas ao Z (azul), usam a largura do castelo 
        const wallX = WIDTH/2 + WALL_DEPTH/2
        
        // as posicionadas no Z usam a profundidade do castelo
        const wallZ = DEPTH/2 + WALL_DEPTH/2

        // torres
        const TOWER_HEIGHT = 21 * SCALE
        const TOWER_RADIUS = 5 * SCALE
        const TOWER_INNER_RADIUS = 2.7 * SCALE
        const TOWER_RADIAL_SEGMENTS = 32
        const TOWER_BRICKS = 2 * SCALE
        
        // posicionamento das torres
        const towerY = TOWER_HEIGHT/2 

        // deslocamento das torres do castelo
        const OFFSET = 1 * SCALE

        // posicionadas conforme as paredes
        const towerX = wallX + OFFSET
        const towerZ = wallZ + OFFSET
        
        // torres intermediárias
        const MIDTOWER_HEIGHT = TOWER_HEIGHT
        const MIDTOWER_WIDTH = 12 * SCALE
        const MIDTOWER_DEPTH = 9 * SCALE
        const MIDTOWER_BRICKS = 0.15 * TOWER_HEIGHT

        // torres intermediárias
        const FRONTTOWER_HEIGHT = TOWER_HEIGHT *1.05 
        const FRONTTOWER_WIDTH = 21  * SCALE
        const FRONTTOWER_DEPTH = 9 * SCALE
        const FRONTTOWER_BRICKS = 0.15 * TOWER_HEIGHT


        // posicionamento das torres intermediárias
        const midTowerX = wallX
        const midTowerZ = wallZ
        const midTowerY = MIDTOWER_HEIGHT/2

        // elementos
        const floorY = FLOOR_HEIGHT/2
        const floor = new Floor(0, floorY, 0, materials.grass, FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_DEPTH);
        
        this.add(floor)
        this.timer = 0;

        let windowsWallConfig = {
            portao: true,
            alturaPortao: (WALL_HEIGHT/2),
            larguraPortao: (1 * TOWER_RADIUS),
        };
        

        
        const wall1 = new CastleWall(0, wallY, wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsWallConfig)
        const wall2 = new CastleWall(0, wallY, -wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsWallConfig)
        
        //const wall1 = new CastleWall(0, wallY, -wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS)
        const wall11 = new Wall(0, wallY, -wallZ + 11.5, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsWallConfig)
        //const wall2 = new CastleWall(0, wallY, wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsConfig)


        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsWallConfig)
        const wall4 = new CastleWall(-wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsWallConfig)

        wall3.object.rotateY(THREE.MathUtils.degToRad(90))
        wall4.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(wall1)
        this.add(wall11)
        this.add(wall2)
        this.add(wall3)
        this.add(wall4)

        let windowsTowerConfig = {
            linhas: 2,          // n fileiras de janelas na altura
            colunas: 4,        // m colunas distribuídas em 360° ao redor da torre
            raio: 1,
        }
    
        // posicionadas nas extremidades das paredes
        const tower1 = new Tower(towerX, towerY, towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower2 = new Tower(-towerX, towerY, towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower3 = new Tower(towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower4 = new Tower(-towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        
        this.add(tower1)
        this.add(tower2)
        this.add(tower3)
        this.add(tower4)
        
        
        const midTower2 = new MidTower(0, midTowerY, -midTowerZ, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS,windowsWallConfig);
        const midTower3 = new MidTower(midTowerX, midTowerY, 0, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS,windowsWallConfig);
        const midTower4 = new MidTower(-midTowerX, midTowerY, 0, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS,windowsWallConfig);

        //const midTower1 = new Tower(0, midTowerY, midTowerZ, this.material, towerConfig);
        //const midTower2 = new Tower(0, midTowerY, -midTowerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        //const midTower3 = new Tower(midTowerX, midTowerY, 0, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);
        //const midTower4 = new Tower(-midTowerX, midTowerY, 0, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS);

        midTower3.object.rotateY(THREE.MathUtils.degToRad(90))
        midTower4.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(midTower2)
        this.add(midTower3)
        this.add(midTower4)

        const STAIR_STEP_WITDH = 10
        const STAIR_STEP_HEIGHT = 0.18
        const STAIR_STEP_DEPTH = 0.5
        const STEPS_NUMBER = 30
        const STAIR_Y = floorY + STAIR_STEP_HEIGHT/2
        const STAIR_TOTAL_DEPTH = STEPS_NUMBER * STAIR_STEP_DEPTH

        // posicionadas na parede do fundo, ou seja, paralelas ao X
        
        //const STAIR_Z = -(wallZ - STAIR_TOTAL_DEPTH - WALL_DEPTH/2)
        const STAIR_Z = -wallZ +STAIR_STEP_WITDH/2 +WALL_DEPTH/2
        const stair = new Stair(20, STAIR_Y, STAIR_Z, materials.red, STAIR_STEP_WITDH, STAIR_STEP_HEIGHT, STAIR_STEP_DEPTH, STEPS_NUMBER)
        stair.object.rotateY(THREE.MathUtils.degToRad(90))
        this.add(stair)

        const FRONTTOWER_Y = FRONTTOWER_HEIGHT/2
        const FRONTTOWER_Z = wallZ

        const frontTower = new FrontTower(0, FRONTTOWER_Y, FRONTTOWER_Z, this.material, FRONTTOWER_WIDTH, FRONTTOWER_HEIGHT, FRONTTOWER_DEPTH, FRONTTOWER_BRICKS, windowsWallConfig);
        this.add(frontTower)
        
        
        const doorConfig = {
            width: FRONTTOWER_WIDTH/2,       // Mesma largura do portão cavado na parede
            height: FRONTTOWER_HEIGHT/3,      // Mesma altura
            depth: 1     // Espessura das tábuas da porta
        };

        // Posiciona o portão na mesma coordenada da parede 1
        const doorY = doorConfig.height / 2;
        const doorZ = 0//-wallZ + WALL_DEPTH / 2; // Levemente ajustado para o vão

        this.castleDoor = new Door(0, doorY, doorZ, materials.wood || this.material, doorConfig);
        
        // Se quiser testar o portão aberto logo na criação:
        // this.castleDoor.toggleDoor(true);

        this.add(this.castleDoor);

    } 
 
}
