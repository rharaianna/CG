import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'https://unpkg.com/three-bvh-csg@0.0.16/build/index.module.js';
import { createArchGeometry } from './ArchGeometry.js';

const evaluator = new Evaluator();

export function applyHolesToTower(baseMesh, radius, innerRadius, height, config) {
    
    let resultBrush = new Brush(baseMesh.geometry, config.material);

    const {
        linhas = 0,
        colunas = 0,
        raio = 1, 
        holes: customHoles = []
    } = config;

    const holes = [...customHoles];

    // Se houver parâmetros de grid para janelas, calcula a distribuição angular e vertical
    if (linhas > 0 && colunas > 0 && raio > 0) {

        // A espessura da parede da torre é a diferença entre o raio externo e o interno
        const wallThickness = radius - innerRadius 
  
        // Espaçamento vertical ao longo da altura da torre
        const spacingY = height / (linhas + 1);
        
        for (let r = 0; r < linhas; r++) {
            for (let c = 0; c < colunas; c++) {

                const angle = (c / colunas) * Math.PI * 2

                // Altura Y da janela centralizada na sua linha
                const posY = (spacingY * (r + 1)) - (height / 2);

                holes.push({
                    angle: angle,
                    y: posY,
                    depth: wallThickness
                });
            }
        }
    }

    // Executa as subtrações usando manipulação direta de geometria (sem updateMatrixWorld)
    holes.forEach(hole => {
        
        const holeGeo = new THREE.SphereGeometry(raio, 16, 16);
        const holeBrush = new Brush(holeGeo, new THREE.MeshBasicMaterial());

        // usa o raio do cilindro para posicionar
        holeBrush.position.set(
            Math.cos(hole.angle) * radius,
            hole.y,
            Math.sin(hole.angle) * radius
        );

        holeBrush.rotation.y = -hole.angle;
        holeBrush.rotation.z = -hole.angle;
        
        holeBrush.updateMatrixWorld(true);
        resultBrush.updateMatrixWorld(true);

        resultBrush = evaluator.evaluate(resultBrush, holeBrush, SUBTRACTION);
    });
    
    // retorna a mesh recebida atualizada com os buracos
    return resultBrush;
}

export function applyHolesToWall(baseMesh, wallWidth, wallHeight, wallDepth, holes) {
    baseMesh.updateMatrixWorld();

    let resultBrush = new Brush(
        baseMesh.geometry,
        baseMesh.material
    );

    resultBrush.updateMatrixWorld();

    holes.forEach(hole => {
        let holeGeo;

        if (hole.type === 'arch') {
            holeGeo = createArchGeometry(hole.width, hole.height, wallDepth * 4);
        } else {
            holeGeo = new THREE.BoxGeometry(
                hole.width,
                hole.height,
                wallDepth * 4
            );
        }

        const holeBrush = new Brush(holeGeo);

        const startX = -wallWidth / 2;
        const startY = -wallHeight / 2;

        holeBrush.position.set(
            startX + hole.x + hole.width / 2,
            startY + hole.y + hole.height / 2,
            0
        );

        holeBrush.updateMatrixWorld();

        resultBrush = evaluator.evaluate(
            resultBrush,
            holeBrush,
            SUBTRACTION
        );
    });

    return new THREE.Mesh(
        resultBrush.geometry,
        baseMesh.material
    );
}
