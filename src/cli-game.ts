#!/bin/bash/env node

import { Game, HumanPlayer } from "./index.ts";
import { select , input } from "@inquirer/prompts"

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {

    const game = new CLI_Game(3); // Human vs Human game
    console.log(game.displayInLog());
    
    while(!game.isFinish()){
      const playerInTurn = game.getPlayerInTurn();
      const desiredPlay = await playerInTurn.getPlay()
      playerInTurn.plays(desiredPlay);
      game.checkWin(playerInTurn)
    }

    console.log(`We have a winner!\nCongratulations ${game.winner?.name}`);
    
}

main()