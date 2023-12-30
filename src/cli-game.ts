#!/bin/bash/env node

import { Game, HumanPlayer } from "./index.ts";
import { select , input } from "@inquirer/prompts"

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {

    const game = new CLI_Game(30, true); // Human vs CPU game
    // game.setGameAsCPUOnly()



    while(!game.isFinish()){
      const playerInTurn = game.getPlayerInTurn();
      const desiredPlay = await playerInTurn.getPlay()
      playerInTurn.plays(desiredPlay);
      if(playerInTurn !== game.getPlayerInTurn()){ // meaning it was a valid play
        game.checkWin()
      }

      // game.tests( playerInTurn.marker , desiredPlay)


    }
    // console.log(`We have a winner!\nCongratulations ${(game.playerOne === game.getPlayerInTurn()) ? game.playerTwo.name : game.playerOne.name}`);
    
}

main()