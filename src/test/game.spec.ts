import { expect } from "chai";
import { Game, full3Dboard } from "../index.ts";

async function playAutoGames (repetitions:number , gridSize : number, isDumbGame? : boolean ,isP1Dumb? : boolean) {
    let playerOneWins = 0
    let playerTwoWins = 0
    let ties = 0;

    const n = repetitions
    for(let i = 0; i < n; i++){
        const testGame = new Game(gridSize)
        testGame.setGameAsCPUOnly(isDumbGame, isP1Dumb)
        const log = []

        while(!testGame.isFinish()){
            const playerInTurn = testGame.getPlayerInTurn();
            const desiredPlay = await playerInTurn.getPlay()
            playerInTurn.plays(desiredPlay);
            if(playerInTurn !== testGame.getPlayerInTurn()){
                log.push({
                    desiredPlay,
                    board: JSON.stringify(testGame.board)
                })
              testGame.checkWin()
            }
        }

        // if(testGame.winner === testGame.playerTwo){
        //     for(const position of log){
        //         const mockBoard = new full3Dboard(...JSON.parse(position.board))
        //         mockBoard.logCurrentState()
        //         console.log(
        //             position.desiredPlay, '\n'
        //         )
        //     }
        //     break
        // }

        if(testGame.winner === testGame.playerOne){
            playerOneWins++
        } else if (testGame.winner === testGame.playerTwo){
            playerTwoWins++
        } else {
            ties++
        }
    }
    console.log()
    console.log(`    P1 Wins    : ${playerOneWins} / ${n} = ${((playerOneWins / n) * 100).toFixed(1)}%`);
    console.log(`    P2 Wins    : ${playerTwoWins} / ${n} = ${((playerTwoWins / n) * 100).toFixed(1)}%`);
    console.log(`    Ties       : ${ties} / ${n} = ${((ties / n) * 100).toFixed(1)}%`);
    console.log()
}

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

       

        // it('n = 3, p2 is Dumb ', ()=>{
        //     playAutoGames(20000, 3, true)
        // })

        // it('n = 3, p1 is Dumb, p2 is not ', ()=>{
        //     playAutoGames(20000, 3, true, true)
        // })

        // it('n = 4, p2 is Dumb ', ()=>{
        //     playAutoGames(10000, 4, true)
        // })

        // it('n = 4, p1 is Dumb, p2 is not ', ()=>{
        //     playAutoGames(10000, 4, true, true)
        // })

        // it('n = 5, p2 is Dumb ', ()=>{
        //     playAutoGames(5000, 5, true)
        // })

        // it('n = 5, p1 is Dumb, p2 is not ', ()=>{
        //     playAutoGames(5000, 5, true, true)
        // })

        it('n = 6, p2 is Dumb ', ()=>{
            playAutoGames(1000, 6, true)
        })

        it('n = 6, p1 is Dumb, p2 is not ', ()=>{
            playAutoGames(1000, 6, true, true)
        })

});
