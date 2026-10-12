export function configureShadows(root) {
    root.traverse(object => {
        if (!object.isMesh) return;

        const isWireframe = object.material.wireframe;
        object.castShadow = !isWireframe;
        object.receiveShadow = !isWireframe;
    });
}
