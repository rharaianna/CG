import * as THREE from "three";

// recebe a altura e largura do arco
export function createArchShape(width, height) {
    //raio é metade da largura
    const radius = width / 2;

    if (width <= 0 || height < radius) {
        throw new RangeError("dimenções invaalidas");
    }

    //altura da parte reta do arco (antes de chegar no circulo)
    const straightHeight = height - radius;
    const shape = new THREE.Shape();

    //posiciona em x=0 e y=0
    shape.moveTo(0, 0);

    //faz a reta (lateral esquerda)
    shape.lineTo(0, straightHeight);

    //recebe centro x, centro y, raio , vai de 180 graus a 0 no sentido true
    shape.absarc(radius, straightHeight, radius, Math.PI, 0, true);
    
    //faz a reta (lateral direita)
    shape.lineTo(width, 0);

    //fecha a forma
    shape.closePath();
    return shape;
}

//deixa 3d o arco e centraliza
export function createArchGeometry(width, height, depth, curveSegments = 32) {
    const geometry = new THREE.ExtrudeGeometry(
        createArchShape(width, height),
        { depth, bevelEnabled: false, curveSegments }
    );

    //move a geometria para que seu centro fique próximo da origem
    geometry.center();
    return geometry;
}

//msm coisa do outro create mas de acordo com o lado do arco
export function createArchDoorLeafGeometry(width, height, depth, side, curveSegments = 32) {
    const radius = width / 2;
    createArchShape(width, height);

    if (side !== "left" && side !== "right") {
        throw new TypeError('lado invalido');
    }

    const straightHeight = height - radius;
    const shape = new THREE.Shape();

    if (side === "left") {
        shape.moveTo(0, 0);
        shape.lineTo(0, straightHeight);
        shape.absarc(radius, straightHeight, radius, Math.PI, Math.PI / 2, true);
        shape.lineTo(radius, 0);
    } else {
        shape.moveTo(-radius, 0);
        shape.lineTo(-radius, height);
        shape.absarc(-radius, straightHeight, radius, Math.PI / 2, 0, true);
        shape.lineTo(0, 0);
    }

    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments
    });

    geometry.translate(0, -height / 2, -depth / 2);
    return geometry;
}
