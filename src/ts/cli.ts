#!/bin/bash/env node

import { Game, HumanPlayer } from "./game";


async function main() {
    const game = new Game(3);
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