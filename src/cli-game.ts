#!/bin/bash/env node

import { Game, HumanPlayer } from "./index.ts";
import { select , input } from "@inquirer/prompts"

export class CLI_Game extends Game {
  // overwrite playerOne and playerTwo play function trough composition
  // other option is to prompt inside the cli game and just store those values and pass them to the plays function

}


async function main() {

    const game = new CLI_Game(4); // Human vs CPU game
    while(!game.isFinish()){
      const playerInTurn = game.getPlayerInTurn();
      const desiredPlay = await playerInTurn.getPlay()
      playerInTurn.plays(desiredPlay);
      
    }
}

main()