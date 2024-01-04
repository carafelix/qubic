#!/bin/bash/env node

import { Game, HumanPlayer } from "./index.ts";

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {
    const game = new CLI_Game(3);
    game.setGameAsCPUOnly(true)

    while(!game.isFinish()){
      // const start = new Date().getTime()

      const playerInTurn = game.getPlayerInTurn();
      const desiredPlay = await playerInTurn.getPlay()
      playerInTurn.plays(desiredPlay);
      if(playerInTurn !== game.getPlayerInTurn()){ // meaning it was a valid play
        game.checkWin()
      }
      // console.log(new Date().getTime() - start);
      game.displayInLog()
    }
    console.log(`We have a winner!\nCongratulations ${game.winner?.name ? game.winner.name : 'tie is not possible'}`);
    
}

main()