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

import { MovementArea } from "../MovementArea.js";
import { Vector3 } from "../../../../build/three.core.js";
import { Bridge } from "../Bridge.js";
import { Pedestal } from "../structures/Pedestal.js";


export class Castle extends Model {
    constructor(scene, x, y, z, material, WIDTH, DEPTH, SCALE) {
        super(x, y, z, materials.bricks);
        this.doors = [];
        this.stairs = [];
        this.towers = [];
        this.portals = [];

        //this.collisionEnabledGroup = new THREE.Group();

        // corrijo para posicionar relativo a altura do castelo
        this.collisionDisabledGroup = new THREE.Group();
    
        // Obtém todos os parâmetros de tamanho e escala do arquivo de configuração
        const cfg = makeCastleConfig(WIDTH, DEPTH, SCALE);

        const {
            WIDTH: scaledWidth, 
            DEPTH: scaledDepth, 
            SCALE: cfgScale,
            wall: wCfg,
            window: wdCfg, 
            tower: tCfg, 
            midTower: mtCfg, 
            frontTower: ftCfg,
            door: dCfg, 
            stair: sCfg, 
            ceil: cCfg,
            bridge: bCfg,
            pedestal:pCfg,
            receptacle:rCfg
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
        
        // Escadas
        const STAIR_X = wallX - cCfg.distance - sCfg.totalDepth - wCfg.depth / 2 + sCfg.stepDepth / 2;
        const STAIR_Y = sCfg.stepHeight/2;
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
        const CEIL_HEIGHT = sCfg.stepHeight;
        const CEIL_X = wallX - cCfg.distance / 2 - wCfg.depth / 2;
        const CEIL_Y = cCfg.y - CEIL_HEIGHT/2

        const ceilRight = new Ceil(CEIL_X, CEIL_Y, 0, materials.rotten_wood, cCfg.distance, CEIL_HEIGHT, scaledDepth);
        this.add(ceilRight);

        const ceilLeft = new Ceil(-CEIL_X, CEIL_Y, 0, materials.rotten_wood, cCfg.distance, CEIL_HEIGHT, scaledDepth);
        this.add(ceilLeft);

        let doorWallConfig = {
            portao: true,
            alturaPortao: dCfg.height,
            larguraPortao: dCfg.width,
            linhas: 1,
            colunas: 8,
            altura: wdCfg.height,
            largura: wdCfg.width,
            material: materials.bricks
        };
        
        // Paredes principais
        const wall1 = new CastleWall(0, wallY, wallZ, this.material, scaledWidth -tCfg.radius, wCfg.height, wCfg.depth, tCfg.radius, doorWallConfig);
        const wall2 = new CastleWall(0, wallY, -wallZ, this.material, scaledWidth -tCfg.radius, wCfg.height, wCfg.depth, tCfg.radius, null);
    
        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, scaledDepth -tCfg.radius , wCfg.height, wCfg.depth, tCfg.radius, doorWallConfig);
        
        // lado da parede com detalhes
        const wall4 = new CastleWall(-wallX, wallY, -scaledDepth / 4 + tCfg.radius/2 , this.material, scaledDepth / 2 - mtCfg.width / 2, wCfg.height, wCfg.depth, tCfg.innerRadius, null);
        // empurro ela pro local correto 
        wall4.object.translateZ(-mtCfg.width / 4);
        
        const wall44 = new DetailedWall(-wallX, wallY, scaledDepth / 4, this.material, scaledDepth / 2, wCfg.height, wCfg.depth, mtCfg.width, mtCfg.depth, tCfg.radius, null);
        
        wall3.object.rotateY(THREE.MathUtils.degToRad(90));
        wall4.object.rotateY(THREE.MathUtils.degToRad(90));
        wall44.object.rotateY(THREE.MathUtils.degToRad(90));

        this.add(wall1);
        this.add(wall2);
        this.add(wall3);
        this.add(wall4);
        this.add(wall44);

        let windowsTowerConfig = {
            janelas: [
                { angulo: 0, y: 0 },
                { angulo: Math.PI / 4, y: 3.5 },
                { angulo: -Math.PI / 4, y: 3.5 },
                { angulo: -Math.PI / 2, y: 0 },
                { angulo: -3 * Math.PI / 4, y: 3.5 },
            ],
            portao: {
                angulo: 3 * Math.PI / 4,
                y: CEIL_HEIGHT+ (dCfg.height/2),
                largura: dCfg.width / 2,
                altura: dCfg.height / 1.5,
            },
            larguraJanela: wdCfg.width,
            alturaJanela: wdCfg.height,
            material: materials.bricks
        };

        const portaoBaseY = windowsTowerConfig.portao.y - windowsTowerConfig.portao.altura / 2;
        const pocketDepth = tCfg.height / 2 - portaoBaseY;
    
        // posicionadas nas extremidades das paredes
        this.addTowers({
            x: towerX,
            y: towerY,
            z: towerZ,
            height: tCfg.height,
            radius: tCfg.radius,
            innerRadius: tCfg.innerRadius,
            radialSegments: tCfg.radialSegments,
            bricks: tCfg.bricks,
            windowsConfig: windowsTowerConfig,
            pocketDepth,
            ceilY: CEIL_Y,
            ceilHeight: CEIL_HEIGHT
        });
        
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

        // Portal
        this.pedestal = new Pedestal(
            scene, 
            5,
            pCfg.base_height*2,
            9,
            materials.rotten_wood,
            {
                radius: pCfg.base_radius,
                height: pCfg.base_height,
                baseThickness: pCfg.base_height,
                receptacle: {
                    width: rCfg.receptacle_width,
                    height: rCfg.receptacle_height,
                    depth: rCfg.receptacle_width,
                },
                portal: {
                    radius: pCfg.base_radius/5,
                    height: 0.5 * cfgScale,
                    interactionDistance: 5 * cfgScale,
                    animationSpeed: 5,
                },
            }
        );
        this.add(this.pedestal);
        this.portals.push(this.pedestal.portal)

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


        /////////////////////////////////////
        // sao criados aqui pela praticidade de posicionar
        // preciso passar o y pq são posicionados na cena
        // e não no castelo em si e preciso das posições relativas ao mundo

        // inimigo do segundo andar
        const movementArea1Dimensions = {
            width: cCfg.distance,
            height: CEIL_HEIGHT,
            depth: DEPTH/3,
        }
        const movementArea1Position = new Vector3(CEIL_X, y + cCfg.y + movementArea1Dimensions.height/2, 0)
        this.secondFloorMovementArea = new MovementArea(scene, movementArea1Position, movementArea1Dimensions, 15, 60)
        

        // inimigo da torre frontal 
        const movementArea2Dimensions = {
            width: 10,
            depth: 10,
            height: ftCfg.height,
        }
        const movementArea2Position = new Vector3(20, y + movementArea2Dimensions.height/2, 20)
        this.frontalTowerMovementArea = new MovementArea(scene, movementArea2Position, movementArea2Dimensions, 15, 30)
        
        
        // inimigo que vai ficar na casa 
        const movementArea3Dimensions = {
            width: 8,
            depth: 8,
            height: 0,
        }
        const movementArea3Position = new Vector3(-20, y + movementArea3Dimensions.height/2, -20)
        this.internalBuildingMovementArea = new MovementArea(scene, movementArea3Position, movementArea3Dimensions, 15, 30)


        // inimigo na torre redonda
        const movementArea4Dimensions = {
            width: tCfg.radius * 2,
            depth: tCfg.radius * 2,
            height: tCfg.height,
        }

        const movementArea4Position = new Vector3(-towerX, y + movementArea4Dimensions.height, -towerZ)
        this.towerMovementArea = new MovementArea(scene, movementArea4Position, movementArea4Dimensions, 15, 15)
    
        this.collisionDisabledGroup.add(this.secondFloorMovementArea.object)
        this.collisionDisabledGroup.add(this.frontalTowerMovementArea.object)
        this.collisionDisabledGroup.add(this.internalBuildingMovementArea.object)
        this.collisionDisabledGroup.add(this.towerMovementArea.object)
        
        const BRIDGE_Z = bCfg.bridgeDepth/2 + bCfg.bridgeDepth/6 + bCfg.bridgeDepth/4 + FRONTTOWER_Z
        const BRIDGE_Y = bCfg.bridgeHeight/2

        const bridge = new Bridge(0, BRIDGE_Y, BRIDGE_Z, materials.grass, bCfg.brigdeWitdh, bCfg.bridgeHeight, bCfg.bridgeDepth)
        this.add(bridge)
    } 

