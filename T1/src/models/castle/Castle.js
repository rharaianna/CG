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
import { makeCastleConfig } from "./castle.config.js";

export class Castle extends Model {
    constructor(x, y, z, material, WIDTH, DEPTH, SCALE) {
        super(x, y, z, materials.bricks);
        this.doors = [];
        this.stairs = []

        // Obtém todos os parâmetros de tamanho e escala do arquivo de configuração
        const cfg = makeCastleConfig(WIDTH, DEPTH, SCALE);

        const {
            WIDTH: scaledWidth, 
            DEPTH: scaledDepth, 
            SCALE: cfgScale,
            floor: fCfg, 
            wall: wCfg, 
            tower: tCfg, 
            midTower: mtCfg, 
            frontTower: ftCfg,
            door: dCfg, 
            stair: sCfg, 
            ceil: cCfg
        } = cfg;

        ///////////////////////////////////////////////////////////////////////
        ///////////////////////////// POSICIONAMENTO //////////////////////////

        // paredes
        const wallY = wCfg.height / 2;
        const wallX = scaledWidth / 2 + wCfg.depth / 2;
        const wallZ = scaledDepth / 2 + wCfg.depth / 2;

        // torres
        const towerY = tCfg.height / 2;
        const towerX = wallX + tCfg.offset;
        const towerZ = wallZ + tCfg.offset;

        // torres intermediárias
        const midTowerX = wallX;
        const midTowerZ = wallZ;
        const midTowerY = mtCfg.height / 2;

        ///////////////////////////////////////////////////////////////////////
        ///////////////////////// CRIAÇÃO DOS OBJETOS /////////////////////////
        
        // Chão
        const floorY = fCfg.height / 2;
        const floor = new Floor(0, floorY, 0, materials.grass, fCfg.width, fCfg.height, fCfg.depth);
        this.add(floor);

        // Escadas
        const STAIR_X = wallX - cCfg.distance - sCfg.totalDepth - wCfg.depth / 2 + sCfg.stepDepth / 2;
        const STAIR_Y = floorY + sCfg.stepHeight;
        const STAIR_Z = -wallZ + sCfg.stepWidth / 2 + wCfg.depth / 2;

        // escada direita (rotação +90° em Y)
        this.addStair({
            x: STAIR_X, y: STAIR_Y, z: STAIR_Z,
            stepWidth: sCfg.stepWidth,
            stepHeight: sCfg.stepHeight,
            stepDepth: sCfg.stepDepth,
            stepNumber: sCfg.stepNumber,
            rotationY: THREE.MathUtils.degToRad(90),
        });

        // escada esquerda (rotação -90° em Y, espelhada no eixo X)
        this.addStair({
            x: -STAIR_X, y: STAIR_Y, z: STAIR_Z,
            stepWidth: sCfg.stepWidth,
            stepHeight: sCfg.stepHeight,
            stepDepth: sCfg.stepDepth,
            stepNumber: sCfg.stepNumber,
            rotationY: THREE.MathUtils.degToRad(-90),
        });

        // Mid walls
        const MID_WALL_DEPTH = wCfg.depth / 2;
        let MID_WALL_WIDTH = sCfg.totalDepth;
        let MID_WALL_HEIGHT = sCfg.stepNumber * sCfg.stepHeight + (1 * cfgScale);
        let MID_WALL_Y = MID_WALL_HEIGHT / 2;
        
        let MID_WALL_Z = -wallZ + cCfg.distance + wCfg.depth / 2 + MID_WALL_DEPTH / 2;
        let MID_WALL_X = wallX - MID_WALL_WIDTH / 2 - wCfg.depth / 2 - cCfg.distance;

        // mid wall paralela ao eixo X
        const midWallRight = new Wall(MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH);
        const midWallLeft = new Wall(-MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH);
        
        // atualizações no posicionamento da outra parede
        MID_WALL_WIDTH = scaledDepth - cCfg.distance;
        MID_WALL_X = wallX - cCfg.distance - wCfg.depth / 2 - MID_WALL_DEPTH / 2;
        MID_WALL_Z = -wallZ + cCfg.distance + wCfg.depth / 2 + MID_WALL_WIDTH / 2;
        
        // portas das paredes intermediarias com deslocamentos
        let lateralDoors = {
            portao: true,
            alturaPortao: dCfg.height,
            larguraPortao: dCfg.width,
            offsetX: cCfg.distance / 2,
        };

        // mid wall paralela ao eixo Z
        const midWallCeilRight = new Wall(MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH, lateralDoors);
        const midWallCeilLeft = new Wall(-MID_WALL_X, MID_WALL_Y, MID_WALL_Z, this.material, MID_WALL_WIDTH, MID_WALL_HEIGHT, MID_WALL_DEPTH, lateralDoors);
        
        midWallCeilRight.object.rotateY(THREE.MathUtils.degToRad(90));
        midWallCeilLeft.object.rotateY(THREE.MathUtils.degToRad(90));

        this.add(midWallRight);
        this.add(midWallLeft);
        this.add(midWallCeilRight);
        this.add(midWallCeilLeft);

        // Tetos
        const CEIL_HEIGHT = sCfg.stepHeight * 2;
        const CEIL_X = wallX - cCfg.distance / 2 - wCfg.depth / 2;

        const ceilRight = new Ceil(CEIL_X, cCfg.y, 0, materials.rotten_wood, cCfg.distance, CEIL_HEIGHT, scaledDepth);
        this.add(ceilRight);

        const ceilLeft = new Ceil(-CEIL_X, cCfg.y, 0, materials.rotten_wood, cCfg.distance, CEIL_HEIGHT, scaledDepth);
        this.add(ceilLeft);

        let doorWallConfig = {
            portao: true,
            alturaPortao: dCfg.height,
            larguraPortao: dCfg.width,
            linhas: 1,
            colunas: 6,
            altura: 2,
            largura: 2,
            material: materials.bricks
        };
        
        // Paredes principais
        const wall1 = new CastleWall(0, wallY, wallZ, this.material, scaledWidth, wCfg.height, wCfg.depth, tCfg.radius, doorWallConfig);
        const wall2 = new CastleWall(0, wallY, -wallZ, this.material, scaledWidth, wCfg.height, wCfg.depth, tCfg.radius, doorWallConfig);
    
        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, scaledDepth, wCfg.height, wCfg.depth, tCfg.radius, doorWallConfig);
        
