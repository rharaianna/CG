import {
  InfoBox,
  onWindowResize,
} from "../../libs/util/util.js";

import { Game } from './Game.js';

// listeners
document.body.addEventListener('click', function (event) {
  game.shoot()
});

document.body.addEventListener('keydown', function (event) { 
  if (event.key.toLocaleLowerCase() === 'c')
    game.toggleCamera()
});

// disparo
document.addEventListener('mousedown', (evento) => {
  if (game.pointerControlsOn) {
    // 0->botao esquerdo e 2->boato direito
    if (evento.button === 0 || evento.button === 2) {
      game.shoot(game.playerCamera);
    }
  }
});

// previne menu de contexto ao apertar botao direito
document.addEventListener('contextmenu', (evento) => {
  evento.preventDefault();
});

window.addEventListener('resize', function () { 
  onWindowResize(game.playerCamera, renderer) 
}, false);
 
// game
const game = new Game()
game.start()

// tooltip na tela
let information = new InfoBox();
information.add("Trabalho versão 1.0");
information.addParagraph();
information.add("- Use o mouse para visualizar");
information.add("- Use WASD ou Arrows para movimentar");
information.add("- Use SHIFT para correr");
information.add("- Aperte c para trocar de câmera");
information.addParagraph();
information.add("por Isadora, João Pedro & Rhara");
information.show();