    addDoor(config) {
        const door = new Door(
            config.x,
            this.y + config.y,
            config.z,
            materials.rotten_wood,
            config
        );

        door.interactionDistance = config.interactionDistance ?? 4;
        door.object.rotation.y = config.rotationY ?? 0;
        
        //this.add(door)
        this.collisionDisabledGroup.add(door.object);

        this.doors.push(door);

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
        // aqui a
        const stair = new Stair(x, this.y + y, z, stairMaterial, stepWidth, stepHeight, stepDepth, stepNumber);
        stair.object.rotation.y = rotationY;
        this.collisionDisabledGroup.add(stair.object);

        // Rampa de colisão invisível 
        const ramp = new Ramp(x, y, z, rampMaterial, stepWidth, stepHeight, stepDepth, stepNumber);
        ramp.object.rotation.y = rotationY;
        this.add(ramp);

        // Armazena o par para o main.js iterar (igual ao padrão das doors) 
        const pair = { stair, ramp };
        this.stairs.push(pair);

        return pair;
    }

    update(deltaTime, playerPosition, isPlayerMoving, handleEvent) {
        this.doors.forEach(door => door.update(deltaTime, playerPosition))
        this.portals.forEach(portal => portal.update(deltaTime, playerPosition))
        
        // refatorar => portal vai receber atualização do pedestal 
        this.pedestal.update(deltaTime, playerPosition, handleEvent)
    }

    // Cria as 4 torres dos cantos do castelo, posicionadas e rotacionadas.
    // Retorna o array de torres criadas.
    addTowers(config) {
        const {
            x, y, z,                // posição absoluta de cada torre (módulo, simétrico em X e Z)
            height, radius, innerRadius, radialSegments, bricks,
            windowsConfig, pocketDepth, ceilY, ceilHeight,
            material = this.material,
        } = config;

        // Cada canto: sinal em X, sinal em Z e rotação em Y (graus)
        const corners = [
            { sx:  1, sz:  1, rotY:  90 }, // tower1
            { sx: -1, sz:  1, rotY:   0 }, // tower2
            { sx:  1, sz: -1, rotY: 180 }, // tower3
            { sx: -1, sz: -1, rotY: 270 }, // tower4
        ];

        const towers = corners.map(({ sx, sz, rotY }) => {
            const tower = new Tower(
                sx * x, y, sz * z,
                material,
                height, radius, innerRadius, radialSegments, bricks,
                windowsConfig,
                pocketDepth,
                ceilY,
                ceilHeight
            );

            if (rotY !== 0) {
                tower.object.rotateY(THREE.MathUtils.degToRad(rotY));
            }

            this.add(tower);
            return tower;
        });

        this.towers.push(...towers);
        return towers;
    }
}