        // lado da parede com detalhes
        const wall4 = new CastleWall(-wallX, wallY, -scaledDepth / 4, this.material, scaledDepth / 2 - mtCfg.width / 2, wCfg.height, wCfg.depth, tCfg.radius / 2, null);
        // empurro ela pro local correto 
        wall4.object.translateZ(-mtCfg.width / 4);
        
        const wall44 = new DetailedWall(-wallX, wallY, scaledDepth / 4, this.material, scaledDepth / 2, wCfg.height, wCfg.depth, mtCfg.width, mtCfg.depth, null);
        
        wall3.object.rotateY(THREE.MathUtils.degToRad(90));
        wall4.object.rotateY(THREE.MathUtils.degToRad(90));
        wall44.object.rotateY(THREE.MathUtils.degToRad(90));

        this.add(wall1);
        this.add(wall2);
        this.add(wall3);
        this.add(wall4);
        this.add(wall44);

        let windowsTowerConfig = {
            linhas: 0,          // n fileiras de janelas na altura
            colunas: 0,        // m colunas distribuídas em 360° ao redor da torre
            raio: 0.5,
            material: materials.bricks
        };
    
        // posicionadas nas extremidades das paredes
        const tower1 = new Tower(towerX, towerY, towerZ, this.material, tCfg.height, tCfg.radius, tCfg.innerRadius, tCfg.radialSegments, tCfg.bricks, windowsTowerConfig);
        const tower2 = new Tower(-towerX, towerY, towerZ, this.material, tCfg.height, tCfg.radius, tCfg.innerRadius, tCfg.radialSegments, tCfg.bricks, windowsTowerConfig);
        const tower3 = new Tower(towerX, towerY, -towerZ, this.material, tCfg.height, tCfg.radius, tCfg.innerRadius, tCfg.radialSegments, tCfg.bricks, windowsTowerConfig);
        const tower4 = new Tower(-towerX, towerY, -towerZ, this.material, tCfg.height, tCfg.radius, tCfg.innerRadius, tCfg.radialSegments, tCfg.bricks, windowsTowerConfig);
        
