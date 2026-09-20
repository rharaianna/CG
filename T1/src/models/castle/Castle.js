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
import { Ceil } from "../structures/Ceil.js";
import { DetailedWall } from "../structures/DetailedWall.js";
import { Ramp } from "../structures/Ramp.js";

export class Castle extends Model {
    constructor(x, y, z, material, WIDTH, DEPTH, SCALE) {
        super(x, y, z, materials.bricks);
        this.doors = [];
        this.stairs = []
        this.timer = 0;

        // parâmetros ajustáveis do castelo
        // são atualizados conforme a escala e alteraram todas as paredes e torres
        
        // largura -> eixo X (vermelho)
        WIDTH *= SCALE

        // profundidade -> eixo Z (azul)
        DEPTH *= SCALE
         
        // chão tem as mesmas dimensões do castelo
        const FLOOR_WIDTH = WIDTH * 1.5
        const FLOOR_DEPTH = DEPTH * 1.5
        const FLOOR_HEIGHT = 0.1 * SCALE
        
        // paredes
        const WALL_HEIGHT = 13 * SCALE
        const WALL_DEPTH = 2 * SCALE
        
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

        // portão
        const DOOR_HEIGHT = (WALL_HEIGHT/2) 
        const DOOR_WIDTH = (1 * TOWER_RADIUS)
        const DOOR_DEPTH = DOOR_WIDTH * 0.1

        // escadas e teto vão ser parametrizados com esses:
        // distancia da midwall das paredes
        //const DISTANCE = WIDTH/2 -(3/2)*FRONTTOWER_WIDTH/3 - (SCALE * 5)
        const DISTANCE = (3 * SCALE )

        // distancia para escadas
        const CEIL_Y = 8

        // escada: tamanhos reais
        const STAIR_STEP_WITDH = DISTANCE
        const STAIR_STEP_HEIGHT = 0.18
        const STAIR_STEP_DEPTH = 0.32

        const STEPS_NUMBER = Math.floor(CEIL_Y / STAIR_STEP_HEIGHT)
        const STAIR_TOTAL_DEPTH = (STEPS_NUMBER) * STAIR_STEP_DEPTH
        
        // escadas 

        // posicionadas na parede do fundo, ou seja, paralelas ao X
        let STAIR_X = wallX -DISTANCE -STAIR_TOTAL_DEPTH -WALL_DEPTH/2 +STAIR_STEP_DEPTH/2
        const STAIR_Y = floorY + STAIR_STEP_HEIGHT
        const STAIR_Z = -wallZ +STAIR_STEP_WITDH/2 +WALL_DEPTH/2
        

        STAIR_X = wallX -DISTANCE -STAIR_TOTAL_DEPTH -WALL_DEPTH/2 +STAIR_STEP_DEPTH/2
  
        const ramp = new Ramp(
            STAIR_X, STAIR_Y, STAIR_Z,
            materials.grass,
            STAIR_STEP_WITDH,
            STAIR_STEP_HEIGHT,
            STAIR_STEP_DEPTH,
            STEPS_NUMBER
        )
        // Mesma rotação que a escada visual (90° em Y)
        ramp.object.rotateY(THREE.MathUtils.degToRad(90))
        this.add(ramp)
        // Expõe a referência para o main.js
        this.collisionRamp = ramp;

        const stair = new Stair(STAIR_X, STAIR_Y, STAIR_Z, materials.rotten_wood, STAIR_STEP_WITDH, STAIR_STEP_HEIGHT, STAIR_STEP_DEPTH, STEPS_NUMBER)
        stair.object.rotateY(THREE.MathUtils.degToRad(90))
        this.add(stair)
        // Expõe a referência para o main.js
        this.stair = stair;



        const rampleft = new Ramp(
            -STAIR_X, STAIR_Y, STAIR_Z,
            materials.grass,
            STAIR_STEP_WITDH,
            STAIR_STEP_HEIGHT,
            STAIR_STEP_DEPTH,
            STEPS_NUMBER
        )
        // Mesma rotação que a escada visual (90° em Y)
        rampleft.object.rotateY(THREE.MathUtils.degToRad(-90))
        this.add(rampleft)
        // Expõe a referência para o main.js
        this.collisionRamp2 = rampleft;

        const stairleft = new Stair(-STAIR_X, STAIR_Y, STAIR_Z, materials.rotten_wood, STAIR_STEP_WITDH, STAIR_STEP_HEIGHT, STAIR_STEP_DEPTH, STEPS_NUMBER)
        stairleft.object.rotateY(THREE.MathUtils.degToRad(-90))
        this.add(stairleft)
        this.stairleft = stairleft;

        // mid wall
        const MID_WALL_DEPTH = WALL_DEPTH/2
        let MID_WALL_WIDTH = STAIR_TOTAL_DEPTH 
        let MID_WALL_HEIGHT = STEPS_NUMBER * STAIR_STEP_HEIGHT + (1 * SCALE)
        let MID_WALL_Y = MID_WALL_HEIGHT/2
        
        let MID_WALL_Z = -wallZ + DISTANCE + WALL_DEPTH/2 + MID_WALL_DEPTH/2
        let MID_WALL_X = wallX - MID_WALL_WIDTH/2 - WALL_DEPTH/2 - DISTANCE

        // mid wall paralela ao eixo X
        const midWall1 = new Wall(MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH)
        const midWall1left = new Wall(-MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH)
        
        // atualizações no posicionamento da outra parede
        MID_WALL_WIDTH = DEPTH - DISTANCE
        MID_WALL_X = wallX -DISTANCE - WALL_DEPTH/2 - MID_WALL_DEPTH/2
        MID_WALL_Z = -wallZ + DISTANCE + WALL_DEPTH/2 + MID_WALL_WIDTH/2
        
        // funciona, ta bonito mas nao sei pq ta assim e nao era pra ser assim tbm....

        let lateralDoors = {
            portao: true,
            alturaPortao: DOOR_HEIGHT,
            larguraPortao: DOOR_WIDTH,
            offsetX : DISTANCE/2,
        }

        // mid wall paralela ao eixo Z
        const midWall2 = new Wall(MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH, lateralDoors)
        const midWall2left = new Wall(-MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH, lateralDoors)
        
        midWall2.object.rotateY(THREE.MathUtils.degToRad(90))
        midWall2left.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(midWall1)
        this.add(midWall1left)
        this.add(midWall2)
        this.add(midWall2left)

        // teto 
        const CEIL_HEIGHT = STAIR_STEP_HEIGHT*2
        const CEIL_X = wallX - DISTANCE/2 - WALL_DEPTH/2

        const ceil1 = new Ceil(CEIL_X, CEIL_Y, 0, materials.rotten_wood, DISTANCE, CEIL_HEIGHT, DEPTH)
        this.add(ceil1)

        const ceilleft = new Ceil(-CEIL_X, CEIL_Y, 0, materials.rotten_wood, DISTANCE, CEIL_HEIGHT, DEPTH)
        this.add(ceilleft)

        let doorWallConfig = { // passa pra wall
            portao: true,
            alturaPortao: DOOR_HEIGHT,
            larguraPortao: DOOR_WIDTH,
            linhas: 1,
            colunas: 6,
            altura:2,
            largura:2,
            material: materials.bricks
        };
        
        const doorConfig = {   //Passa pra door
            width: DOOR_WIDTH,       
            height: DOOR_HEIGHT,      
            depth: DOOR_DEPTH     
        };

        // paredes posicionadas no Z, paralelas ao X (verdelho)
        // largura delas é a mesma largura do terreno 
        const wall1 = new CastleWall(0, wallY, wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, doorWallConfig)
        const wall2 = new CastleWall(0, wallY, -wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, doorWallConfig)
    
        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, doorWallConfig)
        
