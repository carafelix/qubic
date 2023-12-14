// definition for playing on a 3x3x3 or 4x4x4, 5x5x5, etc.
const gridSize = 4;

const xWinCondition = 'xxxx'; // 1 = x
const oWinCondition = 'oooo'; // 2 = o

type Marker = 'x' | 'o';

class Floor extends Array<string[]>{

    checkColumnWin = (playerMarker : Marker) => {
        const pattern = (playerMarker + '.'.repeat(this.length)).repeat(this.length-1) + playerMarker
        return new RegExp(pattern).test(this.stringMask())
    }

    checkRowWin = (playerMarker : Marker) => {

        return new RegExp(`${playerMarker.repeat(this.length)}`).test(this.stringMask())
              
    }

    checkDiagonalWin = (playerMarker : Marker) => {

    }

    private stringMask = () => {
        return this.join('-').replace(/,/g, '')
    }
    
}


const gameBoard = ( (size) => {

    return new Array(size).fill(null).map(
                                    _=>new Floor(size).fill([]).map(
                                        floor=>new Array(size).fill(null).map(row=>'.')
                                    ) as Floor
    )

})(gridSize);

gameBoard[0][0][1] = 'o'
gameBoard[0][0][0] = 'x'
gameBoard[0][1][0] = 'x'
gameBoard[0][2][0] = 'x'
gameBoard[0][3][0] = 'x'

console.log(gameBoard[0])
console.log(gameBoard[0].checkColumnWin('x'));




`
         ________________
        /   /   /   /   /|
       /___/___/___/___/ |
      /   /   /   /   /  |
     /___/___/___/___/   |
    /   /   /   /   /    |
   /___/___/___/___/     |
  /   /   /   /   /      |
 /___/___/___/___/       |
|       |________|_______|
|       /   /   /|  /   /|
|      /___/___/_|_/___/ |
|     /   /   /  |/   /  |
|    /___/___/___|___/   |
|   /   /   /   /|  /    |
|  /___/___/___/_|_/     |
| /   /   /   /  |/      |
|/___/___/___/___|       |
|       |________|_______|
|       /   /   /|  /   /|
|      /___/___/_|_/___/ |
|     /   /   /  |/   /  |
|    /___/___/___|___/   |
|   /   /   /   /|  /    |
|  /___/___/___/_|_/     |
| /   /   /   /  |/      |
|/___/___/___/___|       |
|       |________|_______|
|       /   /   /|  /   /
|      /___/___/_|_/___/
|     /   /   /  |/   /
|    /___/___/___|___/
|   /   /   /   /|  /
|  /___/___/___/_|_/
| /   /   /   /  |/
|/___/___/___/___|
`
