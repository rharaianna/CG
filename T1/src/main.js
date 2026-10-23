import {
  InfoBox,
  onWindowResize,
} from "../../libs/util/util.js";

import { Game } from './core/Game.js';

// listeners
document.body.addEventListener('click', function (event) {
  game.shoot()
});

document.body.addEventListener('keydown', function (event) {
  const key = event.key.toLowerCase();

  if (key === 'c') {
    game.toggleCamera();
  }

  if (key === 'h') {
    game.setDay(!game.state.isDay);
  }

  if (key === 'k') {
    game.collectAllKeys();
  }
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
  onWindowResize(game.getActiveCamera(), game.renderer) 
}, false);
 
// game
const game = new Game()
game.start()

// tooltip na tela
let information = new InfoBox();
information.add("Trabalho versão 2.0");
information.addParagraph();
information.add("- Use o mouse para visualizar");
information.add("- Use WASD ou Arrows para movimentar");
information.add("- Use SHIFT para correr");
information.add("- Aperte C para trocar de câmera");
information.add("- Aperte K para coletar todas as chaves");
information.add("- Aperte H para alternar entre dia/noite");
information.addParagraph();
information.add("por Isadora, João Pedro & Rhara");
information.show();
