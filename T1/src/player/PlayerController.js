/**
 * Gerencia os comandos do teclado
 */

export class PlayerController {

    constructor() {

        // false para todas as direções possíveis para mover
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;


        /* listener global no window pro evento keydown (quando qualquer tecla é pressionada)
           Quando é pressionada chama handlekey
        */
        window.addEventListener('keydown', (e) => this.handleKey(e.keyCode, true));


        // listener global no window pro evento keyup, indicando que aquela tecla não está mais pressionada.   
        window.addEventListener('keyup', (e) => this.handleKey(e.keyCode, false));
    }

    
    // que recebe o código da tecla (key) e um valor booleano (value) indicando se foi pressionada (true) ou solta (false).
    handleKey(key, value) {
        switch (key) {
            case 38: case 87: // arrow up | W 
                this.moveForward = value; break;

            case 40: case 83: // arrow down | S
                this.moveBackward = value; break;

            case 37: case 65: // arrow left | A
                this.moveLeft = value; break;

            case 39: case 68: // arrow right | D
                this.moveRight = value; break;

            case 32: //space
                this.moveUp = value; break;

            case 16: // shift
                this.moveDown = value; break;
        }
    }
}