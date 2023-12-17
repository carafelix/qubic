import { expect } from "chai";
import { Floor, Game, full3Dboard } from "..";

describe('Basic Functionality Checks',() => {
    
    it('Playing a Move', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 1, row: 1, col: 1})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 1})).equals(testGame.playerOne.marker)
    })

    it('Preventing a Player from playing twice in a row', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 1, row: 1, col: 1})
        testGame.playerOne.plays({floor: 1, row: 1, col: 2})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 2})).equals('.')
    })

    it("Player Two can't play first ", () => {
        const testGame = new Game(4)
        testGame.playerTwo.plays({floor: 1, row: 1, col: 1})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 1})).equals('.')
    })

    it('Preventing a Player from playing in an occupied spot', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 1, row: 1, col: 1})
        testGame.playerTwo.plays({floor: 1, row: 1, col: 1})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 1})).equals(testGame.playerOne.marker)

    })
})

describe('Game Board Win Condition Checks',() => {
    
    describe('3D checks', () =>{

        it('', () => {

        })
    })

    describe('2D floor checks', () =>{
        
        it('', () => {

        })
    })
})