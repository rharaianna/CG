import * as THREE from "three";

/** Creates the 2D outline of a doorway with a semicircular top. */
export function createArchShape(width, height) {
    const radius = width / 2;

    if (width <= 0 || height < radius) {
        throw new RangeError("An arch requires a positive width and a height at least half its width.");
    }

    const straightHeight = height - radius;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, straightHeight);
    shape.absarc(radius, straightHeight, radius, Math.PI, 0, true);
    shape.lineTo(width, 0);
    shape.closePath();
    return shape;
}

/** Creates an extruded arch, centered for direct use in CSG cuts. */
export function createArchGeometry(width, height, depth, curveSegments = 32) {
    const geometry = new THREE.ExtrudeGeometry(
        createArchShape(width, height),
        { depth, bevelEnabled: false, curveSegments }
    );
    geometry.center();
    return geometry;
}

/** Creates one arch-door half with x = 0 located at its outer hinge. */
export function createArchDoorLeafGeometry(width, height, depth, side, curveSegments = 32) {
    const radius = width / 2;
    createArchShape(width, height);

    if (side !== "left" && side !== "right") {
        throw new TypeError('Door arch side must be "left" or "right".');
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
