import * as THREE from "three";
import { Model } from "../Model.js";
import { KEYS_CONFIG } from "../../entity/key.config.js";
import { Key } from "../../entity/Key.js";
import { EVENTS } from "../../core/events.enum.js";

export class Receptacle extends Model {
    constructor(scene, x, y, z, material, config = {}, key) {
        super(x, y, z, material);

        this.scene = scene
        this.config = config
        this.key = key
        this.active = false

        const { width = 3, height = 10, depth = 3 } = config;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            this.material
        );

        this.worldPosition = new THREE.Vector3()
        this.add(this.mesh)
    }

    update(deltaTime, playerPosition, handleEvent) {
     
        this.object.getWorldPosition(this.worldPosition);
        const distance = playerPosition.distanceTo(this.worldPosition);
        const minDistance = 5

        // se nao estiver ativado 
        if(!this.active && distance < minDistance) {

            // chama evento pro game cuidar das chaves
            const consumed = handleEvent({
                type: EVENTS.CONSUME_KEY,
                body: {
                    key: this.key
                }
            });
            
            // nao marca se nao deu certo com a chave
            if (!consumed) 
                return;

            const position = this.worldPosition.clone()
            position.y += this.config.height
            
            this.keyEntity = new Key(this.scene, { key: this.key, position, collectible: false })
            this.active = true;
        }

        // para a chave ficar sobrevoando
        const floorY = this.y + this.config.height
        
        // mantém a chave animada
        if(this.active)
            this.keyEntity.animateFloating(deltaTime, floorY)
    }
}
