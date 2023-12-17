import { expect } from "chai";
import { Game } from "../index";

describe('Basic Functionality Checks',() => {
    
    it('Playing a Move', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})

        expect(testGame.getSpotOnBoard({floor: 0, row: 0, col: 0})).equals(testGame.playerOne.marker)
    })

    it('Preventing a Player from playing twice in a row', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})
        testGame.playerOne.plays({floor: 0, row: 0, col: 1})

        expect(testGame.getSpotOnBoard({floor: 0, row: 0, col: 1})).equals('.')
    })

    it("Player Two can't play first ", () => {
        const testGame = new Game(4)
        testGame.playerTwo.plays({floor: 0, row: 0, col: 0})

        expect(testGame.getSpotOnBoard({floor: 0, row: 0, col: 0})).equals('.')
    })

    it('Preventing a Player from playing in an occupied spot', () => {

        const testGame = new Game(4)
        testGame.playerOne.plays({floor: 0, row: 0, col: 0})
        testGame.playerTwo.plays({floor: 0, row: 0, col: 0})

        expect(testGame.getSpotOnBoard({floor: 0, row: 0, col: 0})).equals(testGame.playerOne.marker)

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