        this.add(tower1)
        this.add(tower2)
        this.add(tower3)
        this.add(tower4)
        
        // Torres intermediárias
        const midTower2 = new MidTower(0, midTowerY, -midTowerZ, this.material, mtCfg.width, mtCfg.height, mtCfg.depth, mtCfg.bricks);
        const midTower3 = new MidTower(midTowerX, midTowerY, 0, this.material, mtCfg.width, mtCfg.height, mtCfg.depth, mtCfg.bricks, doorWallConfig);
        const midTower4 = new MidTower(-midTowerX, midTowerY, 0, this.material, mtCfg.width, mtCfg.height, mtCfg.depth, mtCfg.bricks, doorWallConfig);
        
        //correções
        const desvio = mtCfg.depth / 2 - wCfg.depth / 2;
        midTower2.object.translateZ(-desvio);
        midTower3.object.translateX(desvio);
        midTower4.object.translateX(-desvio);
        midTower3.object.rotateY(THREE.MathUtils.degToRad(90));
        midTower4.object.rotateY(THREE.MathUtils.degToRad(90));

        this.add(midTower2)
        this.add(midTower3)
        this.add(midTower4)

        // Torre frontal
        const FRONTTOWER_Y = ftCfg.height / 2;
        const FRONTTOWER_Z = wallZ;

        const frontTower = new FrontTower(0, FRONTTOWER_Y, FRONTTOWER_Z, this.material, ftCfg.width, ftCfg.height, ftCfg.depth, ftCfg.bricks, doorWallConfig);
        this.add(frontTower);

        // Portões
        this.addDoor({
            x: midTowerX,
            y: dCfg.height / 2,
            z: 0,
            width: dCfg.width,
            height: dCfg.height,
            depth: dCfg.depth,
            interactionDistance: 4 * cfgScale,
            rotationY: THREE.MathUtils.degToRad(90)
        });

        this.addDoor({
            x: -midTowerX,
            y: dCfg.height / 2,
            z: 0,
            width: dCfg.width,
            height: dCfg.height,
            depth: dCfg.depth,
            interactionDistance: 4 * cfgScale,
            rotationY: THREE.MathUtils.degToRad(-90)
        });

        this.addDoor({
            x: 0,
            y: dCfg.height / 2,
            z: FRONTTOWER_Z,
            width: dCfg.width,
            height: dCfg.height,
            depth: dCfg.depth,
            interactionDistance: 4 * cfgScale,
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

    
    // Cria uma escada visual (Stair) e sua rampa de colisão invisível (Ramp)
    // com os mesmos parâmetros e posição, armazenando o par em this.stairs.
    // Retorna { stair, ramp } para uso externo se necessário.
    
    addStair(config) {
        const {
            x, y, z,
            stepWidth, stepHeight, stepDepth, stepNumber,
            rotationY = 0,
            stairMaterial = materials.rotten_wood,
            rampMaterial  = materials.grass,
        } = config;

        //  Escada visual 
        const stair = new Stair(x, y, z, stairMaterial, stepWidth, stepHeight, stepDepth, stepNumber);
        stair.object.rotation.y = rotationY;
        this.add(stair);

        // Rampa de colisão invisível 
        const ramp = new Ramp(x, y, z, rampMaterial, stepWidth, stepHeight, stepDepth, stepNumber);
        ramp.object.rotation.y = rotationY;
        this.add(ramp);

        // Armazena o par para o main.js iterar (igual ao padrão das doors) 
        const pair = { stair, ramp };
        this.stairs.push(pair);

        return pair;
    }
}
