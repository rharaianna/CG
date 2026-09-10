import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'https://unpkg.com/three-bvh-csg@0.0.16/build/index.module.js';
//import { degToRad } from 'three/src/math/MathUtils.js';



const evaluator = new Evaluator();

export function applyHolesToTower(baseMesh, radius, innerRadius, height, config) {
    //let resultBrush = new Brush(baseMesh.geometry.clone(), baseMesh.material);

    let resultBrush = baseMesh

    const {
        janelaslinha = 0,
        janelacoluna = 0,
        janelaAltura = 0,
        janelaLargura = 0,
        holes: customHoles = []
    } = config;

    const holes = [...customHoles];

    console.log(holes)

    // Se houver parâmetros de grid para janelas, calcula a distribuição angular e vertical
    if (janelaslinha > 0 && janelacoluna > 0 && janelaAltura > 0 && janelaLargura > 0) {
        // A espessura da parede da torre é a diferença entre o raio externo e o interno
        const wallThickness = radius - innerRadius;

        console.log(wallThickness)
        
        // Espaçamento angular entre as colunas ao longo dos 360 graus (2 * PI radianos)
        //const angleStep = 360 / janelacoluna;
        
        
        // Espaçamento vertical ao longo da altura da torre
        const spacingY = height / (janelaslinha + 1);
        
        for (let r = 0; r < janelaslinha; r++) {
            for (let c = 0; c < janelacoluna; c++) {
                // Ângulo central desta coluna em graus
                const angle = (c / janelacoluna) * Math.PI * 2

                //const angleDeg = c * angleStep;
                
                // Altura Y da janela centralizada na sua linha
                const posY = (spacingY * (r + 1)) - (height / 2);

                holes.push({
                    angle: angle,
                    y: posY,
                    width: janelaLargura,
                    height: janelaAltura,
                    depth: wallThickness * 10 // Garante que atravessa de fora a dentro
                });
            }
        }
    }

    console.log(holes)

    // Executa as subtrações usando manipulação direta de geometria (sem updateMatrixWorld)
    holes.forEach(hole => {
        
        const holeGeo = new THREE.BoxGeometry(hole.width, hole.height, hole.depth);
        const holeBrush = new Brush(holeGeo, new THREE.MeshBasicMaterial({
            wireframe: true
        }));

        //const angleRad = THREE.MathUtils.degToRad(hole.angle);
        const angleRad =  hole.angle 

        // Posiciona no ponto médio da parede da torre para o furo atravessar corretamente
        const midRadius = (radius + innerRadius) / 2;
        
        holeBrush.position.set(
            Math.cos(angleRad) * midRadius,
            hole.y,
            Math.sin(angleRad) * midRadius
        );

        // Rotaciona a geometria para acompanhar a curvatura da torre (negativo para alinhar tangencialmente)
        holeBrush.rotation.y = -angleRad;
        
        holeBrush.updateMatrixWorld();

        // Desloca para a posição correta no anel
        //holeGeo.translate(posX, hole.y, posZ);


        //holeBrush.rotateY(angleRad)
        resultBrush = evaluator.evaluate(resultBrush, holeBrush, SUBTRACTION);
        
        //resultBrush.add(holeBrush)
    });
    
    return new THREE.Mesh(resultBrush.geometry, resultBrush.material);
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
            const radius = hole.width / 2;

            const shape = new THREE.Shape();

            shape.moveTo(0, 0);
            shape.lineTo(0, hole.height - radius);

            shape.absarc(
                radius,
                hole.height - radius,
                radius,
                Math.PI,
                0,
                true
            );

            shape.lineTo(hole.width, 0);

            holeGeo = new THREE.ExtrudeGeometry(shape, {
                depth: wallDepth * 4
            });

            holeGeo.center();

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
        resultBrush.material
    );
}
