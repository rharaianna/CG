import * as THREE from "three";
import { Model } from "../Model.js";
import { Tower } from "../structures/Tower.js";
import { Floor } from "../structures/Floor.js";
import { Door } from "../structures/Door.js";

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
        const TOWER_INNER_RADIUS = 6 * SCALE
        const TOWER_RADIAL_SEGMENTS = 12
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
        this.timer = 0;

        const windowsConfig = {
            portao: true,
            alturaPortao: (WALL_HEIGHT - (2 * SCALE)),
            larguraPortao: (2 * TOWER_RADIUS),
            janelaslinha: 1,
            janelacoluna: 4,
            janelaAltura: 2,
            janelaLargura: 1.5
        };

        // paredes posicionadas no Z, paralelas ao X (vermelho)
        // largura delas é a mesma largura do terreno 
        const wall1 = new CastleWall(0, wallY, -wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsConfig)
        const wall2 = new CastleWall(0, wallY, wallZ, this.material, WIDTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsConfig)

        // paredes posicionadas no X, paralelas ao Z (azul)
        // comprimento delas é a profundidade do terreno e rotacionadas
        // largura delas é a mesma profundidade do terreno e são rotacionadas
        const wall3 = new CastleWall(wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsConfig)
        const wall4 = new CastleWall(-wallX, wallY, 0, this.material, DEPTH, WALL_HEIGHT, WALL_DEPTH, TOWER_RADIUS, windowsConfig)

        wall3.object.rotateY(THREE.MathUtils.degToRad(90))
        wall4.object.rotateY(THREE.MathUtils.degToRad(90))

        this.add(wall1)
        this.add(wall2)
        this.add(wall3)
        this.add(wall4)

        let windowsTowerConfig = {
            janelaslinha: 1,        // 2 fileiras de janelas na altura
            janelacoluna: 4,        // 4 colunas distribuídas em 360° ao redor da torre
            janelaAltura: 1,
            janelaLargura: 1
        }
    
        // posicionadas nas extremidades das paredes
        const tower1 = new Tower(0, towerY, 0, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower2 = new Tower(-towerX, towerY, towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower3 = new Tower(towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        const tower4 = new Tower(-towerX, towerY, -towerZ, this.material, TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, TOWER_BRICKS, windowsTowerConfig);
        
        this.add(tower1)
        this.add(tower2)
        this.add(tower3)
        this.add(tower4)
        
        //const midTower1 = new Tower(0, midTowerY, midTowerZ, this.material, towerConfig);
        const midTower2 = new Tower(0, midTowerY, -midTowerZ, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);
        const midTower3 = new Tower(midTowerX, midTowerY, 0, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);
        const midTower4 = new Tower(-midTowerX, midTowerY, 0, this.material, MID_TOWER_HEIGHT, TOWER_RADIUS, TOWER_INNER_RADIUS, TOWER_RADIAL_SEGMENTS, MID_TOWER_BRICKS);

        //this.add(midTower1)
        //this.add(midTower2)
        //this.add(midTower3)
        //this.add(midTower4)


        const doorConfig = {
            width: 8,       // Mesma largura do portão cavado na parede
            height: 6,      // Mesma altura
            depth: 0.3      // Espessura das tábuas da porta
        };

        // Posiciona o portão na mesma coordenada da parede 1
        const doorY = doorConfig.height / 2;
        const doorZ = -wallZ + WALL_DEPTH / 2; // Levemente ajustado para o vão

        this.castleDoor = new Door(0, doorY, doorZ, materials.wood || this.material, doorConfig);

        
        // Se quiser testar o portão aberto logo na criação:
        // this.castleDoor.toggleDoor(true);

        this.add(this.castleDoor);

    }
    
    
    
    update(deltaTime) {
        super.update(deltaTime);
    
        // Incrementa o tempo a cada frame
        this.timer += deltaTime;
    
        // A cada 3 segundos, inverte o estado do portão automaticamente
        if (this.timer > 3.0) {
            this.timer = 0;
            if (this.castleDoor) {
                const estadoAtual = this.castleDoor.isOpen;
                this.castleDoor.toggleDoor(!estadoAtual);
            }
        }
    }
}
