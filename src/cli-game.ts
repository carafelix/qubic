#!/bin/bash/env node

import { Game, HumanPlayer } from "./index.ts";

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {
    // const game = new CLI_Game(25)           // Human vs Human game
    const game = new CLI_Game(25, true); // Human vs CPU game
    // game.setGameAsCPUOnly()

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
    console.log(`We have a winner!\nCongratulations ${game.winner ? game.winner : 'tie!'}`);
    
}

main()