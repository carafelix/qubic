import { expect } from "chai";
import { Floor, Game, full3Dboard } from "..";

describe('Basic Functionality Checks',() => {
    
    it('Playing a Move', () => {
        const testGame = new Game(4)
        testGame.setPlayIntoBoard({floor: 1, row: 1, col: 1, player: 'x'})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 1})).equals('x')
    })
})

describe('Basic Functionality Checks',() => {
    
    it('Playing a Move', () => {

        const testGame = new Game(4)
        testGame.setPlayIntoBoard({floor: 1, row: 1, col: 1, player: 'x'})

        expect(testGame.getSpotOnBoard({floor: 1, row: 1, col: 1})).equals('x')
    })

})