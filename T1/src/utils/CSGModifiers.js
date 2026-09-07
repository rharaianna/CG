import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'https://unpkg.com/three-bvh-csg@0.0.16/build/index.module.js';

const evaluator = new Evaluator();

export function applyHolesToTower(baseMesh, radius, innerRadius, height, config) {
    let resultBrush = new Brush(baseMesh.geometry.clone(), baseMesh.material);

    const {
        janelaslinha = 0,
        janelacoluna = 0,
        janelaAltura = 0,
        janelaLargura = 0,
        holes: customHoles = []
    } = config;

    const holes = [...customHoles];

    // Se houver parâmetros de grid para janelas, calcula a distribuição angular e vertical
    if (janelaslinha > 0 && janelacoluna > 0 && janelaAltura > 0 && janelaLargura > 0) {
        // A espessura da parede da torre é a diferença entre o raio externo e o interno
        const wallThickness = radius - innerRadius;
        
        // Espaçamento angular entre as colunas ao longo dos 360 graus (2 * PI radianos)
        const angleStep = 360 / janelacoluna;
        
        // Espaçamento vertical ao longo da altura da torre
        const spacingY = height / (janelaslinha + 1);

        for (let r = 0; r < janelaslinha; r++) {
            for (let c = 0; c < janelacoluna; c++) {
                // Ângulo central desta coluna em graus
                const angleDeg = c * angleStep;
                
                // Altura Y da janela centralizada na sua linha
                const posY = (spacingY * (r + 1)) - (height / 2);

                holes.push({
                    angle: angleDeg,
                    y: posY,
                    width: janelaLargura,
                    height: janelaAltura,
                    depth: wallThickness * 4 // Garante que atravessa de fora a dentro
                });
            }
        }
    }

    // Executa as subtrações usando manipulação direta de geometria (sem updateMatrixWorld)
    holes.forEach(hole => {
        const thickness = hole.depth || (radius - innerRadius) * 4;
        const holeGeo = new THREE.BoxGeometry(hole.width, hole.height, thickness);

        // Posicionamento polar baseado no ângulo da janela
        const angleRad = hole.angle * (Math.PI / 180);
        const posX = Math.cos(angleRad) * radius;
        const posZ = Math.sin(angleRad) * radius;

        // Desloca a geometria para a posição no cilindro
        holeGeo.translate(posX, hole.y, posZ);

        // Rotaciona a geometria para apontar para o centro da torre
        holeGeo.rotateY(-angleRad + (Math.PI / 2));

        const holeBrush = new Brush(holeGeo);
        resultBrush = evaluator.evaluate(resultBrush, holeBrush, SUBTRACTION);
    });

    return new THREE.Mesh(resultBrush.geometry, resultBrush.material);
}

export function applyHolesToWall(baseMesh, wallWidth, wallHeight, wallDepth, holes) {
    baseMesh.updateMatrixWorld();
    let resultBrush = new Brush(baseMesh.geometry, baseMesh.material);
    resultBrush.updateMatrixWorld();

    holes.forEach(hole => {
        let holeGeo;

        if (hole.type === 'arch') {
            // 1. Desenha o U invertido 2D
            const radius = hole.width / 2;
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(0, hole.height - radius);
            // Desenha a curva do topo: x, y, raio, anguloInicial, anguloFinal, sentidoHorario
            shape.absarc(radius, hole.height - radius, radius, Math.PI, 0, true);
            shape.lineTo(hole.width, 0);

            // 2. Extruda para 3D com a espessura de corte
            holeGeo = new THREE.ExtrudeGeometry(shape, { 
                depth: wallWidth * 4, 
            });
            
            // Centraliza o pivô para manter compatibilidade com a matemática da BoxGeometry
            holeGeo.center(); 
            // Gira 90 graus para que a face do arco fique alinhada com o comprimento da parede
            holeGeo.rotateY(Math.PI / 2);
        } else {
            // Geometria padrão quadrada/retangular
            holeGeo = new THREE.BoxGeometry(wallWidth * 4, hole.height, hole.width);
        }

        const holeBrush = new Brush(holeGeo);

        const startZ = -wallDepth / 2;
        const startY = -wallHeight / 2;

        holeBrush.position.set(
            0, 
            startY + hole.y + (hole.height / 2),
            startZ + hole.x + (hole.width / 2)
        );
        
        holeBrush.updateMatrixWorld();
        resultBrush = evaluator.evaluate(resultBrush, holeBrush, SUBTRACTION);
    });

    return new THREE.Mesh(resultBrush.geometry, resultBrush.material);
}
