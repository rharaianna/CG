import * as THREE from 'three';
import { Capsule } from '../../../build/jsm/math/Capsule.js';

/**
 * Executa a física do jogo
 * Armazena vetores para execução das colisões
 * 
 * @property {Object} worldOctree - Octree gerada sobre o cenário, para que as funções possam acessá-la 
 * @property {Capsule} playerCollider - Cápsula para simular player na colisão com ponto inicial em 
 *                                      (x=0, y=0.35, z=0) e final em (x=0, y=1, z=0) e 0.35 de raio
 * @property {Vector3} playerVelocity - Vetor para guardar a velocidade do player
 * @property {Vector3} playerDirection - Vetor para guardar a direção pra onde o player está tentando se mover
 * @property {bollean} playerOnFloor - Indica se o player está ou não no chão
 */

const GRAVITY = 100

export class PlayerPhysics {
    constructor(worldOctree) {
        this.worldOctree = worldOctree;
        this.playerCollider = new Capsule(
            new THREE.Vector3(0, 0.15, 0),
            new THREE.Vector3(0, 2, 0), 0.35); // ta com 1.85 de altura
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.playerOnFloor = false;
        this.storedQuaternion = new THREE.Quaternion();// para guardar x, y, z e rotação da camera
    }


    // Resolve a colisão
    playerCollisions() {
        this.playerOnFloor = false;

        /* Testa se a cápsula está colidindo com alguma geometria armazenada no octree.
           Se houver colisão, result recebe um objeto com informações sobre ela; se não houver, 
           result é false. 
           Result tem {normal}: um vetor indicando a direção da superfície de colisão(pra onde aponta a superfície)
           e {depth} => o quanto a cápsula está "atravessando" a geometria
        */
        const result = this.worldOctree.capsuleIntersect(this.playerCollider);

        if (result) {

            // define se o jogador está no chão, de adcordo com a inclinação da superfície
            this.playerOnFloor = result.normal.y >= 0.15;

            if (!this.playerOnFloor) {

                /* cancela o movimento "pra dentro" da parede.
                   -> result.normal.dot(this.playerVelocity): calcula o produto escalar entre a normal 
                      e a velocidade, que dá a magnitude da velocidade na direção da normal (ou seja, 
                      o quanto o jogador está indo de encontro à parede).
                   -> addScaledVector(result.normal, -...): soma à velocidade o vetor normal pelo negativo 
                      do valor anterior, cancelando a parte da velocidade que ia contra a superfície.
                */
                this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
            }


            /* Verifica se a profundidade de penetração é maior que um valor quase zero, pois
               evita processar correções desnecessárias por erros de arredondamento de ponto flutuante.
            */
            if (result.depth >= 1e-10) {

                /* Corrige a posição do jogador, empurrando a cápsula pra fora da geometria colidida
                   -> result.normal.multiplyScalar(result.depth): cria um vetor na direção da normal, 
                      com magnitude igual à profundidade de penetração.
                   -> this.playerCollider.translate(...): move a cápsula inteira nessa direção/distância
                */
                this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
            }
        }
    }


    // atualiza a posição e a física do player
    updatePlayer(deltaTime) {

        /* Calcula um fator de amortecimento (damping) que simula atrito/resistência independente do frame rate.
           -> Math.exp(-4 * deltaTime): dá um valor próximo de 1 quando deltaTime é pequeno, 
              e diminui conforme o tempo passa.
           -> Subtrair 1: deixa o resultado negativo (perto de 0 quando deltaTime é bem pequeno, mais 
              negativo conforme deltaTime cresce).
           -> 4 é uma constante que controla a "intensidade" do amortecimento (quanto maior, mais rápido 
              a velocidade é reduzida).
        */
        let damping = Math.exp(-7 * deltaTime) - 1;

        // física da queda
        if (!this.playerOnFloor) {

            // Diminui o y da velocidade proporcional ao tempo passado
            this.playerVelocity.y -= GRAVITY * deltaTime;

            /** Reduz o efeito do damping (multiplicando por 0.1) quando o jogador está no ar.
             * No ar, o jogador perde bem menos velocidade horizontal do que quando está no chão.
            */
            damping *= 0.5 //resitencia ao ar
        }


        /* Faz playerVelocity += playerVelocity * damping
           Reduz a velocidade proporcional a ela mesma; quanto mais rápido o jogador está indo, mais ele desacelera
        */
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);


        /**
         * Calcula o quanto o jogador deve se mover nesse frame):
         * -> .clone(): cria uma cópia do vetor velocidade, pra não alterar o vetor original
         * -> .multiplyScalar(deltaTime): multiplica a velocidade pelo tempo, resultando em distância 
         *    (física básica: distância = velocidade × tempo)
         */
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);


        // Move a cápsula do player pela quantidade calculada
        this.playerCollider.translate(deltaPosition);


        // Checa se a nova posição colide com algo no cenário
        this.playerCollisions();
    }


    // calcula a direção "pra frente" do jogador, baseada na câmera
    getForwardVector(camera) {

        // calcula pra onde a câmera está apontando no mundo
        camera.getWorldDirection(this.playerDirection);

        // Zera o y da direção, para que o player se mova apenas na horizontal e não saia voando.
        this.playerDirection.y = 0

        // Recalcula o vetor pra que ele volte a ter magnitude 1, mantendo só a direção, depois de ter zerado o y.
        this.playerDirection.normalize();

        return this.playerDirection;
    }


    // calcula a direção lateral do jogador, baseada na câmera
    getSideVector(camera) {

        // calcula pra onde a câmera está apontando no mundo
        camera.getWorldDirection(this.playerDirection);

        // Zera o y da direção, para que o player se mova apenas na horizontal e não saia voando.
        this.playerDirection.y = 0

        // Recalcula o vetor pra que ele volte a ter magnitude 1, mantendo só a direção, depois de ter zerado o y.
        this.playerDirection.normalize();

        /**
         * Calcula o produto vetorial entre a direção frontal e o vetor "pra cima" da câmera.
         * Como playerDirection aponta pra frente e camera.up aponta pra cima, o resultado é um vetor que aponta pro lado.
         */
        this.playerDirection.cross(camera.up)

        return this.playerDirection;
    }


    // Resolve caso em que o player caiu do mapa
    teleportPlayerIfOob(camera) {

        // Verifica se o y da camera é menor que um limite
        if (camera.position.y <= - 25) {

            // Reseta o ponto inicial da cápsula do jogador de volta pra origem (0, 0.35, 0)
            this.playerCollider.start.set(0, 0.15, 0);

            // Reseta o topo da cápsula pra (0, 1, 0)
            this.playerCollider.end.set(0, 2, 0);


            /* Redefine o raio da cápsula pra 0.35 (garantindo que, mesmo que algo tenha alterado 
               essa propriedade, ela volte ao valor padrão).
            */
            this.playerCollider.radius = 0.35;

            // Move a posição da câmera pra coincidir com o topo da cápsul, que acabou de ser resetado pra (0, 1, 0)
            camera.position.copy(this.playerCollider.end);

            // Zera a rotação da câmera, olhando pra frente, sem inclinação
            camera.rotation.set(0, 0, 0);
        }
    }


    storePlayerDirection(camera) {
        // guarda para onde a câmera está olhando
        this.storedQuaternion.copy(camera.quaternion);
    }

    restorePlayerDirection(camera) {
        // copia a posição do player
        camera.position.copy(this.playerCollider.end);

        // volta a olhar para o mesmo lugar de antes
        camera.quaternion.copy(this.storedQuaternion);
    }
}