        // lado da parede com detalhes
        const wall4 = new CastleWall(-wallX, wallY, -DEPTH/4, this.material, DEPTH/2 - MIDTOWER_WIDTH/2, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS/2, null)
        const wall44 = new DetailedWall(-wallX, wallY, DEPTH/4, this.material, DEPTH/2, WALL_HEIGHT, WALL_DEPTH, MIDTOWER_WIDTH, MIDTOWER_DEPTH, null)
        
        
        wall3.object.rotateY(THREE.MathUtils.degToRad(90))
        wall4.object.rotateY(THREE.MathUtils.degToRad(90))
        wall44.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(wall1)
        this.add(wall2)
        this.add(wall3)
        this.add(wall4)
        this.add(wall44)

        let windowsTowerConfig = {
            linhas: 0,          // n fileiras de janelas na altura
            colunas: 0,        // m colunas distribuídas em 360° ao redor da torre
            raio: 0.5,
            material: materials.bricks
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
        
        const midTower2 = new MidTower(0, midTowerY, -midTowerZ, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS);
        const midTower3 = new MidTower(midTowerX, midTowerY, 0, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS,doorWallConfig);
        const midTower4 = new MidTower(-midTowerX, midTowerY, 0, this.material, MIDTOWER_WIDTH, MIDTOWER_HEIGHT, MIDTOWER_DEPTH, MIDTOWER_BRICKS,doorWallConfig);

        // correções
        const desvio = MIDTOWER_DEPTH/2 - WALL_DEPTH/2
        midTower2.object.translateZ(-desvio)
        midTower3.object.translateX(desvio)
        midTower4.object.translateX(-desvio)
        midTower3.object.rotateY(THREE.MathUtils.degToRad(90))
        midTower4.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(midTower2)
        this.add(midTower3)
        this.add(midTower4)

        // torre frontal
        const FRONTTOWER_Y = FRONTTOWER_HEIGHT/2
        const FRONTTOWER_Z = wallZ

        const frontTower = new FrontTower(0, FRONTTOWER_Y, FRONTTOWER_Z, this.material, FRONTTOWER_WIDTH, FRONTTOWER_HEIGHT, FRONTTOWER_DEPTH, FRONTTOWER_BRICKS, doorWallConfig);
        this.add(frontTower)

    
        //==== Portoes==========
        const doorFX = 0;
        const doorFY = doorConfig.height / 2;
        const doorFZ = FRONTTOWER_Z;
        // Posiciona o portão na mesma coordenada da parede 1
        const door3X = midTowerX
        const door3Y = doorConfig.height / 2;
        const door3Z = 0

        const door4X = -midTowerX
        const door4Y = doorConfig.height / 2;
        const door4Z = 0

        this.addDoor({
            x: door3X,
            y: door3Y,
            z: door3Z,
            width: doorConfig.width,
            height: doorConfig.height,
            depth: doorConfig.depth,
            interactionDistance: 4 * SCALE,
            rotationY: THREE.MathUtils.degToRad(90)
        });

        this.addDoor({
            x: door4X,
            y: door4Y,
            z: door4Z,
            width: doorConfig.width,
            height: doorConfig.height,
            depth: doorConfig.depth,
            interactionDistance: 4 * SCALE,
            rotationY: THREE.MathUtils.degToRad(-90)
        });

        this.addDoor({
            x: doorFX,
            y: doorFY,
            z: doorFZ,
            width: doorConfig.width,
            height: doorConfig.height,
            depth: doorConfig.depth,
            interactionDistance: 4 * SCALE,
            rotationY: THREE.MathUtils.degToRad(0)
        });
    } 

    addDoor(config) {
        const door = new Door(
            config.x,
            config.y,
            config.z,
            materials.rotten_wood,
            config
        );

        door.interactionDistance = config.interactionDistance ?? 4;
        door.object.rotation.y = config.rotationY ?? 0;

        this.doors.push(door);
        this.add(door);

        return door;
    }

    addStair(config) {
        const stair = new Stair(
            config.x,
            config.y,
            config.z,
            materials.rotten_wood,
            config
        );

        this.stairs.push(stair);
        this.add(stair);

        return stair;
    }

 
}
