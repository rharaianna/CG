import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'https://unpkg.com/three-bvh-csg@0.0.16/build/index.module.js';
import { createArchGeometry } from './ArchGeometry.js';

const evaluator = new Evaluator();

export function applyHolesToTower(baseMesh, radius, innerRadius, height, config) {
    let resultBrush = new Brush(baseMesh.geometry, config.material);
    const {
        janelas = [],
        portao = null,
        larguraJanela = 1,
        alturaJanela = 1.5,
        larguraPortao = 2,
        alturaPortao = 4
    } = config;

    const aberturas = [
        ...janelas.map(posicao => ({ ...posicao, tipo: 'janela' })),
        ...(portao ? [{ ...portao, tipo: 'portao' }] : [])
    ];

    aberturas.forEach(abertura => {
        const profundidade = (radius - innerRadius) * 2 + 1;
        const holeGeo = abertura.tipo === 'portao'
            ? createArchGeometry(
                abertura.largura ?? larguraPortao,
                abertura.altura ?? alturaPortao,
                profundidade
            )
            : createArchGeometry(
                abertura.largura ?? larguraJanela,
                abertura.altura ?? alturaJanela,
                profundidade
            );
        const holeBrush = new Brush(holeGeo, new THREE.MeshBasicMaterial());

        // Ângulo em radianos: 0 aponta para +Z e cresce em direção a +X.
        // x/z e rotationY continuam como fallback para configurações antigas.
        const angulo = abertura.angulo ?? (
            abertura.x !== undefined && abertura.z !== undefined
                ? Math.atan2(abertura.x, abertura.z)
                : 0
        );
        const x = abertura.angulo !== undefined
            ? Math.sin(angulo) * radius
            : abertura.x ?? Math.sin(angulo) * radius;
        const z = abertura.angulo !== undefined
            ? Math.cos(angulo) * radius
            : abertura.z ?? Math.cos(angulo) * radius;

        holeBrush.position.set(x, abertura.y, z);
        holeBrush.rotation.y = abertura.rotationY ?? angulo;
        holeBrush.updateMatrixWorld(true);
        resultBrush.updateMatrixWorld(true);
        resultBrush = evaluator.evaluate(resultBrush, holeBrush, SUBTRACTION);
    });

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
