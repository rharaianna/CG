import * as THREE from "three";
import { Model } from "../Model.js";
import { applyHolesToWall } from "../../utils/CSGModifiers.js";

export class Wall extends Model {
    constructor(x, y, z, material, width, height, depth, windowsConfig) {
        super(x, y, z, material);

        this.x = x;
        this.y = y;
        this.z = z;
        //this.material = material;
        this.width = width;
        this.height = height;
        this.depth = depth;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        let mesh = new THREE.Mesh(geometry, this.material);
                
        mesh = this.renderWindows(windowsConfig, mesh)
        this.object.add(mesh)

    }

    renderWindows(windowsConfig, mesh) {
        if(!!windowsConfig) {
            
            const {
                linhas = 0,
                colunas = 0,
                altura = 0,
                largura = 0,
                portao = false,
                alturaPortao = 0,
                larguraPortao = 0,
                holes: customHoles = [], // Permite receber holes manuais se necessário
                towerCuts = []
            } = windowsConfig;
    
            //======== INICIO PARTE DAS JANELAS E PORTAO========
            const holes = [...customHoles];
    
            // 1. Adiciona o portão em arco (U invertido) se ativado
            if (portao && alturaPortao > 0 && larguraPortao > 0) {
                holes.push({
                    x: (this.width / 2) - (larguraPortao / 2),
                    y: 0,
                    width: larguraPortao,
                    height: alturaPortao,
                    type: 'arch'
                });
            }
    
            // 2. Adiciona as janelas em formato de grid se especificadas
            if (linhas > 0 && colunas > 0 && altura > 0 && largura > 0) {
                const spacingX = this.width / (colunas + 1);
                const usableHeight = this.height - (portao ? alturaPortao : 0);
                const spacingY = usableHeight / (linhas + 1);
                const baseOffsetY = portao ? alturaPortao : 0;
    
                for (let r = 0; r < linhas; r++) {
                    for (let c = 0; c < colunas; c++) {
                        const hx = spacingX * (c + 1) - (largura / 2);
                        const hy = baseOffsetY + spacingY * (r + 1) - (altura / 2);
    
                        holes.push({
                            x: hx,
                            y: hy,
                            width: largura,
                            height: altura
                        });
                    }
                }
            }
    
            // 3. Aplica os recortes apenas se houver buracos windowsConfigurados
            if (holes.length > 0) {
                mesh = applyHolesToWall(mesh, this.width, this.height, this.depth, holes);
            }
            //======== FIM  PARTE DAS JANELAS E PORTAO========
    
            if (towerCuts.length > 0) {
                mesh = applyTowerCutoutsToWall(mesh, this.width, this.height, this.depth, towerCuts);
            }
        }

        return mesh
    }
}
