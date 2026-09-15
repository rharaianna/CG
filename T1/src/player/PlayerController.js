export class PlayerController {
    
    constructor (){
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        window.addEventListener('keydown', (e) => this.handleKey(e.keyCode, true));
        window.addEventListener('keyup', (e) => this.handleKey(e.keyCode, false));
    }
    
    handleKey(key, value){
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