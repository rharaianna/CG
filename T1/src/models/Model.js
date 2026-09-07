import * as THREE from "three";

export class Model {
    constructor(x = 0, y = 0, z = 0, material = null) {

        this.object = new THREE.Group();
        this.object.position.set(x, y, z);

        this.material = material ?? new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        });

        this.children = [];

        // wireframe da caixa
        this.boundingBox = new THREE.Box3();
        this.boxHelper = new THREE.Box3Helper(
            this.boundingBox,
            0xffff00
        );
        this.object.add(this.boxHelper); 
    }

    add(model) {
        this.children.push(model);

        if (model instanceof Model) {
            this.object.add(model.object);
        } else {
            this.object.add(model);
        }

        this.updateBoundingBox();
    }

    rotate({x, y, z}) {
        this.object.rotateX(x)
        this.object.rotateY(y)
        this.object.rotateZ(z)
    }

    translate({x, y, z}) {
        this.object.translateX(x)
        this.object.translateY(y)
        this.object.translateZ(z)
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.object);
    }

    showBoundingBox(scene) {
        scene.add(this.boxHelper);
        this.boxHelper.visible = true;
    }   

    hideBoundingBox() {
        this.boxHelper.visible = false;
    }

    update(deltaTime) {
        for (const child of this.children) {
            child.update(deltaTime);
        }

        this.updateBoundingBox();
    }
}