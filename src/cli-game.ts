#!/bin/bash/env node

import { Game } from "./index.ts";
import { select , input } from "@inquirer/prompts"

export class CLI_Game extends Game {
    
}



async function main() {

    const game = new CLI_Game(4, true); // Human vs CPU game
    let run = true
    while(!game.isFinish() && run){

      const answer = await input({ message: 'Enter your name' });
      run = false
    }
}

main()