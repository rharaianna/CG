import * as THREE from "three";
import { Model } from "../Model.js";
import { Tower } from "../structures/Tower.js";
import { Floor } from "../structures/Floor.js";
import { Door } from "../structures/Door.js";

import { materials } from "../material.configs.js"
import { Wall } from "../structures/Wall.js";

export class Castle extends Model {
    constructor(x, y, z, material, config) {
        super(x, y, z, materials.bricks);

        // parâmetros ajustáveis do castelo que vai alterar todas as paredes e torres
        const AR = 4/3
        const WIDTH = 70
        const DEPTH = WIDTH * AR
        const WALL_WIDTH = 2

        const floorConfig = {
            width: WIDTH,
            depth: DEPTH,
            height: 0.1,
        }
        const floorY = floorConfig.height/2
        const floor = new Floor(0, floorY, 0, materials.grass, floorConfig);
        this.add(floor)
        this.timer = 0;

        let wallConfig = {
            width: WALL_WIDTH,
            // correção de +2 * width pra cobrir o outro lado
            depth: floorConfig.width + 2*WALL_WIDTH,
            height: 10,
            rotations: {
                x: 0,
                y: THREE.MathUtils.degToRad(90),
                z: 0
            }
            
        }
        
        const wall1Config = {
            ...wallConfig,
            portao: true,
            alturaPortao: 6,
            larguraPortao: 8,
            janelaslinha: 1,
            janelacoluna: 6,
            janelaAltura: 2,
            janelaLargura: 1.5
        };

        

        

        // paredes paralelas ao Z 
        // parede 1
        let wallY = wallConfig.height/2 
        let wallZ = floorConfig.depth/2 + wallConfig.width/2
        const wall1 = new Wall(0, wallY, -wallZ, materials.bricks, wall1Config)
        
        // parede 2
        const wall2 = new Wall(0, wallY, wallZ, materials.bricks, wallConfig)

        // paredes paralelas ao X 
        wallConfig["depth"] = floorConfig.depth,
        wallConfig["rotations"] = { 
            x: 0,
            y: 0,
            z: 0
        }



        // parede 3
        let wallX = floorConfig.width/2 + wallConfig.width/2
        const wall3 = new Wall(wallX, wallY, 0, null, wallConfig)
        
        // parede 4
        const wall4 = new Wall(-wallX, wallY, 0, materials.bricks, wallConfig)
        
        this.add(wall1)
        this.add(wall2)
        this.add(wall3)
        this.add(wall4)

        // torres de castelos tem entre 2-5 m de raio e 15-30m de altura
        let towerConfig = {
            width: 10,
            height: 20,
            depth: 10,
            radius: 4,
            radialSegments: 32,
            innerRadius: 2,
            janelaslinha: 2,        // 2 fileiras de janelas na altura
            janelacoluna: 4,        // 4 colunas distribuídas em 360° ao redor da torre
            janelaAltura: 2,
            janelaLargura: 1
        }

        const towerY = towerConfig.height/2 + floorConfig.height
        const towerX = wallX
        const towerZ = wallZ

        // torres
        const tower1 = new Tower(towerX, towerY, towerZ, null, towerConfig);
        const tower2 = new Tower(-towerX, towerY, towerZ, null, towerConfig);
        const tower3 = new Tower(towerX, towerY, -towerZ, this.material, towerConfig);
        const tower4 = new Tower(-towerX, towerY, -towerZ, this.material, towerConfig);
        
        this.add(tower1)
        this.add(tower2)
        this.add(tower3)
        this.add(tower4)

        // redução da altura e dos lados
        towerConfig["radialSegments"] = 6
        towerConfig["height"] *= 0.8

        let midTowerX = wallX
        let midTowerZ = wallZ
        let midTowerY = towerConfig.height/2 + floorConfig.height

        // torres intermediárias
        //const midTower1 = new Tower(0, midTowerY, midTowerZ, this.material, towerConfig);
        const midTower2 = new Tower(0, midTowerY, -midTowerZ, this.material, towerConfig);
        const midTower3 = new Tower(midTowerX, midTowerY, 0, this.material, towerConfig);
        const midTower4 = new Tower(-midTowerX, midTowerY, 0, this.material, towerConfig);

        //this.add(midTower1)
        //this.add(midTower2)
        this.add(midTower3)
        this.add(midTower4)


        const doorConfig = {
            width: 8,       // Mesma largura do portão cavado na parede
            height: 6,      // Mesma altura
            depth: 0.3      // Espessura das tábuas da porta
        };

        // Posiciona o portão na mesma coordenada da parede 1
        const doorY = doorConfig.height / 2;
        const doorZ = -wallZ + WALL_WIDTH / 2; // Levemente ajustado para o vão

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
