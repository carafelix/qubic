#!/bin/bash/env node

import { Game, HumanPlayer } from "./game.ts";

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {
    // Human vs Human
    // const game = new CLI_Game(3);

    // Human vs CPU, Cpu first
    // const game = new CLI_Game(5, true, true)

    // Human Vs CPU, Human First
    const game = new CLI_Game(4, true, false)

    // Set game as CPU Only
    // read the function parameters for setting dumb vs smart cpu's
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
    console.log(`We have a winner!\nCongratulations ${game.winner?.name ? game.winner.name : 'tie is not possible'}`);
    
}

main()