import { expect } from "chai";
import { Game } from "../index.ts";

describe('Basic Functionality Checks',() => {
    
    it('Playing a Move', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})

        expect(testGame.board.getSpot({floor: 0, row: 0, col: 0})).equals(testGame.playerOne.marker)
    })

    it('Preventing a Player from playing twice in a row', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})
        testGame.playerOne.plays({floor: 0, row: 0, col: 1})

        expect(testGame.board.getSpot({floor: 0, row: 0, col: 1})).equals('.')
    })

    it("Player Two can't play first ", () => {
        const testGame = new Game(4)
        testGame.playerTwo.plays({floor: 0, row: 0, col: 0})

        expect(testGame.board.getSpot({floor: 0, row: 0, col: 0})).equals('.')
    })

    it('Preventing a Player from playing in an occupied spot', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})
        testGame.playerTwo.plays({floor: 0, row: 0, col: 0})

        expect(testGame.board.getSpot({floor: 0, row: 0, col: 0})).equals(testGame.playerOne.marker)
    })
})

// describe('Game Board Win Condition Checks',() => {
    
// forgot to commit them...

// })

describe('Statistics for Algorithm winRatios',() => {

        // it('n = 7 ', async () => {
        //     let playerOneWins = 0
        //     let playerTwoWins = 0
        //     let ties = 0;
        //     const n = 300
        //     for(let i = 0; i < n; i++){
        //         const testGame = new Game(7)
        //         testGame.setGameAsCPUOnly()

        //         while(!testGame.isFinish()){
        //             const playerInTurn = testGame.getPlayerInTurn();
        //             const desiredPlay = await playerInTurn.getPlay()
        //             playerInTurn.plays(desiredPlay);
        //             if(playerInTurn !== testGame.getPlayerInTurn()){ 
        //               testGame.checkWin()
        //             }
        //         }
        //         if(testGame.winner === testGame.playerOne){
        //             playerOneWins++
        //         } else if (testGame.winner === testGame.playerTwo){
        //             playerTwoWins++
        //         } else {
        //             ties++
        //         }
        //     }
        //     console.log()
        //     console.log(`    P1 Wins    : ${playerOneWins} / ${n} = ${((playerOneWins / n) * 100).toFixed(1)}%`);
        //     console.log(`    P2 Wins    : ${playerTwoWins} / ${n} = ${((playerTwoWins / n) * 100).toFixed(1)}%`);
        //     console.log(`    Ties       : ${ties} / ${n} = ${((ties / n) * 100).toFixed(1)}%`);
        //     console.log()
        // })
})
